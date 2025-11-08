'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

interface OptionSelectorProps {
  title: string
  options: string[]
  toolCallId: string
  onSubmit: (args: { toolCallId: string; result: string }) => Promise<void>
}

export function OptionSelector({ title, options, toolCallId, onSubmit }: OptionSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (option: string) => {
    if (isSubmitting) return

    setSelectedOption(option)
    setIsSubmitting(true)
    try {
      await onSubmit({
        toolCallId,
        result: option,
      })
    } catch (error) {
      console.error('Error submitting selection:', error)
      setIsSubmitting(false)
      setSelectedOption(null)
    }
  }

  return (
    <div className="my-3 p-4 bg-muted/40 border border-border/50 rounded-md">
      <p className="text-sm font-medium text-foreground mb-3">{title}</p>
      <div className="space-y-2">
        {options.map((option, index) => {
          const isSelected = selectedOption === option
          const isDisabled = isSubmitting && !isSelected

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSubmit(option)}
              disabled={isDisabled}
              className={`w-full text-left px-4 py-3 text-sm rounded-md border transition-all duration-150 ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-foreground/20 hover:bg-muted/60'
              } disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between group`}
            >
              <span className="flex-1">{option}</span>
              {isSelected && isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              )}
              {isSelected && !isSubmitting && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

