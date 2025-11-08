'use client'

import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react'
import { useReactFlow } from 'reactflow'

export default function WorkflowZoomControls() {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow()

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1.5 flex flex-col gap-1">
      <button
        onClick={() => zoomIn({ duration: 300 })}
        className="p-2 hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4 text-foreground" />
      </button>
      <button
        onClick={() => zoomOut({ duration: 300 })}
        className="p-2 hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4 text-foreground" />
      </button>
      <div className="h-px bg-border my-1" />
      <button
        onClick={() => fitView({ padding: 0.6, duration: 300 })}
        className="p-2 hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        title="Fit to view"
        aria-label="Fit to view"
      >
        <Maximize2 className="h-4 w-4 text-foreground" />
      </button>
      <button
        onClick={() => {
          zoomTo(0.5, { duration: 300 })
          setTimeout(() => fitView({ padding: 0.6, duration: 300 }), 100)
        }}
        className="p-2 hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        title="Reset view"
        aria-label="Reset view"
      >
        <RotateCcw className="h-4 w-4 text-foreground" />
      </button>
    </div>
  )
}

