'use client'

import * as React from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  status?: 'pending' | 'complete' | 'error'
  children?: React.ReactNode
}

const Tool = React.forwardRef<HTMLDivElement, ToolProps>(
  ({ className, name, status = 'pending', children, ...props }, ref) => {
    const getStatusIcon = () => {
      switch (status) {
        case 'complete':
          return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        case 'error':
          return <XCircle className="h-4 w-4 text-destructive" />
        default:
          return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'my-2 p-2.5 bg-muted/20 border border-border/30 rounded-md',
          'opacity-70 transition-all duration-200',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 mb-1">
          {getStatusIcon()}
          <span className="text-xs font-medium text-muted-foreground/80">
            {name}
          </span>
        </div>
        {children && (
          <div className="mt-1 text-xs text-muted-foreground/70">
            {children}
          </div>
        )}
      </div>
    )
  }
)
Tool.displayName = 'Tool'

export { Tool }

