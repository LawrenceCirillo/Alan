'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Send, Loader2, Sparkles, Key, List } from 'lucide-react'
import { ApiKeyInput } from '@/components/ai/ApiKeyInput'
import { OptionSelector } from '@/components/ai/OptionSelector'

// Demo tool invocations to show components
const DEMO_TOOL_CALLS = [
  {
    id: 'demo-api-key-1',
    toolName: 'askForApiKey',
    args: { service: 'Airtable' },
    message: 'To connect to Airtable, I need your API key.',
  },
  {
    id: 'demo-selection-1',
    toolName: 'askForSelection',
    args: {
      title: 'Which Airtable list should I add leads to?',
      options: ['Leads', 'Contacts', 'Customers', 'New List'],
    },
    message: 'Please select which list to use.',
  },
  {
    id: 'demo-api-key-2',
    toolName: 'askForApiKey',
    args: { service: 'SendGrid' },
    message: 'To send emails, I need your SendGrid API key.',
  },
]

export default function DemoPage() {
  const [isChatStarted, setIsChatStarted] = useState(false)
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [submittedResults, setSubmittedResults] = useState<Record<string, string>>({})

  const { messages, input, handleInputChange, handleSubmit, append, isLoading } = useChat({
    api: '/api/chat',
  })

  // Demo function to submit tool results
  const submitToolResult = async ({ toolCallId, result }: { toolCallId: string; result: string }) => {
    // Store the result
    setSubmittedResults((prev) => ({ ...prev, [toolCallId]: result }))
    
    // Show a confirmation message
    await append({
      role: 'assistant',
      content: `Thank you! I've received your input: "${result}". Continuing with workflow generation...`,
    })
    
    // Remove the active demo after a delay
    setTimeout(() => {
      setActiveDemo(null)
    }, 500)
  }

  const triggerDemo = (demoType: 'apiKey' | 'selection') => {
    setIsChatStarted(true)
    
    if (demoType === 'apiKey') {
      const demo = DEMO_TOOL_CALLS.find((d) => d.toolName === 'askForApiKey')
      if (demo) {
        append({
          role: 'assistant',
          content: demo.message,
        })
        setActiveDemo(demo.id)
      }
    } else if (demoType === 'selection') {
      const demo = DEMO_TOOL_CALLS.find((d) => d.toolName === 'askForSelection')
      if (demo) {
        append({
          role: 'assistant',
          content: demo.message,
        })
        setActiveDemo(demo.id)
      }
    }
  }

  const triggerFullDemo = () => {
    setIsChatStarted(true)
    
    // Simulate a conversation that triggers multiple tool calls
    append({
      role: 'user',
      content: 'I want to automate adding leads from Typeform to Airtable and send them a welcome email',
    })
    
    setTimeout(() => {
      append({
        role: 'assistant',
        content: "I understand your goal! To create this workflow, I'll need some information from you.",
      })
      
      // Show API key request
      setTimeout(() => {
        const demo = DEMO_TOOL_CALLS[0] // Airtable API key
        append({
          role: 'assistant',
          content: demo.message,
        })
        setTimeout(() => {
          setActiveDemo(demo.id)
        }, 100)
      }, 1000)
    }, 1500)
  }

  // Stage 1: Minimal Welcome View
  if (!isChatStarted) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12 max-w-[1600px]">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-semibold tracking-tighter text-foreground mb-3">
                  In-Chat Components Demo
                </h1>
                <p className="text-lg text-muted-foreground font-light">
                  See the interactive components in action
                </p>
              </div>
            </div>
            <div className="h-px bg-border"></div>
          </div>

          {/* Demo Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => triggerDemo('apiKey')}
              className="p-6 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">API Key Input</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                See how the AI requests API keys with a secure password input component.
              </p>
              <span className="text-xs text-primary font-medium group-hover:underline">
                Try it →
              </span>
            </button>

            <button
              onClick={() => triggerDemo('selection')}
              className="p-6 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <List className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Option Selector</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                See how the AI asks users to choose from a list of options with interactive buttons.
              </p>
              <span className="text-xs text-primary font-medium group-hover:underline">
                Try it →
              </span>
            </button>

            <button
              onClick={triggerFullDemo}
              className="p-6 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Full Demo</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                See a complete workflow conversation with multiple interactive components.
              </p>
              <span className="text-xs text-primary font-medium group-hover:underline">
                Try it →
              </span>
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-muted/30 border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">How it works:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Click any demo button to see the component in action</li>
              <li>Interactive components appear directly in the chat interface</li>
              <li>Submit values to see how they're handled</li>
              <li>Components work seamlessly within the chat flow</li>
            </ul>
          </div>
        </div>
      </main>
    )
  }

  // Stage 2: Full Chat View with Demo Components
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-[1600px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
                In-Chat Components Demo
              </h1>
              <p className="text-sm text-muted-foreground">
                Interactive components appear here when the AI needs user input
              </p>
            </div>
            <button
              onClick={() => {
                setIsChatStarted(false)
                setActiveDemo(null)
                setSubmittedResults({})
              }}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              Reset Demo
            </button>
          </div>
          <div className="h-px bg-border"></div>
        </div>

        {/* Chat Interface */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm max-w-4xl mx-auto">
          <div className="flex flex-col h-full min-h-[600px]">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-1">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {/* Message Content */}
                  {message.content && (
                    <div
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-md px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Demo Tool Invocations - Show active components */}
              {activeDemo && (
                <div className="space-y-2">
                  {(() => {
                    const demo = DEMO_TOOL_CALLS.find((d) => d.id === activeDemo)
                    if (!demo) return null

                    if (demo.toolName === 'askForApiKey' && !submittedResults[activeDemo]) {
                      return (
                        <div className="flex justify-start">
                          <div className="max-w-[80%]">
                            <ApiKeyInput
                              service={demo.args.service}
                              toolCallId={activeDemo}
                              onSubmit={submitToolResult}
                            />
                          </div>
                        </div>
                      )
                    }

                    if (demo.toolName === 'askForSelection' && !submittedResults[activeDemo]) {
                      return (
                        <div className="flex justify-start">
                          <div className="max-w-[80%]">
                            <OptionSelector
                              title={demo.args.title}
                              options={demo.args.options}
                              toolCallId={activeDemo}
                              onSubmit={submitToolResult}
                            />
                          </div>
                        </div>
                      )
                    }

                    return null
                  })()}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSubmit} className="relative w-full">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type a message or use the demo buttons above..."
                  className="w-full h-24 p-4 pr-12 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-sm leading-relaxed"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      handleSubmit(e as any)
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-3 right-3 z-10 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
                  title="Send (Cmd/Ctrl + Enter)"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Actions */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Quick demos:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => triggerDemo('apiKey')}
                  className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Show API Key Input
                </button>
                <button
                  onClick={() => triggerDemo('selection')}
                  className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Show Option Selector
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

