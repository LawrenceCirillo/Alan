'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col h-full', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Conversation.displayName = 'Conversation'

const ConversationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const isScrollingRef = React.useRef(false)

  React.useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (contentRef.current && !isScrollingRef.current) {
      const element = contentRef.current
      const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 150
      
      if (isNearBottom) {
        isScrollingRef.current = true
        requestAnimationFrame(() => {
          if (element) {
            element.scrollTop = element.scrollHeight
            setTimeout(() => {
              isScrollingRef.current = false
            }, 100)
          }
        })
      }
    }
  }, [children])

  return (
    <div
      ref={ref || contentRef}
      className={cn(
        'flex-1 overflow-y-auto space-y-4 px-6 py-6 min-h-0',
        className
      )}
      style={{ 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
      {...props}
    >
      {children}
    </div>
  )
})
ConversationContent.displayName = 'ConversationContent'

export { Conversation, ConversationContent }

