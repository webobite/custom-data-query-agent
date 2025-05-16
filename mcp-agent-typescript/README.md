# Natural Language Query Agent

A TypeScript-based CLI application that allows querying data using natural language, powered by Ollama's local LLM.

## Prerequisites

1. Node.js 18 or higher
2. Ollama installed and running locally
3. Python server (from the parent directory) running on port 8000

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Make sure you have Ollama installed and running:
   ```bash
   # Install Ollama if you haven't already
   # Follow instructions at: https://ollama.ai/
   
   # Start the Ollama server
   ollama serve
   ```

4. In a separate terminal, pull the required model:
   ```bash
   ollama pull llama3
   ```

## Running the Application

1. Start the application:
   ```bash
   npm start
   ```

2. Enter your natural language queries at the prompt, for example:
   ```
   > Show me all employees in Engineering
   > Find people with more than 20 project hours
   > List all employees
   ```

3. Type 'exit' to quit the application.

## Development

For development with auto-reload:

```bash
npm run dev
```

## Example Queries

- "Show me everyone in Engineering"
- "Find people with more than 30 project hours"
- "List all employees"
- "Show me people in Engineering with less than 20 project hours"

## Project Structure

- `src/` - Source code
  - `config/` - Configuration files
  - `services/` - Service implementations
    - `queryServiceClient.ts` - Handles communication with the Python server
    - `nlpService.ts` - Handles natural language processing using Ollama
- `dist/` - Compiled JavaScript (generated)

## License

ISC
