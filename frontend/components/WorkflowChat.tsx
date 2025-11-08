'use client'

import { useState } from 'react'
import { WorkflowBlueprintData } from '@/types/workflow'
import { Send, Loader2, Sparkles } from 'lucide-react'

interface WorkflowChatProps {
  onBlueprintGenerated: (blueprint: WorkflowBlueprintData) => void
  onGenerationStart: () => void
  isGenerating: boolean
}

// Suggested prompts for easy testing
const SUGGESTED_PROMPTS = [
  "When a lead fills out my Typeform, add them to Airtable and send a welcome email",
  "When I receive an email from a customer, create a task in Trello",
  "When a new order comes in, update the inventory spreadsheet and notify the team on Slack",
  "When a contact is added to my CRM, send them a personalized email sequence",
  "When someone subscribes to my newsletter, add them to Mailchimp and send a welcome series",
]

export default function WorkflowChat({
  onBlueprintGenerated,
  onGenerationStart,
  isGenerating,
}: WorkflowChatProps) {
  const [goal, setGoal] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSuggestionClick = (suggestion: string) => {
    setGoal(suggestion)
    setError(null)
    // Focus the textarea after setting the value
    setTimeout(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.focus()
        // Move cursor to end
        textarea.setSelectionRange(textarea.value.length, textarea.value.length)
      }
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim()) return

    setError(null)
    onGenerationStart()

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/workflow/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: goal.trim(),
          context: {},
        }),
      })

      if (!response.ok) {
        // Try to get detailed error message from backend
        let errorMessage = `Failed to generate workflow: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          }
        } catch {
          // If JSON parsing fails, use the status text
        }
        throw new Error(errorMessage)
      }

      const blueprint: WorkflowBlueprintData = await response.json()
      onBlueprintGenerated(blueprint)
      setGoal('') // Clear input after successful generation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate workflow'
      setError(errorMessage)
      console.error('Workflow generation error:', err)
    }
  }

  // Show suggestions only when textarea is empty and not generating
  const showSuggestions = !goal.trim() && !isGenerating

  return (
    <div className="flex flex-col h-full">
      {/* Suggested Prompts */}
      {showSuggestions && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Example Workflows</p>
          </div>
          <div className="flex flex-col gap-2">
            {SUGGESTED_PROMPTS.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 text-sm bg-muted/40 hover:bg-muted/60 border border-border hover:border-foreground/20 rounded-md text-foreground transition-all duration-150 hover:shadow-xs active:scale-[0.99] cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors mt-0.5">→</span>
                  <span className="flex-1 leading-relaxed">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div className="relative w-full" style={{ height: '192px' }}>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe your automation goal in natural language..."
            className="absolute inset-0 w-full h-full p-4 pr-12 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-sm leading-relaxed"
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
          />
          <button
            type="submit"
            disabled={!goal.trim() || isGenerating}
            className="absolute bottom-3 right-3 z-10 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
            title="Generate workflow (Cmd/Ctrl + Enter)"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
      </form>
    </div>
  )
}

