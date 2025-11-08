'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, Edit2, Trash2, BarChart3, Calendar } from 'lucide-react'

// Mock data for demonstration
const MOCK_WORKFLOWS = [
  {
    id: '1',
    name: 'Lead Nurture Flow',
    goal: 'When a lead fills out my Typeform, add them to Airtable and send a welcome email',
    status: 'active',
    created: '2024-01-15',
    runs: 234,
    lastRun: '2024-01-20 14:23',
  },
  {
    id: '2',
    name: 'Customer Support Tracker',
    goal: 'When I receive an email from a customer, create a task in Trello',
    status: 'active',
    created: '2024-01-10',
    runs: 156,
    lastRun: '2024-01-20 12:45',
  },
  {
    id: '3',
    name: 'Order Management',
    goal: 'When a new order comes in, update the inventory spreadsheet and notify the team on Slack',
    status: 'paused',
    created: '2024-01-08',
    runs: 89,
    lastRun: '2024-01-19 09:12',
  },
]

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS)

  const handleToggleStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
          : w
      )
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      setWorkflows((prev) => prev.filter((w) => w.id !== id))
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-[1400px]">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-semibold tracking-tighter text-foreground mb-3">
                My Workflows
              </h1>
              <p className="text-lg text-muted-foreground font-light">
                Manage your active automation workflows
              </p>
            </div>
            <Link
              href="/"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150"
            >
              Create New Workflow
            </Link>
          </div>
          <div className="h-px bg-border"></div>
        </div>

        {/* Workflows List */}
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <p className="text-lg text-muted-foreground mb-6">
                You haven't created any workflows yet
              </p>
              <Link
                href="/"
                className="inline-flex px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-all duration-150"
              >
                Create Your First Workflow
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">
                        {workflow.name}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          workflow.status === 'active'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {workflow.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {workflow.goal}
                    </p>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Created {workflow.created}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>{workflow.runs} runs</span>
                      </div>
                      <div>
                        <span>Last run: {workflow.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleToggleStatus(workflow.id)}
                      className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                      title={workflow.status === 'active' ? 'Pause' : 'Resume'}
                    >
                      {workflow.status === 'active' ? (
                        <Pause className="h-4 w-4 text-foreground" />
                      ) : (
                        <Play className="h-4 w-4 text-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => alert('Edit workflow: ' + workflow.id)}
                      className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(workflow.id)}
                      className="p-2 border border-destructive/30 rounded-md hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

