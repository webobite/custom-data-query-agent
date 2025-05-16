# Natural Language Query Agent

A powerful TypeScript-based CLI application that allows querying data using natural language, powered by Ollama's local LLM. This application provides an intuitive interface for interacting with your data through natural language queries.

## ✨ Features

- **Natural Language Processing**: Convert plain English queries into structured database filters
- **Advanced Querying**: Supports complex queries with multiple conditions, ranges, and sorting
- **Pagination**: Handle large datasets with built-in pagination support
- **Rich Output**: Beautifully formatted tables with syntax highlighting
- **Error Handling**: Comprehensive error handling and user feedback
- **Extensible**: Easy to extend with new query capabilities and data sources

## 🚀 Prerequisites

1. **Node.js 18 or higher**
2. **Ollama** installed and running locally
3. **Python backend server** running on port 8000 (from the parent directory)

## 🛠️ Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd custom-data-query-agent/mcp-agent-typescript
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the TypeScript code**:
   ```bash
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

1. **Start the application** in development mode:
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

2. **Enter your natural language queries** at the prompt. For example:
   ```
   > Show me all employees in Engineering
   > Find people with more than 20 project hours
   > List all active employees in Sales
   > Show the top 5 employees by project hours
   > Find people who joined after 2023 with more than 30 project hours
   ```

3. **Useful commands**:
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
  > List employees with less than 10 project hours
  ```

- Date ranges:
  ```
  > Show employees who joined after January 2023
  > Find people who joined between 2022 and 2023
  ```

- Sorting and limiting:
  ```
  > Show the top 5 employees by project hours
  > List employees sorted by name in descending order
  > Show the 10 most recent hires
  ```

- Combined queries:
  ```
  > Find active employees in Engineering with more than 20 project hours
  > Show me managers in the Sales department who joined in the last year
  ```

## 🧩 Project Structure

```
src/
├── config/           # Configuration files
│   └── llmConfig.ts  # LLM model configuration
├── services/         # Service layer
│   ├── nlpService.ts       # Natural language processing
│   └── queryServiceClient.ts# API client for the backend
└── index.ts          # Main application entry point
```

## 🔧 Configuration

You can customize the application behavior by modifying the configuration in `src/config/llmConfig.ts`:

- `model`: The Ollama model to use (default: 'llama3')
- `temperature`: Controls randomness in the LLM's responses (0.0 to 1.0)
- `maxTokens`: Maximum number of tokens to generate
- `systemPrompt`: Instructions for the LLM on how to process queries

## 🐛 Debugging

To enable debug logging, set the `DEBUG` environment variable:

```bash
DEBUG=* npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for the powerful local LLM
- [Node.js](https://nodejs.org/) and [TypeScript](https://www.typescriptlang.org/) for the runtime and type safety
- [Chalk](https://github.com/chalk/chalk) for beautiful terminal output
- [Table](https://github.com/gajus/table) for formatted table output

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
