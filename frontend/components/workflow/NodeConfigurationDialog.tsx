'use client'

import { useState } from 'react'
import { X, Key, LogIn, Webhook, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NodeConfigurationDialogProps {
  nodeId: string
  nodeLabel: string
  tool: string
  isOpen: boolean
  onClose: () => void
  onSave: (config: {
    type: 'oauth' | 'api_key' | 'webhook'
    value: string
    connected?: boolean
  }) => void
  existingConfig?: {
    type: 'oauth' | 'api_key' | 'webhook'
    value?: string
    connected?: boolean
  } | null
}

type ConfigType = 'oauth' | 'api_key' | 'webhook' | null

export default function NodeConfigurationDialog({
  nodeId,
  nodeLabel,
  tool,
  isOpen,
  onClose,
  onSave,
  existingConfig,
}: NodeConfigurationDialogProps) {
  const [selectedType, setSelectedType] = useState<ConfigType>(
    existingConfig?.type || null
  )
  const [apiKey, setApiKey] = useState(existingConfig?.type === 'api_key' ? existingConfig.value || '' : '')
  const [webhookUrl, setWebhookUrl] = useState(existingConfig?.type === 'webhook' ? existingConfig.value || '' : '')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleOAuthConnect = async () => {
    setIsConnecting(true)
    try {
      // Simulate OAuth flow - in production, this would open OAuth popup
      await new Promise(resolve => setTimeout(resolve, 1500))
      onSave({
        type: 'oauth',
        value: 'connected',
        connected: true,
      })
      onClose()
    } catch (error) {
      console.error('OAuth connection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleApiKeySave = async () => {
    if (!apiKey.trim()) return
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave({
        type: 'api_key',
        value: apiKey.trim(),
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleWebhookSave = async () => {
    if (!webhookUrl.trim()) return
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave({
        type: 'webhook',
        value: webhookUrl.trim(),
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = () => {
    onSave({
      type: existingConfig?.type || 'api_key',
      value: '',
      connected: false,
    })
    setSelectedType(null)
    setApiKey('')
    setWebhookUrl('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Configure {nodeLabel}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Connect {tool} to this workflow step
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Existing Configuration Status */}
          {existingConfig && existingConfig.value && (
            <div className="p-4 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {existingConfig.type === 'oauth' && 'Account Connected'}
                    {existingConfig.type === 'api_key' && 'API Key Configured'}
                    {existingConfig.type === 'webhook' && 'Webhook Configured'}
                  </p>
                  {existingConfig.type === 'api_key' && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      •••••••••••••{existingConfig.value.slice(-4)}
                    </p>
                  )}
                  {existingConfig.type === 'webhook' && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1 truncate">
                      {existingConfig.value}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Configuration Options */}
          {!existingConfig?.value && (
            <>
              {/* OAuth Option */}
              <button
                onClick={() => {
                  setSelectedType('oauth')
                  handleOAuthConnect()
                }}
                disabled={isConnecting}
                className="w-full p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <LogIn className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Connect Account</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Log in with your {tool} account
                    </p>
                  </div>
                  {isConnecting && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
              </button>

              {/* API Key Option */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <button
                  onClick={() => setSelectedType(selectedType === 'api_key' ? null : 'api_key')}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">API Key</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your {tool} API key
                    </p>
                  </div>
                </button>
                
                {selectedType === 'api_key' && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      autoFocus
                    />
                    <Button
                      onClick={handleApiKeySave}
                      disabled={!apiKey.trim() || isSaving}
                      className="w-full"
                      size="sm"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save API Key'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Webhook Option */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <button
                  onClick={() => setSelectedType(selectedType === 'webhook' ? null : 'webhook')}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Webhook className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Webhook URL</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your webhook endpoint
                    </p>
                  </div>
                </button>
                
                {selectedType === 'webhook' && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-webhook-url.com/endpoint"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      autoFocus
                    />
                    <Button
                      onClick={handleWebhookSave}
                      disabled={!webhookUrl.trim() || isSaving}
                      className="w-full"
                      size="sm"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Webhook'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Your credentials are encrypted and stored securely. They will only be used for this workflow.
          </p>
        </div>
      </div>
    </div>
  )
}

