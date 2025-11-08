'use client'

import { useState, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { WorkflowBlueprintData } from '@/types/workflow'
import { CheckCircle2, XCircle, Edit2, Save, PlusCircle } from 'lucide-react'

interface WorkflowBlueprintProps {
  blueprint: WorkflowBlueprintData
}

export default function WorkflowBlueprint({ blueprint }: WorkflowBlueprintProps) {
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | 'editing'>('pending')
  const [workflowName, setWorkflowName] = useState('')
  const [showSavePrompt, setShowSavePrompt] = useState(false)

  // Convert blueprint data to React Flow format
  const nodes: Node[] = useMemo(() => {
    return blueprint.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: (
          <div className="px-4 py-3">
            <div className="font-semibold text-sm text-foreground mb-1.5 leading-tight">
              {node.data.label}
            </div>
            <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {node.data.description}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 font-medium">
                {node.data.tool}
              </span>
              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded border border-border">
                {node.data.action_type}
              </span>
            </div>
          </div>
        ),
      },
      style: {
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        padding: 0,
        width: 240,
        minHeight: 120,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    }))
  }, [blueprint.nodes])

  const edges: Edge[] = useMemo(() => {
    return blueprint.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--muted-foreground))',
        width: 20,
        height: 20,
      },
      style: {
        stroke: 'hsl(var(--muted-foreground))',
        strokeWidth: 1.5,
        opacity: 0.6,
      },
    }))
  }, [blueprint.edges])

  const handleActivate = () => {
    setApprovalStatus('approved')
    setShowSavePrompt(true)
    // TODO: Send approval to backend
    console.log('Workflow activated:', blueprint.workflow_id)
  }

  const handleReject = () => {
    // Ask user what they'd like to change
    const feedback = prompt('What would you like to change about this workflow?')
    if (feedback) {
      // TODO: Send feedback to chat/AI to regenerate
      console.log('User feedback:', feedback)
      setApprovalStatus('rejected')
    }
  }

  const handleEdit = () => {
    setApprovalStatus('editing')
    // TODO: Enable inline editing of the diagram
    console.log('Edit mode enabled:', blueprint.workflow_id)
  }

  const handleSave = () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name')
      return
    }
    // TODO: Save workflow to backend
    console.log('Saving workflow:', workflowName, blueprint.workflow_id)
    setShowSavePrompt(false)
  }

  const handleCreateAnother = () => {
    // TODO: Reset state and allow user to create another workflow
    console.log('Creating another workflow')
    window.location.reload()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Blueprint Goal */}
      <div className="mb-5 px-4 py-3 bg-muted/30 border border-border rounded-md">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Goal</p>
        <p className="text-sm text-foreground leading-relaxed">{blueprint.goal}</p>
      </div>

      {/* React Flow Viewer */}
      <div className="flex-1 border border-border rounded-md overflow-hidden bg-background min-h-[500px]">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            preventScrolling={false}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Approval Actions */}
      <div className="mt-6 pt-5 border-t border-border">
        {/* Pending State: Review & Approve/Edit/Reject */}
        {approvalStatus === 'pending' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Review the workflow above before activating</p>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Request Changes
              </button>
              <button
                onClick={handleEdit}
                className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleActivate}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 flex items-center gap-2 ml-auto"
              >
                <CheckCircle2 className="h-4 w-4" />
                Activate This Workflow
              </button>
            </div>
          </div>
        )}

        {/* Approved State: Save Workflow & Manage */}
        {approvalStatus === 'approved' && (
          <div className="space-y-4">
            {showSavePrompt ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Workflow activated!</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="workflow-name" className="block text-xs font-medium text-muted-foreground mb-2">
                      Give your workflow a name
                    </label>
                    <input
                      id="workflow-name"
                      type="text"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="e.g., Lead Nurture Flow"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Workflow
                    </button>
                    <button
                      onClick={handleCreateAnother}
                      className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create Another
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      {workflowName || 'Workflow saved!'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Your workflow is now active
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setApprovalStatus('editing')}
                    className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleCreateAnother}
                    className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editing State */}
        {approvalStatus === 'editing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Edit2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Edit mode enabled</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click nodes to edit them, or drag to rearrange. (Feature coming soon)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setApprovalStatus('pending')}
                className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Rejected State */}
        {approvalStatus === 'rejected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Changes requested - Alan is updating the workflow
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

