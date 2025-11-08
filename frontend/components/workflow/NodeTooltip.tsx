'use client'

import { Info } from 'lucide-react'

interface NodeTooltipProps {
  nodeData: {
    label: string
    tool: string
    actionType: string
    description: string
    stepNumber: number
  }
  position: { x: number; y: number }
  visible: boolean
  zoomLevel?: number
}

export default function NodeTooltip({ nodeData, position, visible, zoomLevel = 1 }: NodeTooltipProps) {
  if (!visible) return null

  // Scale tooltip size inversely with zoom - when zoomed in, make it smaller
  // Base size at zoom 0.5, scale down as zoom increases to prevent overlap
  const baseZoom = 0.5
  const scale = Math.max(0.65, Math.min(1.0, baseZoom / Math.max(zoomLevel, 0.3)))
  const tooltipWidth = Math.min(256 * scale, 240) // Base width 256px, max 240px
  const tooltipPadding = Math.max(10, 12 * scale)
  
  // Adjust position to prevent overflow - position tooltip below node by default
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const tooltipOffset = 12 // Distance from node
  // Center tooltip horizontally on node, position below
  const adjustedX = Math.max(10, Math.min(position.x - tooltipWidth / 2, viewportWidth - tooltipWidth - 10))
  const adjustedY = position.y + tooltipOffset // Position below node
  
  // Font sizes scale with zoom
  const titleFontSize = 14 * scale
  const bodyFontSize = 13 * scale
  const labelFontSize = 11 * scale
  const descFontSize = 12 * scale

  return (
    <div
      className="fixed bg-card border border-border rounded-lg shadow-xl pointer-events-none z-[9998]"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        transform: 'none', // Position below, no vertical centering
        width: `${tooltipWidth}px`,
        padding: `${tooltipPadding}px`,
        maxWidth: 'min(90vw, 280px)', // Prevent overflow on small screens
        maxHeight: 'min(80vh, 400px)', // Prevent overflow vertically
        overflow: 'auto',
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" style={{ fontSize: `${titleFontSize}px` }} />
        <h4 className="font-semibold text-foreground" style={{ fontSize: `${titleFontSize}px` }}>
          {nodeData.label}
        </h4>
      </div>
      <div className="space-y-1.5">
        <div>
          <span className="font-semibold text-muted-foreground" style={{ fontSize: `${labelFontSize}px` }}>
            Tool:
          </span>
          <p className="font-medium text-foreground" style={{ fontSize: `${bodyFontSize}px` }}>
            {nodeData.tool}
          </p>
        </div>
        <div>
          <span className="font-semibold text-muted-foreground" style={{ fontSize: `${labelFontSize}px` }}>
            Action Type:
          </span>
          <p className="font-medium text-foreground" style={{ fontSize: `${bodyFontSize}px` }}>
            {nodeData.actionType}
          </p>
        </div>
        {nodeData.description && (
          <div>
            <span className="font-semibold text-muted-foreground" style={{ fontSize: `${labelFontSize}px` }}>
              Description:
            </span>
            <p className="text-foreground" style={{ fontSize: `${descFontSize}px` }}>
              {nodeData.description}
            </p>
          </div>
        )}
        <div>
          <span className="font-semibold text-muted-foreground" style={{ fontSize: `${labelFontSize}px` }}>
            Step:
          </span>
          <p className="font-medium text-foreground" style={{ fontSize: `${bodyFontSize}px` }}>
            Step {nodeData.stepNumber}
          </p>
        </div>
      </div>
      {/* Tooltip arrow - pointing up to the node */}
      <div 
        className="absolute bg-card border-l border-t border-border rotate-45"
        style={{
          left: '50%',
          top: `${-6 * scale}px`,
          transform: 'translateX(-50%)',
          width: `${12 * scale}px`,
          height: `${12 * scale}px`,
        }}
      />
    </div>
  )
}

