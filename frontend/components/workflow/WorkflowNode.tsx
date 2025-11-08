'use client'

import { memo, useState, useEffect, useRef } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { 
  Zap, 
  Database, 
  Mail, 
  FileText, 
  Webhook, 
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Settings,
  CheckCircle
} from 'lucide-react'

// Icon mapping for different tools/action types
const getIcon = (tool: string, actionType: string) => {
  const toolLower = tool?.toLowerCase() || ''
  const actionLower = actionType?.toLowerCase() || ''
  
  if (toolLower.includes('airtable') || toolLower.includes('database') || toolLower.includes('crm')) {
    return <Database className="h-5 w-5" />
  }
  if (toolLower.includes('email') || toolLower.includes('mail') || toolLower.includes('sendgrid')) {
    return <Mail className="h-5 w-5" />
  }
  if (toolLower.includes('form') || toolLower.includes('typeform')) {
    return <FileText className="h-5 w-5" />
  }
  if (toolLower.includes('webhook') || toolLower.includes('api')) {
    return <Webhook className="h-5 w-5" />
  }
  if (actionLower.includes('trigger') || actionLower.includes('start')) {
    return <PlayCircle className="h-5 w-5" />
  }
  if (actionLower.includes('complete') || actionLower.includes('finish')) {
    return <CheckCircle2 className="h-5 w-5" />
  }
  
  return <Zap className="h-5 w-5" />
}

// Color mapping for different action types
const getColorScheme = (actionType: string) => {
  const actionLower = actionType?.toLowerCase() || ''
  
  if (actionLower.includes('trigger') || actionLower.includes('start')) {
    return {
      bg: 'bg-blue-50/50',
      border: 'border-blue-200/50',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
    }
  }
  if (actionLower.includes('action') || actionLower.includes('process')) {
    return {
      bg: 'bg-purple-50/50',
      border: 'border-purple-200/50',
      icon: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
    }
  }
  if (actionLower.includes('complete') || actionLower.includes('finish')) {
    return {
      bg: 'bg-green-50/50',
      border: 'border-green-200/50',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700 border-green-200',
    }
  }
  
  return {
    bg: 'bg-muted/30',
    border: 'border-border',
    icon: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground border-border',
  }
}

interface WorkflowNodeProps extends NodeProps<any> {
  onNodeClick?: (nodeData: {
    id: string
    label: string
    tool: string
    actionType: string
    description: string
    stepNumber: number
  }) => void
  onNodeHover?: (nodeData: {
    label: string
    tool: string
    actionType: string
    description: string
    stepNumber: number
  }, position: { x: number; y: number }) => void
  onNodeHoverEnd?: () => void
  onConfigure?: (nodeId: string) => void
  isConfigured?: boolean
}

function WorkflowNode({ data, selected, onNodeClick, onNodeHover, onNodeHoverEnd, onConfigure, isConfigured }: WorkflowNodeProps) {
  const tool = data.tool || 'Unknown'
  const actionType = data.action_type || 'Action'
  const label = data.label || 'Step'
  const description = data.description || ''
  const stepNumber = data.stepNumber || 1
  
  const colors = getColorScheme(actionType)
  const Icon = getIcon(tool, actionType)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger node click if clicking the config button
    if ((e.target as HTMLElement).closest('.node-config-button')) {
      return
    }
    if (onNodeClick) {
      onNodeClick({
        id: data.id || `step-${stepNumber}`,
        label,
        tool,
        actionType,
        description,
        stepNumber,
      })
    }
  }

  const handleConfigureClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (onConfigure) {
      onConfigure(data.id || `step-${stepNumber}`)
    }
  }

  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  const handleMouseEnter = () => {
    // Add a delay before showing tooltip to avoid blocking interactions
    const timeout = setTimeout(() => {
      // Use ref to check if the node element still exists before showing tooltip
      if (onNodeHover && nodeRef.current) {
        // Get current position from the ref element
        const rect = nodeRef.current.getBoundingClientRect()
        onNodeHover(
          { label, tool, actionType, description, stepNumber },
          { x: rect.left + rect.width / 2, y: rect.bottom + 16 }
        )
      }
    }, 800) // 800ms delay - longer delay to avoid accidental triggers
    setHoverTimeout(timeout)
  }

  const handleMouseLeave = () => {
    // Clear timeout if mouse leaves before delay
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    if (onNodeHoverEnd) {
      onNodeHoverEnd()
    }
  }

  const handleSettingsMouseEnter = () => {
    // Hide tooltip immediately when hovering over settings button
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    if (onNodeHoverEnd) {
      onNodeHoverEnd()
    }
  }

  return (
    <div
      ref={nodeRef}
      className={`
        relative group
        bg-card
        border border-border
        rounded-xl
        shadow-sm hover:shadow-lg
        transition-all duration-200
        w-[300px]
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${onNodeClick ? 'cursor-pointer' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Hidden handles for edge connections (read-only view) */}
      {/* React Flow requires handles for edges to connect properly */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{ opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{ opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />

      {/* Node Content */}
      <div className="p-5">
        {/* Step Number & Icon Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Step Number Badge */}
            <div className={`
              flex items-center justify-center
              w-8 h-8 rounded-lg
              ${colors.badge}
              font-semibold text-sm
              shrink-0
              leading-none
            `}>
              <span className="flex items-center justify-center w-full h-full">{stepNumber}</span>
            </div>
            
            {/* Icon */}
            <div className={`
              flex items-center justify-center
              w-10 h-10 rounded-lg
              bg-muted/50
              border border-border
              ${colors.icon}
              shrink-0
            `}>
              <span className="flex items-center justify-center w-full h-full">{Icon}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Configuration Status Indicator */}
            {isConfigured && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30" title="Configured">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            )}
            
            {/* Configuration Button */}
            {onConfigure && (
              <button
                onClick={handleConfigureClick}
                onMouseEnter={handleSettingsMouseEnter}
                className="node-config-button p-1.5 hover:bg-muted rounded-md transition-colors opacity-60 hover:opacity-100 group-hover:opacity-100 relative z-10"
                title="Configure connection"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            
            {/* Arrow indicator */}
            <ArrowRight className={`h-4 w-4 ${colors.icon} opacity-40 shrink-0`} />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-foreground mb-2 leading-tight">
          {label}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {description}
          </p>
        )}

        {/* Tool & Action Type Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`
            inline-flex items-center justify-center
            text-xs px-2.5 py-1.5 rounded-md font-medium
            ${colors.badge}
            border ${colors.border}
            h-6
            leading-none
          `}>
            {tool}
          </span>
          <span className="inline-flex items-center justify-center text-xs px-2.5 py-1.5 rounded-md bg-muted text-muted-foreground font-medium border border-border h-6 leading-none">
            {actionType}
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(WorkflowNode)

