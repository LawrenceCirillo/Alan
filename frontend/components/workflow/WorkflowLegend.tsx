'use client'

import { Database, Mail, PlayCircle, CheckCircle2, Zap } from 'lucide-react'

export default function WorkflowLegend() {
  return (
    <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 space-y-2">
      <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
        Node Types
      </h4>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200 flex items-center justify-center">
            <PlayCircle className="h-2.5 w-2.5 text-blue-600" />
          </div>
          <span className="text-xs text-muted-foreground">Trigger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200 flex items-center justify-center">
            <Zap className="h-2.5 w-2.5 text-purple-600" />
          </div>
          <span className="text-xs text-muted-foreground">Action</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-200 flex items-center justify-center">
            <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
          </div>
          <span className="text-xs text-muted-foreground">Complete</span>
        </div>
      </div>
    </div>
  )
}

