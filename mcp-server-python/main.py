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
            
        # Read the CSV file
        df_data = pd.read_csv(DATA_FILE_PATH)
        
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
def query_data_source(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Queries the loaded DataFrame based on simple equality filters.
    Example filter: {"department": "Engineering"}
    """
    print(f"\n=== Query Debug ===")
    print(f"Original filters: {filters}")
    
    if df_data is None or df_data.empty:
        error_msg = "Error: Data not loaded or empty - DataFrame is None or empty"
        print(error_msg)
        return [{"error": error_msg}]

    print(f"\nDataFrame columns: {df_data.columns.tolist()}")
    print(f"First few rows of data:")
    print(df_data.head().to_string())

    if not filters:
        print("No filters provided, returning all records")
        return df_data.to_dict(orient='records')
    
    # Apply filters with case-insensitive string matching
    queried_df = df_data.copy()
    
    for column, value in filters.items():
        if column not in queried_df.columns:
            error_msg = f"Invalid filter column: {column}"
            print(f"Error: {error_msg}")
            return [{"error": error_msg}]
        
        print(f"\nApplying filter - Column: '{column}', Value: '{value}'")
        print(f"Column dtype: {queried_df[column].dtype}")
        print(f"Unique values in column: {queried_df[column].unique()}")
        
        # Convert both the column and filter value to lowercase for case-insensitive comparison
        if pd.api.types.is_string_dtype(queried_df[column]):  # String column
            print(f"Performing case-insensitive string comparison")
            mask = queried_df[column].str.lower() == str(value).lower()
            print(f"Matching rows: {mask.sum()}")
            print(f"Mask: {mask.tolist()}")
            queried_df = queried_df[mask]
        else:  # Numeric or other types
            print(f"Performing exact match comparison")
            mask = queried_df[column] == value
            print(f"Matching rows: {mask.sum()}")
            print(f"Mask: {mask.tolist()}")
            queried_df = queried_df[mask]
        
        print(f"Rows after filter: {len(queried_df)}")
    
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
async def handle_query(request: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Receives a query request (e.g., with filters) and returns matching data.
    This endpoint acts as an MCP "tool".
    
    The request can be in one of these formats:
    1. Top-level filters: {"department": "Engineering"}
    2. Nested filters: {"filters": {"department": "Engineering"}}
    3. Empty request: {}
    """
    try:
        print(f"\n=== Received Request ===")
        print(f"Request body: {request}")
        print(f"Request type: {type(request)}")
        
        # Handle case where request is None or empty
        if not request:
            print("Warning: Empty request received, returning all records")
            results = query_data_source()
            return format_success_response(results)
        
        # Handle different request formats
        print("\n=== Request Processing ===")
        print(f"Request keys: {list(request.keys())}")
        
        if 'filters' in request and isinstance(request['filters'], dict):
            # Case 2: Nested filters format
            print("Using nested filters format")
            filters = request['filters']
        elif any(key in request for key in ['department', 'name', 'role', 'status', 'search']):
            # Case 1: Top-level filters format
            print("Using top-level filters format")
            filters = request
        else:
            # No valid filters found, return all records
            print("No valid filters found, returning all records")
            filters = {}
        
        print(f"Final filters to apply: {filters}")
        print("=======================")
        
        print(f"Extracted filters: {filters}")
        
        results = query_data_source(filters=filters)
        return format_success_response(results)
        
    except Exception as e:
        print(f"\n!!! Error in handle_query: {str(e)}")
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