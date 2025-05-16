import axios from 'axios';
import { llmConfig } from '../config/llmConfig.js';
import type { QueryFilters } from './queryServiceClient.js';

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  options?: {
    temperature?: number;
    num_predict?: number;
  };
  stream?: boolean;
}

interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

interface QueryResult {
  filters?: {
    department?: string | string[];
    name?: string | string[];
    role?: string | string[];
    status?: 'active' | 'inactive' | 'on_leave';
  };
  ranges?: {
    project_hours?: {
      gte?: number;
      lte?: number;
      gt?: number;
      lt?: number;
    };
    join_date?: {
      after?: string;
      before?: string;
    };
  };
  search?: string;
  sort?: {
    field: string;
    order?: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

/**
 * Sends a chat request to the Ollama API
 */
async function sendChatRequest(messages: OllamaMessage[]): Promise<string> {
  try {
    const request: OllamaRequest = {
      model: llmConfig.model,
      messages,
      options: {
        temperature: llmConfig.temperature,
        num_predict: llmConfig.maxTokens
      },
      stream: false
    };

    const response = await axios.post<OllamaResponse>(OLLAMA_API_URL, request, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    return response.data.message?.content || '';
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw new Error(`Failed to communicate with Ollama: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Converts natural language query to structured filters
 * @param query Natural language query (e.g., "Show me everyone in Engineering")
 * @returns Promise with structured filters
 */
export async function parseNaturalLanguageQuery(query: string): Promise<QueryFilters> {
  console.log(' Converting to structured query...');
  
  try {
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: llmConfig.systemPrompt + '\n\n' +
                'Available schema:\n' +
                JSON.stringify(llmConfig.schema, null, 2)
      },
      {
        role: 'user',
        content: llmConfig.userPrompt.replace('{query}', query)
      }
    ];
    
    console.log('Sending prompt to LLM:', messages);
    
    let content = await sendChatRequest(messages);
    console.log(' Generated structured query:', content);
    
    // Clean the response by extracting JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json\n)?([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      content = jsonMatch[1].trim();
    }
    
    // Parse the JSON response
    const result: QueryResult = JSON.parse(content);
    
    // Convert to QueryFilters format
    const filters: QueryFilters = {};
    
    // Handle filters
    if (result.filters) {
      if (result.filters.department) filters.department = result.filters.department;
      if (result.filters.name) filters.name = result.filters.name;
      if (result.filters.role) filters.role = result.filters.role;
      if (result.filters.status) filters.status = result.filters.status;
    }
    
    // Handle ranges
    if (result.ranges?.project_hours) {
      const ph = result.ranges.project_hours;
      if (ph.gte !== undefined) filters.min_hours = ph.gte;
      if (ph.gt !== undefined) filters.min_hours = (filters.min_hours || 0) + 1;
      if (ph.lte !== undefined) filters.max_hours = ph.lte;
      if (ph.lt !== undefined) filters.max_hours = (filters.max_hours || 0) - 1;
    }
    
    if (result.ranges?.join_date) {
      const jd = result.ranges.join_date;
      if (jd.after) filters.join_date_after = jd.after;
      if (jd.before) filters.join_date_before = jd.before;
    }
    
    // Handle search
    if (result.search) {
      filters.search = result.search;
    }
    
    // Handle sort
    if (result.sort) {
      filters.sort_by = result.sort.field;
      filters.sort_order = result.sort.order || 'asc';
    }
    
    // Handle pagination
    if (result.limit !== undefined) filters.limit = result.limit;
    if (result.offset !== undefined) filters.offset = result.offset;
    
    return filters;
    
  } catch (error) {
    console.error('Error parsing natural language query:', error);
    throw new Error(`Failed to parse query: ${error instanceof Error ? error.message : String(error)}`);
  }
}
