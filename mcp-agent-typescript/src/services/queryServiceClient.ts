// src/services/queryServiceClient.ts
import axios from 'axios';
import type { AxiosError } from 'axios';
import { isAxiosError } from 'axios';

// The URL of our Python MCP server
const SERVER_URL = 'http://localhost:8000/query';

export interface QueryFilters {
  // Basic filters
  department?: string | string[];
  name?: string | string[];
  role?: string | string[];
  status?: 'active' | 'inactive' | 'on_leave';
  
  // Numeric ranges
  min_hours?: number;
  max_hours?: number;
  
  // Date ranges
  join_date_after?: string;  // YYYY-MM-DD format
  join_date_before?: string; // YYYY-MM-DD format
  
  // Search and pagination
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  
  // Allow additional properties for flexibility
  [key: string]: unknown;
}

// Define the structure of a data record
export interface DataRecord {
  id: number;
  name: string;
  email?: string;
  department: string;
  role?: string;
  project_hours: number;
  join_date?: string; // ISO date string
  status?: 'active' | 'inactive' | 'on_leave';
  [key: string]: unknown; // Allow additional fields
}

// Define pagination metadata
interface PaginationInfo {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Define the structure for a successful response
interface SuccessResponse {
  data: DataRecord[];
  pagination?: PaginationInfo;
  metadata?: {
    query_time_ms?: number;
    total_matches?: number;
    [key: string]: unknown;
  };
}

// Define the structure for an error response
interface ErrorResponse {
  error: string;
  details?: string | Record<string, unknown>;
  code?: string | number;
  timestamp?: string;
}

// Define a discriminated union type for the response
type QueryResult = 
  | { success: true; data: DataRecord[]; pagination?: PaginationInfo; metadata?: Record<string, unknown> }
  | { success: false; error: ErrorResponse };

/**
 * Sends a query to the server with the specified filters
 * @param filters Query filters and options
 * @returns Promise with query results or error
 */
export async function queryCustomData(filters?: QueryFilters): Promise<QueryResult> {
  try {
    console.log(`[Client] Sending query to ${SERVER_URL}`);
    console.debug('[Client] Query filters:', JSON.stringify(filters || {}, null, 2));

    // Prepare the request body with filters
    const requestBody: Record<string, unknown> = {};
    
    // Add filters if provided
    if (filters) {
      // Handle basic filters
      const { 
        department, name, role, status,
        min_hours, max_hours,
        join_date_after, join_date_before,
        search, sort_by, sort_order,
        limit, offset,
        ...restFilters
      } = filters;
      
      // Add explicit filters
      const explicitFilters: Record<string, unknown> = {};
      if (department) explicitFilters.department = department;
      if (name) explicitFilters.name = name;
      if (role) explicitFilters.role = role;
      if (status) explicitFilters.status = status;
      
      // Add ranges
      const ranges: {
        project_hours?: { gte?: number; lte?: number; gt?: number; lt?: number };
        join_date?: { after?: string; before?: string };
        [key: string]: unknown;
      } = {};
      
      if (min_hours !== undefined || max_hours !== undefined) {
        ranges.project_hours = {};
        if (min_hours !== undefined) ranges.project_hours.gte = min_hours;
        if (max_hours !== undefined) ranges.project_hours.lte = max_hours;
      }
      
      if (join_date_after || join_date_before) {
        ranges.join_date = {};
        if (join_date_after) ranges.join_date.after = join_date_after;
        if (join_date_before) ranges.join_date.before = join_date_before;
      }
      
      // Add search and sort
      if (search) requestBody.search = search;
      if (sort_by) {
        requestBody.sort = {
          field: sort_by,
          order: sort_order || 'asc'
        };
      }
      
      // Add pagination
      if (limit !== undefined) requestBody.limit = limit;
      if (offset !== undefined) requestBody.offset = offset;
      
      // Add filters and ranges to request body
      if (Object.keys(explicitFilters).length > 0) requestBody.filters = explicitFilters;
      if (Object.keys(ranges).length > 0) requestBody.ranges = ranges;
      
      // Add any additional filters
      if (Object.keys(restFilters).length > 0) {
        requestBody.additional_filters = restFilters;
      }
    }

    // Make the API request
    const response = await axios.post<SuccessResponse>(
      SERVER_URL, 
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Log successful response summary
    console.log(`[Client] Query successful. Received ${response.data.data?.length || 0} records`);
    
    // Return the successful response
    return { 
      success: true, 
      data: response.data.data || [],
      pagination: response.data.pagination,
      metadata: response.data.metadata
    };

  } catch (error) {
    console.error('[Client] Error querying data:', error);
    
    // Handle Axios errors
    if (isAxiosError(error)) {
      const responseData = error.response?.data || {};
      const errorResponse: ErrorResponse = {
        error: typeof responseData.error === 'string' 
          ? responseData.error 
          : 'API request failed',
        details: responseData.details || error.message,
        code: responseData.code || error.response?.status,
        timestamp: responseData.timestamp || new Date().toISOString()
      };
      
      console.error('[Client] API Error:', errorResponse);
      return { success: false, error: errorResponse };
    }
    
    // Handle other types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Client] Unexpected error:', errorMessage);
    
    return {
      success: false,
      error: {
        error: 'Unexpected error occurred',
        details: errorMessage,
        timestamp: new Date().toISOString()
      }
    };
  }
}