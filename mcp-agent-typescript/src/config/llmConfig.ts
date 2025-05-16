// Configuration for the LLM service
export const llmConfig = {
  // Using a small, fast model suitable for local development
  model: 'llama3',  // This is a small, fast model from Ollama
  temperature: 0.3,  // Lower temperature for more deterministic outputs
  maxTokens: 100,
  
  // Schema for the expected query format
  schema: {
    type: 'object',
    properties: {
      department: { type: 'string', description: 'Filter by department name' },
      name: { type: 'string', description: 'Filter by person name' },
      min_hours: { type: 'number', description: 'Minimum project hours' },
      max_hours: { type: 'number', description: 'Maximum project hours' }
    }
  }
} as const;
