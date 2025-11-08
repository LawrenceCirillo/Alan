'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: 'user' | 'assistant' | 'system'
  children: React.ReactNode
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ from, className, children, ...props }, ref) => {
    // Cursor-style: User messages have background, AI messages are inline (no background)
    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full mb-4',
          from === 'user' ? 'justify-end' : 'justify-start',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'max-w-[85%]',
            from === 'user'
              ? 'bg-muted/60 text-foreground rounded-lg px-3 py-2 border border-border/50' // User: slight background
              : 'text-foreground', // AI: no background, inline text
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)
Message.displayName = 'Message'

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-sm leading-relaxed', className)}
      {...props}
    />
  )
})
MessageContent.displayName = 'MessageContent'

export { Message, MessageContent }

