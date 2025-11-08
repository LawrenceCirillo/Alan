'use client'

import { useState, useId } from 'react'
import { Loader2, Key } from 'lucide-react'

interface ApiKeyInputProps {
  service: string
  toolCallId: string
  onSubmit: (args: { toolCallId: string; result: string }) => Promise<void>
}

export function ApiKeyInput({ service, toolCallId, onSubmit }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        toolCallId,
        result: apiKey.trim(),
      })
      setApiKey('')
    } catch (error) {
      console.error('Error submitting API key:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="my-3 p-4 bg-muted/40 border border-border/50 rounded-md">
      <div className="flex items-start gap-3 mb-3">
        <Key className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-1">
            API Key Required
          </p>
          <p className="text-xs text-muted-foreground">
            Please provide your {service} API key to continue with workflow generation.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          id={inputId}
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={`Enter your ${service} API key`}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          disabled={isSubmitting}
          autoFocus
        />
        <button
          type="submit"
          disabled={!apiKey.trim() || isSubmitting}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Submit'
          )}
        </button>
      </form>
      <p className="text-xs text-muted-foreground mt-2">
        Your API key will be securely stored and used only for this workflow.
      </p>
    </div>
  )
}

