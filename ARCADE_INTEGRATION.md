# Arcade.dev Integration Plan for Alan

## Overview

Arcade.dev is the perfect abstraction layer for Alan's AI-powered automation platform. It provides:
- **Agent-native tool-calling** (not data-syncing)
- **100+ pre-built connectors** (Gmail, Airtable, Slack, etc.)
- **OAuth/auth handling** (no API key management needed)
- **MCP (Model Context Protocol)** based architecture
- **Built for CrewAI/LangChain** integration

## Architecture Integration

### Current State
- Alan uses CrewAI agents to plan workflows
- Workflows are visualized in React Flow
- Node configuration allows manual OAuth/API key entry
- Workflow execution is not yet implemented

### With Arcade.dev
- CrewAI agents use Arcade.dev tools directly
- OAuth flows handled automatically by Arcade.dev
- Pre-built connectors for all major SaaS tools
- Workflow execution uses Arcade.dev tool calls

## Integration Points

### 1. Backend: Arcade.dev Service Layer

**File**: `backend/services/arcade_service.py`

```python
from arcade import ArcadeClient
from typing import Dict, Any, Optional
import os

class ArcadeService:
    """
    Service layer for Arcade.dev integration.
    Handles tool-calling and OAuth flows.
    """
    
    def __init__(self):
        self.client = ArcadeClient(api_key=os.getenv("ARCADE_API_KEY"))
        self.user_id = None  # Set per request
    
    def get_authorization_url(self, tool: str, user_id: str) -> str:
        """
        Get OAuth authorization URL for a tool.
        Returns URL that user clicks to connect their account.
        """
        return self.client.get_auth_url(tool=tool, user_id=user_id)
    
    def call_tool(self, tool: str, action: str, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Execute a tool action via Arcade.dev.
        Handles auth automatically - if user not connected, returns auth URL.
        """
        try:
            result = self.client.call_tool(
                tool=tool,
                action=action,
                params=params,
                user_id=user_id
            )
            return result
        except ArcadeAuthRequired:
            # User needs to connect their account
            auth_url = self.get_authorization_url(tool, user_id)
            return {
                "requires_auth": True,
                "auth_url": auth_url,
                "tool": tool
            }
    
    def list_available_tools(self) -> List[str]:
        """Get list of all available Arcade.dev tools"""
        return self.client.list_tools()
```

### 2. Backend: Update CrewAI Agents

**File**: `backend/agents/workflow_planner.py`

```python
from services.arcade_service import ArcadeService

class WorkflowPlanner:
    def __init__(self):
        # ... existing code ...
        self.arcade = ArcadeService()
    
    def _create_workflow_designer(self) -> Agent:
        """Agent that designs workflows using Arcade.dev tools"""
        return Agent(
            role="Workflow Architect",
            goal="Design workflows using available Arcade.dev tools",
            backstory="""You are an expert at designing workflows using Arcade.dev's
            pre-built tool connectors. You know which tools are available and how to
            combine them into efficient workflows.""",
            tools=[self.arcade.list_available_tools()],  # Give agent access to tool list
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
```

### 3. Backend: OAuth Callback Endpoint

**File**: `backend/main.py`

```python
@app.get("/api/auth/arcade/callback")
async def arcade_callback(code: str, state: str, user_id: str):
    """
    Handle OAuth callback from Arcade.dev.
    User is redirected here after connecting their account.
    """
    arcade_service = ArcadeService()
    # Exchange code for tokens
    tokens = arcade_service.exchange_code_for_tokens(code, state)
    # Store tokens (encrypted) associated with user_id
    # Return success
    return {"status": "connected", "tool": state}
```

### 4. Frontend: Update Node Configuration Dialog

**File**: `frontend/components/workflow/NodeConfigurationDialog.tsx`

Replace manual OAuth/API key entry with Arcade.dev integration:

```typescript
const handleArcadeConnect = async (tool: string) => {
  // Request auth URL from backend
  const response = await fetch(`/api/auth/arcade/url?tool=${tool}&nodeId=${nodeId}`)
  const { auth_url } = await response.json()
  
  // Open OAuth popup
  const popup = window.open(auth_url, 'Connect Account', 'width=600,height=700')
  
  // Listen for callback
  window.addEventListener('message', (event) => {
    if (event.data.type === 'ARCADE_AUTH_SUCCESS') {
      onSave({
        type: 'oauth',
        value: 'connected',
        connected: true,
        tool: tool
      })
      onClose()
    }
  })
}
```

### 5. Frontend: In-Chat Tool Connection

**File**: `frontend/components/GenerativeChat.tsx`

When AI detects a tool is needed but not connected:

```typescript
// AI calls Arcade.dev tool
// Arcade.dev returns: { requires_auth: true, auth_url: "...", tool: "gmail" }

// Render "Connect Gmail" button in chat
{message.toolInvocations?.map((toolCall) => {
  if (toolCall.toolName === 'arcade_call' && toolCall.result?.requires_auth) {
    return (
      <a 
        href={toolCall.result.auth_url}
        target="_blank"
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        Connect {toolCall.result.tool}
      </a>
    )
  }
})}
```

