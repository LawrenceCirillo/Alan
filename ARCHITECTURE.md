# Architecture: CrewAI & LangChain in Alan

## Current Status: Mock Mode Enabled

**Right now, CrewAI and LangChain are NOT actively running** because `MOCK_MODE=true` is set in `backend/.env`. 

Instead, the app uses simple pattern matching to generate workflows without any AI calls.

## How It Works When Mock Mode is OFF

### The Architecture

```
User Goal (Natural Language)
    ↓
WorkflowPlanner.plan_workflow()
    ↓
┌─────────────────────────────────────┐
│   CrewAI Orchestration Layer        │
│   (Multi-Agent Workflow Planning)   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   LangChain (LLM Interface)         │
│   - ChatOpenAI wrapper              │
│   - Uses OpenAI API (same key)      │
└─────────────────────────────────────┘
    ↓
OpenAI API (GPT-3.5-turbo or GPT-4)
    ↓
Workflow Blueprint (JSON)
```

### The Three-Agent Crew

**CrewAI** orchestrates 3 specialized AI agents that work together:

1. **Goal Analyst Agent** (`goal_analyzer`)
   - **Role**: Analyzes user goals
   - **Purpose**: Extracts requirements, triggers, outcomes, and constraints
   - **Output**: Structured analysis of what the workflow needs to do

2. **Workflow Architect Agent** (`workflow_designer`)
   - **Role**: Designs the workflow steps
   - **Purpose**: Creates step-by-step automation plan
   - **Output**: Detailed workflow with actions, tools, and sequence

3. **Blueprint Engineer Agent** (`blueprint_generator`)
   - **Role**: Generates visual blueprints
   - **Purpose**: Converts workflow design into React Flow format
   - **Output**: JSON blueprint with nodes and edges

### How CrewAI Works

```python
# 1. Create specialized agents
goal_analyzer = Agent(role="Goal Analyst", ...)
workflow_designer = Agent(role="Workflow Architect", ...)
blueprint_generator = Agent(role="Blueprint Engineer", ...)

# 2. Create tasks for each agent
analyze_task = Task(description="Analyze goal...", agent=goal_analyzer)
design_task = Task(description="Design workflow...", agent=workflow_designer)
blueprint_task = Task(description="Generate blueprint...", agent=blueprint_generator)

# 3. Create a crew that orchestrates them
crew = Crew(
    agents=[goal_analyzer, workflow_designer, blueprint_generator],
    tasks=[analyze_task, design_task, blueprint_task],
    process=Process.sequential  # Agents work in sequence
)

# 4. Execute the crew
result = crew.kickoff()  # This triggers all agents to work together
```

### What LangChain Does

**LangChain** provides the LLM interface:

- **`ChatOpenAI`**: Wraps OpenAI's API
- **No separate API key needed**: Uses the same `OPENAI_API_KEY`
- **Provides**: Consistent interface for all agents to call OpenAI
- **Manages**: API calls, token management, response parsing

### Why This Architecture?

1. **Separation of Concerns**: Each agent has a specific role
2. **Better Results**: Specialized agents produce better output than one general agent
3. **Scalability**: Easy to add more agents (e.g., "Security Reviewer", "Cost Optimizer")
4. **Maintainability**: Each agent can be improved independently

## Current State: Mock Mode

With `MOCK_MODE=true`:

- ✅ **CrewAI**: Bypassed (not called)
- ✅ **LangChain**: Bypassed (not called)
- ✅ **OpenAI API**: Not called (no costs)
- ✅ **Workflow Generation**: Uses simple pattern matching

### Mock Mode Logic

```python
if MOCK_MODE == "true":
    # Skip CrewAI entirely
    return _generate_mock_workflow(goal)  # Pattern matching
else:
    # Use CrewAI + LangChain + OpenAI
    crew = Crew(...)
    result = crew.kickoff()
    return generate_blueprint(result)
```

## When You Enable Real AI (Mock Mode OFF)

1. Set `MOCK_MODE=false` in `backend/.env`
2. Ensure `OPENAI_API_KEY` is set
3. Restart backend server

**Then**:
- CrewAI will orchestrate the 3 agents
- Each agent will use LangChain to call OpenAI
- Workflows will be generated intelligently based on the goal
- You'll see verbose logs showing each agent's work

## API Keys Needed

**You only need ONE API key:**
- `OPENAI_API_KEY` - Used by both CrewAI and LangChain
- No separate CrewAI API key
- No separate LangChain API key

They're frameworks that use OpenAI's API.

## Cost Implications

- **Mock Mode**: $0 (no API calls)
- **Real Mode**: Uses OpenAI API (costs based on usage)
  - GPT-3.5-turbo: ~$0.001 per workflow
  - GPT-4: ~$0.01-0.03 per workflow

## Future Enhancements

Currently, there's a TODO to better parse CrewAI results:

```python
# TODO: Parse crew_result to extract actual workflow steps
# Currently, it generates a sample workflow
# In production, you'd parse the CrewAI output intelligently
```

This would make workflows more accurate and goal-specific.

