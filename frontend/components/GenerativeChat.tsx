'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat, UseChatHelpers } from 'ai/react'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { WorkflowBlueprintData } from '@/types/workflow'
import { ApiKeyInput } from '@/components/ai/ApiKeyInput'
import { OptionSelector } from '@/components/ai/OptionSelector'
import { Message, MessageContent } from '@/components/ai/message'
import { Response } from '@/components/ai/response'
import { Conversation, ConversationContent } from '@/components/ai/conversation'
import { PromptInput } from '@/components/ai/prompt-input'
import { Tool } from '@/components/ai/tool'

interface GenerativeChatProps {
  chat?: UseChatHelpers // Optional - if provided, use it; otherwise create new
  onBlueprintGenerated: (blueprint: WorkflowBlueprintData) => void
  onGenerationStart: () => void
  onChatStart: () => void
  isGenerating: boolean
  blueprint?: WorkflowBlueprintData | null // Pass blueprint to show in chat
  parentChatStarted?: boolean // Parent's isChatStarted state
  onReferenceNode?: (nodeData: {
    id: string
    label: string
    tool: string
    actionType: string
    description: string
    stepNumber: number
  }) => void // Callback to handle node references
}

// Suggested prompts for the minimal welcome state
const SUGGESTED_PROMPTS = [
  "When a lead fills out my Typeform, add them to Airtable and send a welcome email",
  "When I receive an email from a customer, create a task in Trello",
  "When a new order comes in, update the inventory spreadsheet and notify the team on Slack",
  "When a contact is added to my CRM, send them a personalized email sequence",
]

