# Natural Language Query Agent

A powerful TypeScript-based CLI application that allows querying data using natural language, powered by Ollama's local LLM. This application provides an intuitive interface for interacting with CSV data through natural language queries, with a Python FastAPI backend for data processing.

## ✨ Features

- **Natural Language Processing**: Convert plain English queries into structured database filters using Ollama's LLM
- **Advanced Querying**: Supports complex queries with multiple conditions, ranges, and sorting
- **RESTful API**: FastAPI backend with proper error handling and response formatting
- **Type Safety**: Full TypeScript support with proper type definitions
- **Rich Output**: Beautifully formatted tables with syntax highlighting
- **Robust Error Handling**: Comprehensive error handling and user feedback
- **Case-Insensitive Matching**: Smart filtering that handles case variations in text fields
- **Extensible Architecture**: Modular design for easy extension

## 🚀 Prerequisites

1. **Node.js 18 or higher**
2. **Ollama** installed and running locally
3. **Python 3.8+** with pip
4. **Required Python packages**:
   ```bash
   pip install fastapi uvicorn pandas python-multipart
   ```
5. **Backend server** running on port 8000 (from the parent directory)

## 🛠️ Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd custom-data-query-agent
   ```

2. **Set up the Python backend**:
   ```bash
   cd mcp-server-python
   pip install -r requirements.txt
   ```

3. **Set up the TypeScript frontend**:
   ```bash
   cd ../mcp-agent-typescript
   npm install
   npm run build
   ```

4. **Set up Ollama**:
   - Install Ollama by following the instructions at: [https://ollama.ai/](https://ollama.ai/)
   - Start the Ollama server in a separate terminal:
     ```bash
     ollama serve
     ```
   - Pull the required model (llama3 is recommended):
     ```bash
     ollama pull llama3
     ```

## 🏃‍♂️ Running the Application

1. **Start the Python backend server**:
   ```bash
   cd mcp-server-python
   uvicorn main:app --reload
   ```
   The server will start on `http://localhost:8000`

2. **Start the TypeScript application** in a new terminal:
   ```bash
   cd mcp-agent-typescript
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

3. **Enter your natural language queries** at the prompt. For example:
   ```
   > Show me all employees in Engineering
   > Find people with more than 100 project hours
   > List all employees in Marketing
   > Show employees with project hours between 50 and 150
   ```

4. **Useful commands**:
   - `help` - Show help information
   - `exit` - Quit the application

## 📚 Query Examples

Here are some example queries you can try:

- Basic filtering:
  ```
  > Show me all employees in the Engineering department
  > Find people with the role "Senior Developer"
  > List all active employees
  ```

- Numeric ranges:
  ```
  > Show employees with 20-40 project hours
  > Find people with more than 30 project hours
  > List employees with less than 10 project hours -- giving wrong result
  ```

- Date ranges:
  ```
  > Show employees who joined after January 2023 - giving wrong result
  > Find people who joined between 2022 and 2023
  ```

- Sorting and limiting:
  ```
  > Show the top 5 employees by project hours
  > List employees sorted by name in descending order
  > Show the 10 most recent hires -- # this is still giving error
  ```

- Combined queries:
  ```
  > Find active employees in Engineering with more than 20 project hours
  > Show me managers in the Sales department who joined in the last year -- # this is still giving error
  ```

## 🧩 Project Structure

```
custom-data-query-agent/
├── mcp-agent-typescript/    # TypeScript frontend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   └── llmConfig.ts  # LLM model configuration
│   │   ├── services/         # Service layer
│   │   │   ├── nlpService.ts        # Natural language processing
│   │   │   └── queryServiceClient.ts # API client for the backend
│   │   └── index.ts          # Main application entry point
│   └── package.json
│
└── mcp-server-python/      # Python FastAPI backend
    ├── data/               # Sample data files
    ├── main.py             # FastAPI application
    └── requirements.txt    # Python dependencies
```

## 🔧 Configuration

### Frontend Configuration (`mcp-agent-typescript/src/config/llmConfig.ts`)
- `model`: The Ollama model to use (default: 'llama3')
- `temperature`: Controls randomness in the LLM's responses (0.0 to 1.0)
- `maxTokens`: Maximum number of tokens to generate
- `systemPrompt`: Instructions for the LLM on how to process queries

### Backend Configuration (`mcp-server-python/main.py`)
- `DATA_FILE_PATH`: Path to the CSV data file
- `SERVER_HOST` and `SERVER_PORT`: Server binding configuration
- `DEBUG_MODE`: Enable/disable debug logging

## 🐛 Debugging

### Frontend Debugging
```bash
# Enable debug logging
DEBUG=* npm start

# Or run in development mode with auto-reload
npm run dev
```

### Backend Debugging
```bash
# Run server with debug logging
cd mcp-server-python
uvicorn main:app --reload --log-level debug

# Or run with Python directly for more control
python -m uvicorn main:app --reload --log-level debug
```

### Common Issues
1. **Ollama not running**: Ensure Ollama server is running with `ollama serve`
2. **Python dependencies**: Run `pip install -r requirements.txt` if you get import errors
3. **Port conflicts**: Check if port 8000 is available for the Python server
4. **CORS issues**: Ensure the frontend is making requests to the correct backend URL

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure code quality:
   ```bash
   # TypeScript
   npm run lint
   npm test
   
   # Python
   flake8 .
   ```
5. Commit your changes with a clear message (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Message Guidelines
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code changes that neither fix bugs nor add features
- `test:` for adding tests
- `chore:` for maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for the powerful local LLM
- [Node.js](https://nodejs.org/) and [TypeScript](https://www.typescriptlang.org/) for the runtime and type safety
- [Chalk](https://github.com/chalk/chalk) for beautiful terminal output
- [Table](https://github.com/gajus/table) for formatted table output

## 🚀 Example Queries

### Basic Queries
- "Show me all employees in Engineering"
- "Find people with more than 100 project hours"
- "List all employees in Marketing"

### Advanced Queries
- "Show engineers with project hours between 50 and 150"
- "List employees sorted by project hours (highest first)"
- "Find people in Engineering with more than 100 project hours"

## 📊 Data Model

The application works with employee data containing the following fields:
- `id`: Unique identifier (number)
- `name`: Employee name (string)
- `department`: Department name (string)
- `project_hours`: Number of hours worked on projects (number)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
