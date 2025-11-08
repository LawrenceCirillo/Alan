'use client'

import * as React from 'react'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReasoningProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  isStreaming?: boolean
  defaultOpen?: boolean
}

const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  ({ className, children, isStreaming = false, defaultOpen = true, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    React.useEffect(() => {
      if (!isStreaming) {
        setIsOpen(false)
      }
    }, [isStreaming])

    return (
      <div
        ref={ref}
        className={cn(
          'my-2 border border-border/30 rounded-md bg-muted/20', // Lighter opacity like Cursor
          'opacity-70', // Make it lighter
          className
        )}
        {...props}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2',
            'hover:bg-muted/40 transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-ring rounded-md'
          )}
        >
          <div className="flex items-center gap-2">
            {isStreaming && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/60" />
            )}
            <span className="text-xs font-medium text-muted-foreground/70">
              {isStreaming ? 'Thinking...' : 'Reasoning'}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/60" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
          )}
        </button>
        {isOpen && (
          <div className="px-3 pb-3 space-y-1.5">
            {children}
          </div>
        )}
      </div>
    )
  }
)
Reasoning.displayName = 'Reasoning'

const ReasoningStep = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-start gap-2 text-xs text-muted-foreground/80',
        'animate-in fade-in slide-in-from-left-2 duration-200',
        className
      )}
      {...props}
    >
      <div className="mt-1 h-1 w-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </div>
  )
})
ReasoningStep.displayName = 'ReasoningStep'

export { Reasoning, ReasoningStep }

