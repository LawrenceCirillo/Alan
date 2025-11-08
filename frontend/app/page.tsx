'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import { useChat } from 'ai/react'
import GenerativeChat from '@/components/GenerativeChat'
import AnimatedWorkflowBlueprint from '@/components/AnimatedWorkflowBlueprint'
import { WorkflowBlueprintData } from '@/types/workflow'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Home() {
  const [blueprint, setBlueprint] = useState<WorkflowBlueprintData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isChatStarted, setIsChatStarted] = useState(false)

  // Lift chat state to parent so it persists
  const chat = useChat({
    api: '/api/chat',
    id: 'main-chat',
  })

  const handleBlueprintGenerated = (blueprintData: WorkflowBlueprintData) => {
    setBlueprint(blueprintData)
    setIsGenerating(false)
  }

  const handleGenerationStart = () => {
    setIsGenerating(true)
    setBlueprint(null)
  }

  const handleChatStart = () => {
    setIsChatStarted(true)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Single container - layout changes with CSS only */}
      <div className={`
        h-screen flex relative
        ${!isChatStarted ? 'items-center justify-center' : 'flex-col'}
      `}>
        {/* Floating User Icon - Only visible after chat starts */}
        {isChatStarted && (
          <div className="absolute top-4 right-4 z-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-2 hover:bg-muted/80 bg-background/80 backdrop-blur-sm border border-border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <User className="h-5 w-5 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/workflows" className="cursor-pointer">
                    My Workflows
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/demo" className="cursor-pointer">
                    Demo
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Main Content - Always rendered, layout changes with CSS */}
        <div className={`
          flex gap-0 overflow-hidden
          ${!isChatStarted 
            ? 'w-full max-w-3xl px-6' 
            : 'flex-1 w-full'
          }
        `}>
          {/* Chat - Always rendered in same position */}
          <div className={`
            flex flex-col overflow-hidden
            ${!isChatStarted 
              ? 'w-full' 
              : 'w-[40%] border-r border-border bg-card'
            }
          `}>
            <GenerativeChat
              chat={chat}
              parentChatStarted={isChatStarted}
              onBlueprintGenerated={handleBlueprintGenerated}
              onGenerationStart={handleGenerationStart}
              onChatStart={handleChatStart}
              isGenerating={isGenerating}
              onReferenceNode={(nodeData) => {
                // Reference the node in chat
                const reference = `Regarding step ${nodeData.stepNumber} (${nodeData.label}): `
                chat.setInput(reference)
                // Focus the input after a brief delay to ensure it's rendered
                setTimeout(() => {
                  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                  if (textarea) {
                    textarea.focus()
                    textarea.setSelectionRange(reference.length, reference.length)
                  }
                }, 100)
              }}
            />
          </div>

          {/* Blueprint Viewer - Only visible after chat starts */}
          {isChatStarted && (
            <div className="w-[60%] bg-background flex flex-col overflow-hidden">
              {blueprint ? (
                <div className="flex-1 flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">
                      Workflow Blueprint
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {blueprint.goal}
                    </p>
                  </div>
                  <div className="flex-1 min-h-0">
                    <AnimatedWorkflowBlueprint 
                      blueprint={blueprint}
                      onReferenceNodeInChat={(nodeData) => {
                        // Reference the node in chat
                        const reference = `Regarding step ${nodeData.stepNumber} (${nodeData.label}): `
                        chat.setInput(reference)
                        // Focus the input after a brief delay to ensure it's rendered
                        setTimeout(() => {
                          const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                          if (textarea) {
                            textarea.focus()
                            textarea.setSelectionRange(reference.length, reference.length)
                          }
                        }, 100)
                      }}
                    />
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="flex items-center justify-center flex-1">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground font-medium">Generating workflow diagram...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 border border-dashed border-border rounded-lg m-6 bg-muted/30">
                  <div className="text-center px-8">
                    <p className="text-sm text-muted-foreground font-medium mb-1">
                      Workflow diagram will appear here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your visual workflow is being created
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