export default function GenerativeChat({
  chat: providedChat,
  onBlueprintGenerated,
  onGenerationStart,
  onChatStart,
  isGenerating,
  blueprint,
  parentChatStarted = false,
  onReferenceNode,
}: GenerativeChatProps) {
  const [isChatStarted, setIsChatStarted] = useState(false)
  
  // Use parent state if provided, otherwise use local state
  const chatStarted = parentChatStarted || isChatStarted
  const [error, setError] = useState<string | null>(null)
  const [submittedToolResults, setSubmittedToolResults] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Use provided chat - should always be provided from parent
  // This ensures messages persist across layout changes
  // Create fallback only if not provided (shouldn't happen in normal flow)
  const fallbackChat = useChat({ api: '/api/chat', id: 'fallback-chat' })
  const chat = providedChat || fallbackChat
  const { messages, input, handleInputChange, handleSubmit, append, isLoading, setInput } = chat

  // Handle node references - this prop will be called from parent
  useEffect(() => {
    // The onReferenceNode callback is handled by the parent component
    // This effect is kept for potential future use
  }, [onReferenceNode])

  // Function to submit tool results
  const submitToolResult = async ({ toolCallId, result }: { toolCallId: string; result: string }) => {
    try {
      // Mark this tool as submitted
      setSubmittedToolResults((prev) => ({ ...prev, [toolCallId]: result }))
      
      // Submit tool result by appending a tool message
      // The useChat hook will handle sending this to the API
      await append({
        role: 'tool',
        content: result,
        toolCallId,
      } as any)
    } catch (error) {
      console.error('Error submitting tool result:', error)
      throw error
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    // Populate the input field with the suggestion
    // User can edit or send as-is
    setInput(suggestion)
    // Focus the input field
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  // Watch for workflow blueprint tool calls and notify parent
  useEffect(() => {
    // Check all messages for blueprint tool calls
    messages.forEach((message) => {
      if (message.toolInvocations) {
        message.toolInvocations.forEach((toolCall: any) => {
          if (toolCall.toolName === 'renderWorkflowBlueprint' && toolCall.args) {
            // Notify parent that a blueprint was generated
            onBlueprintGenerated(toolCall.args)
            onGenerationStart() // Mark generation as started
          }
        })
      }
    })
  }, [messages, onBlueprintGenerated, onGenerationStart])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Mark chat as started immediately (before API call)
    setIsChatStarted(true)
    onChatStart()
    setError(null)

    // Use the useChat handleSubmit - workflow generation now happens in the API route
    handleSubmit(e)
  }

  // Stage 1: Minimal Welcome View
  // Show welcome ONLY if chat hasn't started yet
  // Once chat starts, NEVER show welcome screen again (even if messages are empty)
  const hasMessages = Array.isArray(messages) && messages.length > 0
  
  // Debug logging
  console.log('[GenerativeChat] State:', {
    hasMessages,
    messageCount: messages.length,
    chatStarted,
    parentChatStarted,
    isChatStarted,
  })
  
  if (!chatStarted) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          {/* Welcome Message */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-semibold tracking-tight text-foreground mb-4">
              What can we do today?
            </h2>
            <p className="text-muted-foreground text-lg mb-2">
              Describe your business goal in plain English
            </p>
            <p className="text-muted-foreground text-sm">
              Alan will create a custom workflow automation for you
            </p>
          </div>

          {/* Suggested Prompts */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Try these examples
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTED_PROMPTS.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 text-sm bg-muted/40 hover:bg-muted/60 border border-border hover:border-foreground/20 rounded-md text-foreground transition-all duration-150 hover:shadow-xs active:scale-[0.99] cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors mt-0.5">
                      →
                    </span>
                    <span className="flex-1 leading-relaxed">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleFormSubmit} className="relative w-full">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Describe your automation goal..."
                className="w-full h-24 p-4 pr-12 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-sm leading-relaxed"
                disabled={isLoading || isGenerating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleFormSubmit(e as any)
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isGenerating}
                className="absolute bottom-3 right-3 z-10 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
                title="Send (Cmd/Ctrl + Enter)"
              >
                {isLoading || isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Stage 2: Full Chat View
  // Always show chat view once started, even if no messages yet
  const messagesToRender = Array.isArray(messages) ? messages : []
  
  console.log('[GenerativeChat] Rendering chat with messages:', messagesToRender.length)
  
  return (
    <Conversation className="h-full">
      <ConversationContent>
        {/* Show empty state only if chat hasn't started */}
        {messagesToRender.length === 0 && !chatStarted && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Your conversation will appear here...</p>
          </div>
        )}
        
        {messagesToRender.map((message) => {
          // Clean content - handle both JSON and streaming format
          let cleanContent = message.content || ''
          
          // If content is a JSON string, parse it
          if (typeof cleanContent === 'string') {
            // Check if it's a JSON object string
            if (cleanContent.trim().startsWith('{') && cleanContent.includes('"content"')) {
              try {
                const parsed = JSON.parse(cleanContent)
                cleanContent = parsed.content || parsed.text || cleanContent
              } catch {
                // Not valid JSON, continue with cleaning
              }
            }
            
            // Clean raw streaming format if present (shouldn't happen with proper SSE, but safety net)
            if (cleanContent.includes('0:"')) {
              cleanContent = cleanContent
                .replace(/\d+:"([^"]*)"/g, '$1')
                .replace(/d:\{"finishReason":"stop"\}\s*/gi, '')
                .trim()
            }
          }
          
          // Skip empty messages
          if (!cleanContent || cleanContent.length === 0) {
            return null
          }
          
          return (
          <Message key={message.id} from={message.role as 'user' | 'assistant'}>
            <MessageContent>
              <Response>{cleanContent}</Response>
              
              {/* Tool Invocations */}
              {message.toolInvocations?.map((toolCall: any) => {
                const isSubmitted = submittedToolResults[toolCall.toolCallId]
                
                if (isSubmitted) {
                  return (
                    <Tool
                      key={toolCall.toolCallId}
                      name={toolCall.toolName}
                      status="complete"
                    >
                      {toolCall.toolName === 'askForApiKey' && (
                        <>{toolCall.args.service} API key saved!</>
                      )}
                      {toolCall.toolName === 'askForSelection' && (
                        <>Selected: {isSubmitted}</>
                      )}
                    </Tool>
                  )
                }
                
                if (toolCall.toolName === 'askForApiKey') {
                  return (
                    <div key={toolCall.toolCallId} className="mt-2">
                      <ApiKeyInput
                        service={toolCall.args.service}
                        toolCallId={toolCall.toolCallId}
                        onSubmit={submitToolResult}
                      />
                    </div>
                  )
                }
                
                if (toolCall.toolName === 'askForSelection') {
                  return (
                    <div key={toolCall.toolCallId} className="mt-2">
                      <OptionSelector
                        title={toolCall.args.title}
                        options={toolCall.args.options}
                        toolCallId={toolCall.toolCallId}
                        onSubmit={submitToolResult}
                      />
                    </div>
                  )
                }
                
                // Blueprint rendering is handled by the parent component
                // We just mark it as complete here
                if (toolCall.toolName === 'renderWorkflowBlueprint') {
                  return (
                    <Tool key={toolCall.toolCallId} name="Workflow Blueprint" status="complete">
                      Workflow blueprint generated with {toolCall.args?.nodes?.length || 0} steps
                    </Tool>
                  )
                }
                
                return (
                  <Tool key={toolCall.toolCallId} name={toolCall.toolName} status="pending">
                    {toolCall.args && JSON.stringify(toolCall.args)}
                  </Tool>
                )
              })}
            </MessageContent>
          </Message>
        )})}
        
        {/* Loading indicator - Show while waiting for response */}
        {isLoading && (
          <Message from="assistant">
            <MessageContent>
              <Tool name="Thinking..." status="pending" className="opacity-50" />
            </MessageContent>
          </Message>
        )}
      </ConversationContent>

      {/* Error Display */}
      {error && (
        <div className="px-6 pb-2">
          <div className="px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <PromptInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleFormSubmit}
        placeholder="Describe your automation goal..."
        isLoading={isLoading || isGenerating}
        disabled={isLoading || isGenerating}
      />
    </Conversation>
  )
}
