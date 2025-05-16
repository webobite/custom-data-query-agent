# mcp-server-python/main.py
import pandas as pd
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import os
import json
import traceback
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="Custom Data Query MCP Server",
    description="An MCP-like server to query custom CSV data.",
    version="0.1.0"
)

# Custom exception handler for 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full error with traceback
    error_details = {
        "error": str(exc),
        "type": exc.__class__.__name__,
        "traceback": traceback.format_exc(),
        "path": request.url.path,
        "method": request.method,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    print("\n!!! UNHANDLED EXCEPTION !!!")
    print(json.dumps(error_details, indent=2))
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "details": str(exc),
            "type": exc.__class__.__name__,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# --- Data Loading ---
DATA_FILE_PATH = "data/sample_data.csv"
df_data = None

def load_data():
    """Loads data from the CSV file into a pandas DataFrame."""
    global df_data
    try:
        import os
        print(f"Current working directory: {os.getcwd()}")
        print(f"Looking for data file at: {os.path.abspath(DATA_FILE_PATH)}")
        
        # Check if file exists and is readable
        if not os.path.isfile(DATA_FILE_PATH):
            raise FileNotFoundError(f"File not found: {os.path.abspath(DATA_FILE_PATH)}")
            
        # Read the CSV file with proper type inference
        df_data = pd.read_csv(DATA_FILE_PATH)
        
        # Convert date columns to datetime
        date_columns = ['join_date']
        for col in date_columns:
            if col in df_data.columns:
                df_data[col] = pd.to_datetime(df_data[col])
        
        # Convert numeric columns to appropriate types
        numeric_columns = ['project_hours', 'id']
        for col in numeric_columns:
            if col in df_data.columns:
                df_data[col] = pd.to_numeric(df_data[col], errors='coerce')
        
        # Log basic info about the loaded data
        print("\n=== Data Loaded Successfully ===")
        print(f"Number of records: {len(df_data)}")
        print("\nFirst 5 rows:")
        print(df_data.head().to_string())
        print("\nColumn dtypes:")
        print(df_data.dtypes)
        print("\nUnique departments:", df_data['department'].unique().tolist())
        print("==============================\n")
        
        return date_columns  # Return the date columns list for use in query handling
        
        # Log basic info about the loaded data
        print("\n=== Data Loaded Successfully ===")
        print(f"Number of records: {len(df_data)}")
        print("\nFirst 5 rows:")
        print(df_data.head().to_string())
        print("\nColumn dtypes:")
        print(df_data.dtypes)
        print("\nUnique departments:", df_data['department'].unique().tolist())
        print("==============================\n")
        
    except FileNotFoundError as e:
        print(f"\n!!! ERROR: Data file not found !!!")
        print(f"Error: {e}")
        print("Current directory contents:", os.listdir(os.path.dirname(os.path.abspath(DATA_FILE_PATH))))
        df_data = pd.DataFrame() # Empty DataFrame
    except Exception as e:
        print(f"\n!!! ERROR loading data !!!")
        print(f"Error type: {type(e).__name__}")
        print(f"Error details: {e}")
        import traceback
        traceback.print_exc()
        df_data = pd.DataFrame() # Empty DataFrame

# Load data on startup
load_data()

# --- Query Logic ---
def query_data_source(
    filters: Optional[Dict[str, Any]] = None,
    ranges: Optional[Dict[str, Dict[str, Any]]] = None,
    sort_by: Optional[str] = None,
    sort_order: str = "asc",
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Queries the loaded DataFrame based on filters, ranges, sorting, and limiting.
    
    Args:
        filters: Dictionary of column-value pairs for exact matching
        ranges: Dictionary of column-range dictionaries for range queries
               Example: {"join_date": {"after": "2023-01-01", "before": "2023-12-31"}}
        sort_by: Column name to sort by
        sort_order: Sort order ('asc' or 'desc')
        limit: Maximum number of records to return
    """
    print(f"\n=== Query Debug ===")
    print(f"Original filters: {filters}")
    print(f"Range filters: {ranges}")
    
    if df_data is None or df_data.empty:
        error_msg = "Error: Data not loaded or empty - DataFrame is None or empty"
        print(error_msg)
        return [{"error": error_msg}]

    # Make a copy of the dataframe to work with
    queried_df = df_data.copy()
    
    # Convert date strings to datetime objects for proper comparison
    date_columns = [col for col in queried_df.columns if 'date' in col.lower()]
    for col in date_columns:
        if pd.api.types.is_string_dtype(queried_df[col]):
            try:
                queried_df[col] = pd.to_datetime(queried_df[col])
                print(f"Converted {col} to datetime")
            except Exception as e:
                print(f"Could not convert {col} to datetime: {e}")

    print(f"\nDataFrame columns: {queried_df.columns.tolist()}")
    print(f"First few rows of data:")
    print(queried_df.head().to_string())

    # Apply exact match filters
    if filters:
        for column, value in filters.items():
            if column not in queried_df.columns:
                error_msg = f"Invalid filter column: {column}"
                print(f"Error: {error_msg}")
                return [{"error": error_msg}]
            
            print(f"\nApplying filter - Column: '{column}', Value: '{value}'")
            print(f"Column dtype: {queried_df[column].dtype}")
            
            # Handle string comparisons (case-insensitive)
            if pd.api.types.is_string_dtype(queried_df[column]):
                print("Performing case-insensitive string comparison")
                mask = queried_df[column].str.lower() == str(value).lower()
            # Handle numeric comparisons
            else:
                print("Performing exact match comparison")
                mask = queried_df[column] == value
            
            # For status field, match exactly what's requested
            if column == 'status':
                mask = queried_df[column].str.lower() == str(value).lower()
            
            print(f"Matching rows: {mask.sum()}")
            queried_df = queried_df[mask]
            print(f"Rows after filter: {len(queried_df)}")
    
    # Apply range filters
    if ranges:
        for column, range_filters in ranges.items():
            if column not in queried_df.columns:
                error_msg = f"Invalid range column: {column}"
                print(f"Error: {error_msg}")
                return [{"error": error_msg}]
                
            print(f"\nApplying range filter - Column: '{column}', Ranges: {range_filters}")
            print(f"Column dtype: {queried_df[column].dtype}")
            
            # Apply each range condition
            for op, value in range_filters.items():
                if op == 'after':
                    if pd.api.types.is_datetime64_any_dtype(queried_df[column]):
                        value = pd.to_datetime(value)
                    mask = queried_df[column] > value
                elif op == 'before':
                    if pd.api.types.is_datetime64_any_dtype(queried_df[column]):
                        value = pd.to_datetime(value)
                    mask = queried_df[column] < value
                elif op == 'gte':
                    if pd.api.types.is_datetime64_any_dtype(queried_df[column]):
                        value = pd.to_datetime(value)
                    mask = queried_df[column] >= value
                elif op == 'lte':
                    if pd.api.types.is_datetime64_any_dtype(queried_df[column]):
                        value = pd.to_datetime(value)
                    mask = queried_df[column] <= value
                else:
                    print(f"Warning: Unknown range operator '{op}', skipping")
                    continue
                    
                print(f"Applied {op} {value}: {mask.sum()} rows match")
                queried_df = queried_df[mask]
    
    # Apply sorting if sort_by is specified
    if sort_by and sort_by in queried_df.columns:
        print(f"\nSorting by '{sort_by}' in {sort_order} order")
        ascending = sort_order.lower() == 'asc'
        queried_df = queried_df.sort_values(by=sort_by, ascending=ascending)
    
    # Apply limit if specified
    if limit is not None and limit > 0:
        print(f"Limiting results to {limit} records")
        queried_df = queried_df.head(limit)
    
    # Convert datetime columns back to strings for JSON serialization
    for col in date_columns:
        if pd.api.types.is_datetime64_any_dtype(queried_df[col]):
            queried_df[col] = queried_df[col].dt.strftime('%Y-%m-%d')
    
    print(f"\nFinal result: {queried_df.to_dict(orient='records')}")
    print("=== End Query Debug ===\n")
    
    return queried_df.to_dict(orient='records')

# --- API Endpoint Definition ---

# Define the structure of the request body for the /query endpoint
class QueryRequest(BaseModel):
    # In a full MCP implementation, you might have more structured fields like:
    # tool_name: str
    # parameters: Dict[str, Any]
    # For now, we'll keep it simple with just filters.
    filters: Optional[Dict[str, Any]] = None
    # We could add a 'query_string' field later for natural language or SQL-like queries

@app.post("/query", summary="Query the custom data source")
async def handle_query(request: Request) -> Dict[str, Any]:
    """
    Receives a query request (e.g., with filters) and returns matching data.
    This endpoint acts as an MCP "tool".
    
    The request can be in one of these formats:
    1. Top-level filters: {"department": "Engineering"}
    2. Nested filters: {"filters": {"department": "Engineering"}}
    3. Range queries: {"ranges": {"join_date": {"after": "2023-01-01"}}}
    4. Empty request: {}
    """
    try:
        print(f"\n=== Received Request ===")
        # Get the raw request body
        request_body = await request.json()
        print(f"Request body: {request_body}")
        print(f"Request type: {type(request_body)}")
        
        # Handle both dict and JSON object formats
        if isinstance(request_body, dict):
            query_data = request_body
        else:
            # If it's not a dict, try to get the first item if it's a list
            if isinstance(request_body, list) and len(request_body) > 0:
                query_data = request_body[0]
            else:
                query_data = {}
        
        # Handle case where request is None or empty
        if not request:
            print("Warning: Empty request received, returning all records")
            results = query_data_source()
            return format_success_response(results)
        
        # Extract filters and ranges from the request
        print("\n=== Request Processing ===")
        print(f"Request body: {query_data}")
        
        # Extract filters, ranges, sort, and limit from the request
        filters = query_data.get('filters', {})
        ranges = query_data.get('ranges', {})
        sort_config = query_data.get('sort', None)
        limit = query_data.get('limit')
        offset = query_data.get('offset', 0)
        
        # Handle both sort formats
        if sort_config is not None:
            if isinstance(sort_config, dict):
                sort_by = sort_config.get('field')
                sort_order = sort_config.get('order', 'asc')
            else:
                # Handle legacy format where sort is a string
                sort_by = sort_config
                sort_order = 'asc'
        else:
            # Handle legacy sort_by/sort_order format
            sort_by = query_data.get('sort_by')
            sort_order = query_data.get('sort_order', 'asc')
        
        # Validate sort parameters
        if sort_by and sort_by not in df_data.columns:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": f"Invalid sort field: {sort_by}",
                    "valid_fields": df_data.columns.tolist()
                }
            )
        if sort_order not in ['asc', 'desc']:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": f"Invalid sort order: {sort_order}",
                    "valid_orders": ['asc', 'desc']
                }
            )
        
        # Start with all records
        queried_df = df_data.copy()
        print(f"Starting with {len(queried_df)} records")
        
        # Apply filters
        for field in queried_df.columns:
            if field in filters:
                value = filters[field]
                if isinstance(value, list):
                    # If value is a list, use isin for multiple matches
                    if pd.api.types.is_string_dtype(queried_df[field]):
                        # Case-insensitive string comparison for text fields
                        queried_df = queried_df[queried_df[field].str.lower().isin([str(v).lower() for v in value])]
                    else:
                        # Exact match for numeric fields
                        queried_df = queried_df[queried_df[field].isin(value)]
                else:
                    if pd.api.types.is_string_dtype(queried_df[field]):
                        # Case-insensitive string comparison for text fields
                        queried_df = queried_df[queried_df[field].str.lower() == str(value).lower()]
                    elif pd.api.types.is_numeric_dtype(queried_df[field]):
                        # Exact match for numeric fields
                        queried_df = queried_df[queried_df[field] == value]
            elif field in ranges:
                # Handle range filters
                range_filters = ranges[field]
                # Handle date comparisons by converting to datetime if needed
                for op in ['after', 'before', 'gte', 'lte', 'gt', 'lt']:
                    if op in range_filters:
                        value = range_filters[op]
                        # Convert string to datetime if needed
                        if isinstance(value, str):
                            try:
                                value = pd.to_datetime(value)
                            except:
                                print(f"Warning: Could not convert {value} to datetime for {op} comparison")
                                continue
                        
                        # Apply the comparison
                        if op == 'after':
                            queried_df = queried_df[pd.to_datetime(queried_df[field]) >= value]
                        elif op == 'before':
                            queried_df = queried_df[pd.to_datetime(queried_df[field]) <= value]
                        elif op == 'gte':
                            queried_df = queried_df[pd.to_datetime(queried_df[field]) >= value]
                        elif op == 'lte':
                            queried_df = queried_df[pd.to_datetime(queried_df[field]) <= value]
                        elif op == 'gt':
                            queried_df = queried_df[pd.to_datetime(queried_df[field]) > value]
                        elif op == 'lt':
                            queried_df = queried_df[pd.to_datetime(queried_df[field]) < value]
            if field in filters:
                filters[field] = str(filters[field]).lower()
        
        # Handle partial matches for role
        if 'role' in filters:
            role_value = filters['role'].lower()
            # Create a mask for partial matching of role
            role_mask = queried_df['role'].str.lower().str.contains(role_value)
            # Also match common variations
            variations = [
                f"{role_value}",
                f"{role_value} manager",
                f"{role_value} executive",
                f"{role_value} specialist"
            ]
            for variation in variations:
                role_mask |= queried_df['role'].str.lower().str.contains(variation)
            # Apply the mask to filter the DataFrame
            queried_df = queried_df[role_mask]
            print(f"Filtered by role (partial match): {len(queried_df)} records")
        
        # Handle simplified date range formats
        if 'join_date_after' in filters:
            after_date = filters.pop('join_date_after')
            if 'join_date' not in ranges:
                ranges['join_date'] = {}
            ranges['join_date']['after'] = after_date
        if 'join_date_before' in filters:
            before_date = filters.pop('join_date_before')
            if 'join_date' not in ranges:
                ranges['join_date'] = {}
            ranges['join_date']['before'] = before_date
        
        # Process range filters
        for field, conditions in ranges.items():
            if field not in queried_df.columns:
                print(f"Warning: Skipping unknown range field: {field}")
                continue
            
            # Handle different comparison operators
            if 'lt' in conditions:
                queried_df = queried_df[queried_df[field] < conditions['lt']]
            if 'lte' in conditions:
                queried_df = queried_df[queried_df[field] <= conditions['lte']]
            if 'gt' in conditions:
                queried_df = queried_df[queried_df[field] > conditions['gt']]
            if 'gte' in conditions:
                queried_df = queried_df[queried_df[field] >= conditions['gte']]
            if 'after' in conditions:
                queried_df = queried_df[queried_df[field] > conditions['after']]
            if 'before' in conditions:
                queried_df = queried_df[queried_df[field] < conditions['before']]
            
            # Log the filtering
            print(f"Filtered by {field} range: {len(queried_df)} records remaining")
            
        # Convert date ranges to proper format
        if 'join_date' in ranges:
            # Convert date strings to datetime objects
            for op, value in ranges['join_date'].items():
                if isinstance(value, str):
                    try:
                        # Convert to datetime and ensure timezone is handled correctly
                        ranges['join_date'][op] = pd.to_datetime(value).tz_localize(None)
                    except ValueError:
                        print(f"Warning: Invalid date format for {op}: {value}")
                        continue
            
            # Apply date range filters
            if 'after' in ranges['join_date']:
                queried_df = queried_df[queried_df['join_date'] > ranges['join_date']['after']]
            if 'before' in ranges['join_date']:
                queried_df = queried_df[queried_df['join_date'] < ranges['join_date']['before']]
        
        # Apply sorting if sort_by is specified
        if sort_by and sort_by in queried_df.columns:
            print(f"\nSorting by '{sort_by}' in {sort_order} order")
            ascending = sort_order.lower() == 'asc'
            queried_df = queried_df.sort_values(by=sort_by, ascending=ascending)
            print(f"Sorted {len(queried_df)} records")
        
        # Apply limit and offset if specified
        if limit is not None and limit > 0:
            print(f"Limiting results to {limit} records")
            queried_df = queried_df.iloc[offset:offset + limit]
            print(f"Final record count: {len(queried_df)}")
        
        # Convert datetime columns back to strings for JSON serialization
        date_columns = ['join_date']  # Define date columns here
        for col in date_columns:
            if pd.api.types.is_datetime64_any_dtype(queried_df[col]):
                queried_df[col] = queried_df[col].dt.strftime('%Y-%m-%d')
        
        print(f"\nFinal result: {queried_df.to_dict(orient='records')}")
        print("=== End Query Debug ===\n")
        
        # Return results in a proper FastAPI response format
        return {
            "success": True,
            "data": queried_df.to_dict(orient='records'),
            "total_count": len(queried_df)
        }
    except Exception as e:
        print(f"\n!!! ERROR processing query !!!")
        print(f"Error type: {type(e).__name__}")
        print(f"Error details: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "type": type(e).__name__,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        # Convert project_hours range filter if present
        if 'project_hours' in ranges:
            if 'gt' in ranges['project_hours']:
                ranges['project_hours']['gte'] = ranges['project_hours']['gt']
                del ranges['project_hours']['gt']
            if 'lt' in ranges['project_hours']:
                ranges['project_hours']['lte'] = ranges['project_hours']['lt']
                del ranges['project_hours']['lt']
        
        # Convert project_hours range filter if present
        if 'project_hours' in ranges:
            if 'gt' in ranges['project_hours']:
                ranges['project_hours']['gte'] = ranges['project_hours']['gt']
                del ranges['project_hours']['gt']
            if 'lt' in ranges['project_hours']:
                ranges['project_hours']['lte'] = ranges['project_hours']['lt']
                del ranges['project_hours']['lt']
        
        if sort_by:
            print(f"Sorting by: {sort_by} ({sort_order})")
        if limit is not None:
            print(f"Limiting to: {limit} records")
            
        print(f"Filters to apply: {filters}")
        print(f"Ranges to apply: {ranges}")
        print("=======================")
        
        # Process the query with filters, ranges, sorting, and limiting
        results = query_data_source(
            filters=filters,
            ranges=ranges,
            sort_by=sort_by,
            sort_order=sort_order,
            limit=limit
        )
        return format_success_response(results)
        
    except Exception as e:
        error_msg = f"Error in handle_query: {str(e)}"
        print(f"\n!!! {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "details": str(e),
                "type": e.__class__.__name__
            }
        )

def format_success_response(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Format a successful response in the expected format."""
    return {
        "data": results,
        "metadata": {
            "query_time_ms": 0,  # You can add actual timing if needed
            "total_matches": len(results)
        }
    }

@app.get("/", summary="Server status")
async def root():
    return {"message": "Custom Data Query MCP Server is running."}

# --- To run this server (from the mcp-server-python directory): ---
# uvicorn main:app --reload