# Natural Language Query Agent

A full-stack application that allows querying data using natural language, powered by a Python backend, TypeScript CLI frontend, and Ollama's local LLM.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [1. Install Ollama](#1-install-ollama)
  - [2. Set Up Python Backend](#2-set-up-python-backend)
  - [3. Set Up TypeScript Frontend](#3-set-up-typescript-frontend)
- [Running the Application](#running-the-application)
- [Example Queries](#example-queries)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher
- pip (Python package manager)
- Ollama (for local LLM processing)

## Project Structure

```
custom-data-query-agent/
├── mcp-agent-typescript/    # TypeScript CLI frontend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── services/      # Service implementations
│   │   └── index.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
├── mcp-server-python/      # Python FastAPI backend
│   ├── data/              # Sample data files
│   ├── main.py            # FastAPI application
│   └── requirements.txt
└── README.md              # This file
```

## Setup Instructions

### 1. Install Ollama

1. Download and install Ollama from [ollama.ai](https://ollama.ai/)
2. Start the Ollama server:
   ```bash
   ollama serve
   ```
3. In a new terminal, pull the required model:
   ```bash
   ollama pull llama3
   ```

### 2. Set Up Python Backend

1. Navigate to the Python backend directory:
   ```bash
   cd mcp-server-python
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The server will start at `http://localhost:8000`

### 3. Set Up TypeScript Frontend

1. In a new terminal, navigate to the TypeScript directory:
   ```bash
   cd mcp-agent-typescript
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Running the Application

1. Ensure all services are running in separate terminals:
   - Terminal 1: Ollama server (`ollama serve`)
   - Terminal 2: Python backend (`cd mcp-server-python && uvicorn main:app --reload`)
   - Terminal 3: TypeScript frontend (`cd mcp-agent-typescript && npm start`)

2. In the TypeScript terminal, you'll see a prompt where you can enter natural language queries.

## Example Queries

Try these example queries in the application:

```
> Show me all employees in Engineering
> Find people with more than 30 project hours
> List all employees in Sales with less than 20 hours
> Show me the top 5 employees by project hours
```

## Development

### TypeScript Frontend Development

- Run in development mode with auto-reload:
  ```bash
  cd mcp-agent-typescript
  npm run dev
  ```

### Python Backend Development

- The backend server will automatically reload when you make changes to the code.
- API documentation is available at `http://localhost:8000/docs`

## Troubleshooting

### Ollama Issues
- Ensure Ollama is running: `ollama list` should show your models
- If you get rate-limited, try: `OLLAMA_HOST=0.0.0.0 ollama serve`

### Python Backend Issues
- Make sure all dependencies are installed
- Check that the server is running on port 8000
- Verify the data file exists at `mcp-server-python/data/sample_data.csv`

### TypeScript Frontend Issues
- Ensure you've run `npm install`
- Check for TypeScript errors with `tsc --noEmit`
- Verify the backend URL in `queryServiceClient.ts`

## License

ISC
