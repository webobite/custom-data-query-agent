// Configuration for the LLM service
export const llmConfig = {
  // Using a small, fast model suitable for local development
  model: 'llama3',  // This is a small, fast model from Ollama
  temperature: 0.3,  // Lower temperature for more deterministic outputs
  maxTokens: 500,
  
  // System prompt to guide the LLM's behavior
  systemPrompt: `You are an expert data analyst that converts natural language queries into structured data filters.
  Your task is to analyze the user's query and extract relevant filters and operations.
  
  IMPORTANT: Your response MUST be a valid JSON object that matches the provided schema.
  Do not include any additional text, explanations, or markdown formatting.
  Only output the raw JSON object with no other content.
  
  Available operations:
  - filter: Filter records based on exact matches
  - range: Filter records within a numeric range
  - search: Text search across all fields
  - sort: Sort the results by a field
  - limit: Limit the number of results
  
  Example response for "Show me active engineers":
  {"filters":{"status":"active","role":"engineer"}}`,
  
  // User prompt template
  userPrompt: `Convert this query into structured filters: "{query}"
  
  Respond with a JSON object that matches the schema. Do not include any other text or formatting.`,
  
  // Schema for the expected query format
  schema: {
    type: 'object',
    properties: {
      filters: {
        type: 'object',
        properties: {
          department: { type: ['string', 'array'], items: { type: 'string' }, description: 'Filter by department name(s)' },
          name: { type: ['string', 'array'], items: { type: 'string' }, description: 'Filter by person name(s)' },
          role: { type: ['string', 'array'], items: { type: 'string' }, description: 'Filter by role(s)' },
          status: { type: 'string', enum: ['active', 'inactive', 'on_leave'], description: 'Filter by employment status' },
        },
        additionalProperties: false
      },
      ranges: {
        type: 'object',
        properties: {
          project_hours: {
            type: 'object',
            properties: {
              gte: { type: 'number', description: 'Greater than or equal to' },
              lte: { type: 'number', description: 'Less than or equal to' },
              gt: { type: 'number', description: 'Greater than' },
              lt: { type: 'number', description: 'Less than' }
            },
            additionalProperties: false
          },
          join_date: {
            type: 'object',
            properties: {
              after: { type: 'string', format: 'date', description: 'After date (YYYY-MM-DD)' },
              before: { type: 'string', format: 'date', description: 'Before date (YYYY-MM-DD)' }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      },
      search: {
        type: 'string',
        description: 'Full-text search across all fields'
      },
      sort: {
        type: 'object',
        properties: {
          field: { 
            type: 'string', 
            enum: ['name', 'department', 'project_hours', 'join_date'],
            description: 'Field to sort by'
          },
          order: { 
            type: 'string', 
            enum: ['asc', 'desc'],
            default: 'asc',
            description: 'Sort order'
          }
        },
        required: ['field'],
        additionalProperties: false
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
        description: 'Maximum number of results to return'
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Number of results to skip (for pagination)'
      }
    },
    additionalProperties: false
  }
} as const;
