# Alan - AI-Powered Automation Platform

An AI-powered automation platform for non-technical business owners. Describe your automation goal in natural language, review the AI-generated workflow blueprint, and approve—no drag-and-drop required.

## Architecture

### Backend (The "Brain")
- **Framework**: Python with CrewAI
- **Purpose**: Orchestrating AI agents that plan multi-step business workflows
- **Tech**: CrewAI, LangChain

### Frontend (The "Visual")
- **Framework**: React/Next.js
- **Visualization**: React Flow (read-only blueprint viewer)
- **AI Interface**: Vercel AI SDK
- **Purpose**: Simple approval interface for generated workflows

## Project Structure

```
Alan/
├── backend/          # Python backend with CrewAI
├── frontend/         # Next.js React frontend
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.9+ 
- Node.js 18+ and npm
- OpenAI API key (for CrewAI agents)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

5. Run the backend server:
```bash
python main.py
# Or: uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (optional, defaults to localhost:8000):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Workflow

1. User describes automation goal in natural language
2. Backend AI agent plans the workflow
3. Blueprint JSON is generated
4. Frontend renders the blueprint in React Flow (read-only)
5. User reviews and approves

# Alan
