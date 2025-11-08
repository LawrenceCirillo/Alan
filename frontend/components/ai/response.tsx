'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Response = React.forwardRef<HTMLDivElement, ResponseProps>(
  ({ className, children, ...props }, ref) => {
    // Cursor-style: Clean, inline text with no background
    return (
      <div
        ref={ref}
        className={cn(
          'text-sm leading-relaxed whitespace-pre-wrap break-words',
          'text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Response.displayName = 'Response'

export { Response }

