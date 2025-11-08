'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Actions = React.forwardRef<HTMLDivElement, ActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-3 flex-wrap', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Actions.displayName = 'Actions'

const ActionButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5',
        'px-3 py-1.5 rounded-md text-xs font-medium',
        'border border-border bg-background text-foreground',
        'hover:bg-muted/80',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'h-8',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
ActionButton.displayName = 'ActionButton'

const PrimaryActionButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5',
        'px-4 py-1.5 rounded-md text-xs font-semibold',
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'shadow-sm transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'ml-auto h-8',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
PrimaryActionButton.displayName = 'PrimaryActionButton'

export { Actions, ActionButton, PrimaryActionButton }

