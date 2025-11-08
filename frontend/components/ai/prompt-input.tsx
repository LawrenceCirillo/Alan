'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading?: boolean
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ className, onSubmit, isLoading, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [props.value])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (onSubmit) {
          onSubmit(e as any)
        }
      }
    }

    return (
      <form onSubmit={onSubmit} className="relative w-full px-6 pb-6">
        <div className="relative">
          <textarea
            ref={ref || textareaRef}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full min-h-[96px] max-h-[320px] p-4 pr-12',
              'border border-border rounded-lg',
              'bg-background text-foreground',
              'placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'resize-none text-sm leading-relaxed',
              'transition-all duration-200',
              className
            )}
            disabled={isLoading}
            {...props}
          />
          <button
            type="submit"
            disabled={!props.value || isLoading}
            className={cn(
              'absolute right-8 bottom-6',
              'p-2 rounded-md',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-muted',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-colors duration-150',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            title="Send (Cmd/Ctrl + Enter)"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    )
  }
)
PromptInput.displayName = 'PromptInput'

export { PromptInput }