### 6. Workflow Execution

**File**: `backend/services/workflow_executor.py`

```python
class WorkflowExecutor:
    def __init__(self):
        self.arcade = ArcadeService()
    
    def execute_step(self, step: WorkflowStep, user_id: str, data: Dict[str, Any]):
        """
        Execute a workflow step using Arcade.dev.
        """
        # Map workflow step to Arcade.dev tool call
        tool = step.tool  # e.g., "gmail"
        action = self._map_action_type(step.action_type)  # e.g., "SendEmail"
        params = {**step.parameters, **data}
        
        # Call via Arcade.dev
        result = self.arcade.call_tool(
            tool=tool,
            action=action,
            params=params,
            user_id=user_id
        )
        
        if result.get("requires_auth"):
            # Return auth URL to frontend
            return result
        
        # Return execution result
        return {"success": True, "result": result}
```

## User Flow with Arcade.dev

### Flow 1: Workflow Creation with Tool Connection

1. User: "When a lead fills out my Typeform, add them to Airtable and send a welcome email"
2. CrewAI agent plans workflow → identifies tools: Typeform, Airtable, SendGrid
3. Frontend renders workflow blueprint
4. User clicks "Configure" on Airtable node
5. Dialog shows: "Connect Airtable" button (OAuth via Arcade.dev)
6. User clicks → Arcade.dev OAuth popup opens
7. User logs into Airtable
8. Arcade.dev stores tokens (encrypted, per-user)
9. Node shows "✓ Connected"
10. Repeat for other tools
11. User approves workflow

### Flow 2: In-Chat Tool Connection

1. User: "Send an email to my customer list"
2. AI: "I need to connect to Gmail. [Connect Gmail] button"
3. User clicks button → OAuth popup
4. User connects Gmail
5. AI: "Great! Sending emails now..."
6. AI uses Arcade.dev to send emails

### Flow 3: Workflow Execution

1. Workflow is triggered (e.g., Typeform submission webhook)
2. Backend receives webhook data
3. For each workflow step:
   - Check if tool is connected (via Arcade.dev)
   - If not connected → return auth URL to frontend
   - If connected → execute tool call via Arcade.dev
   - Pass result to next step
4. Workflow completes

## Benefits

### 1. Simplified Auth
- No API key management
- No OAuth flow implementation
- No token storage/refresh logic
- Arcade.dev handles everything

### 2. Pre-Built Connectors
- 100+ tools ready to use
- No need to build individual integrations
- Battle-tested and maintained

### 3. Agent-Native
- Built for CrewAI/LangChain
- Tool-calling, not data-syncing
- Perfect for automation workflows

### 4. Better UX
- Seamless OAuth flows
- In-chat connection prompts
- No technical knowledge required

## Implementation Steps

1. **Phase 1: Setup**
   - Sign up for Arcade.dev account
   - Get API key
   - Install Arcade.dev SDK

2. **Phase 2: Backend Integration**
   - Create `ArcadeService` wrapper
   - Add OAuth callback endpoint
   - Update CrewAI agents to use Arcade.dev tools

3. **Phase 3: Frontend Integration**
   - Update `NodeConfigurationDialog` to use Arcade.dev OAuth
   - Add in-chat tool connection UI
   - Update workflow execution flow

4. **Phase 4: Workflow Execution**
   - Implement `WorkflowExecutor` using Arcade.dev
   - Add webhook handling
   - Add execution status tracking

## Environment Variables

```env
# Arcade.dev Configuration
ARCADE_API_KEY=your_arcade_api_key_here
ARCADE_WEBHOOK_SECRET=your_webhook_secret_here

# OAuth Callback URL
ARCADE_CALLBACK_URL=https://your-domain.com/api/auth/arcade/callback
```

## API Endpoints

### New Endpoints Needed

1. `GET /api/auth/arcade/url?tool={tool}&nodeId={nodeId}`
   - Returns OAuth authorization URL
   
2. `GET /api/auth/arcade/callback?code={code}&state={state}`
   - Handles OAuth callback
   
3. `POST /api/workflow/{workflow_id}/execute`
   - Executes workflow using Arcade.dev tools
   
4. `GET /api/tools/available`
   - Lists all available Arcade.dev tools

## Migration Path

### From Current System
- Current: Manual API key entry per node
- With Arcade.dev: OAuth flow per tool (one-time)

### Backward Compatibility
- Keep existing node configuration for custom webhooks
- Arcade.dev for standard SaaS tools
- Hybrid approach: Use Arcade.dev when available, fallback to manual for custom integrations

## Next Steps

1. Research Arcade.dev SDK documentation
2. Set up Arcade.dev account and get API key
3. Create `ArcadeService` wrapper
4. Update node configuration to use Arcade.dev OAuth
5. Integrate Arcade.dev tools into CrewAI agents
6. Implement workflow execution using Arcade.dev

