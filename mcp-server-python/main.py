# mcp-server-python/main.py
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel # For request body validation
from typing import List, Dict, Any, Optional

# --- Application Setup ---
app = FastAPI(
    title="Custom Data Query MCP Server",
    description="An MCP-like server to query custom CSV data.",
    version="0.1.0"
)

# --- Data Loading ---
DATA_FILE_PATH = "data/sample_data.csv"
df_data = None

def load_data():
    """Loads data from the CSV file into a pandas DataFrame."""
    global df_data
    try:
        df_data = pd.read_csv(DATA_FILE_PATH)
        # Convert to a more JSON-friendly format if needed for specific query types later
        # For now, keeping it as a DataFrame for easy querying with pandas
        print("Data loaded successfully!")
    except FileNotFoundError:
        print(f"Error: The data file was not found at {DATA_FILE_PATH}")
        df_data = pd.DataFrame() # Empty DataFrame
    except Exception as e:
        print(f"Error loading data: {e}")
        df_data = pd.DataFrame() # Empty DataFrame

# Load data on startup
load_data()

# --- Query Logic ---
def query_data_source(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Queries the loaded DataFrame based on simple equality filters.
    Example filter: {"department": "Engineering"}
    """
    if df_data is None or df_data.empty:
        return [{"error": "Data not loaded or empty."}]

    if not filters:
        # If no filters, return all data (or a sample for very large datasets)
        return df_data.to_dict(orient='records')

    # Apply filters
    # For simplicity, this example uses basic equality checks.
    # More complex queries would require more sophisticated parsing.
    queried_df = df_data.copy()
    for column, value in filters.items():
        if column in queried_df.columns:
            queried_df = queried_df[queried_df[column] == value]
        else:
            return [{"error": f"Invalid filter column: {column}"}]

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
async def handle_query(request: QueryRequest) -> List[Dict[str, Any]]:
    """
    Receives a query request (e.g., with filters) and returns matching data.
    This endpoint acts as an MCP "tool".
    """
    print(f"Received query request with filters: {request.filters}")
    results = query_data_source(filters=request.filters)
    return results

@app.get("/", summary="Server status")
async def root():
    return {"message": "Custom Data Query MCP Server is running."}

# --- To run this server (from the mcp-server-python directory): ---
# uvicorn main:app --reload