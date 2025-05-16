import { Ollama } from 'ollama';
import { llmConfig } from '../config/llmConfig.js';
import type { QueryFilters } from './queryServiceClient.js';

const ollama = new Ollama({ host: 'http://localhost:11434' });

/**
 * Converts natural language query to structured filters
 * @param query Natural language query (e.g., "Show me everyone in Engineering")
 * @returns Promise with structured filters
 */
export async function parseNaturalLanguageQuery(query: string): Promise<QueryFilters> {
  try {
    const systemPrompt = `You are a helpful assistant that converts natural language queries into structured filters.
    Available filters: ${JSON.stringify(llmConfig.schema, null, 2)}
    
    Respond with a JSON object containing only the filters to apply.
    Example: {"department": "Engineering"} or {"min_hours": 20, "department": "Engineering"}
    If no relevant filters are mentioned, return an empty object {}.
    `;

    const response = await ollama.chat({
      model: llmConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      format: 'json',
      options: {
        temperature: llmConfig.temperature,
        num_predict: llmConfig.maxTokens,
      }
    });

    // Extract the JSON response
    const content = response.message?.content;
    if (!content) return {};

    try {
      // Try to parse the response as JSON
      const result = JSON.parse(content);
      return result as QueryFilters;
    } catch (e) {
      console.error('Failed to parse LLM response as JSON:', e);
      return {};
    }
  } catch (error) {
    console.error('Error in parseNaturalLanguageQuery:', error);
    return {};
  }
}
