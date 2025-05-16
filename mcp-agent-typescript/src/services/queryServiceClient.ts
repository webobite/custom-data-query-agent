// src/services/queryServiceClient.ts
import axios from 'axios';
import type { AxiosError } from 'axios';
import { isAxiosError } from 'axios';

// The URL of our Python MCP server
const SERVER_URL = 'http://localhost:8000/query';

export interface QueryFilters {
  [key: string]: unknown;
}

// Define the expected structure of a successful response item
interface DataRecord {
  id: number;
  name: string;
  department: string;
  project_hours: number;
}

// Define the structure for an error response
interface ErrorResponse {
  error: string;
  details?: string;
}

// Define a discriminated union type for the response
type QueryResult = 
  | { success: true; data: DataRecord[] }
  | { success: false; error: ErrorResponse };

export async function queryCustomData(filters?: QueryFilters): Promise<QueryResult> {
  try {
    console.log(`[Client] Sending query to ${SERVER_URL} with filters:`, filters || {});

    const requestBody = {
      filters: filters || {}
    };

    const response = await axios.post<DataRecord[]>(SERVER_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[Client] Received response from server.');
    return { success: true, data: response.data };

  } catch (error) {
    console.error('[Client] Error querying data:', error);
    
    if (isAxiosError(error)) {
      const errorResponse: ErrorResponse = {
        error: error.response?.data?.error || 'Network error occurred',
        details: error.message
      };
      return { success: false, error: errorResponse };
    }
    
    return {
      success: false,
      error: {
        error: 'Unknown error occurred',
        details: error instanceof Error ? error.message : String(error)
      }
    };
  }
}