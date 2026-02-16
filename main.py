import os
import uvicorn
import mimetypes
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Databricks Apps requires specific MIME types for the browser to treat TSX as modules
mimetypes.add_type('application/javascript', '.ts')
mimetypes.add_type('application/javascript', '.tsx')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/javascript', '.mjs')

# Databricks Apps are hosted at a subpath provided by DATABRICKS_APP_ROOT_PATH.
# This variable is crucial for the app to resolve its own URLs correctly behind the proxy.
root_path = os.environ.get("DATABRICKS_APP_ROOT_PATH", "")

app = FastAPI(
    title="Data Platform Prioritizer",
    description="A RICE-based prioritization tool for Databricks Apps.",
    root_path=root_path,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS to allow the frontend to communicate with the backend proxy if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """Endpoint for monitoring and to ensure Swagger UI has content."""
    return {
        "status": "online",
        "workspace": "databricks",
        "root_path": root_path
    }

# SPA Root: Serves the main HTML entry point
@app.get("/")
async def serve_index():
    return FileResponse("index.html")

# Static files mount - we mount this after individual routes
app.mount("/", StaticFiles(directory=".", html=True), name="static")

@app.exception_handler(404)
async def custom_404_handler(request: Request, __):
    """
    Handle Single Page Application (SPA) routing in the Databricks Proxy.
    If a path is not found (like /timeline) and it's not an API call, serve index.html.
    """
    if request.url.path.startswith(f"{root_path}/api") or request.url.path.startswith("/api"):
        return JSONResponse(status_code=404, content={"detail": "API route not found"})
    
    # Strip the root path from the request to check if it's a real local file
    local_path = request.url.path.replace(root_path, "").lstrip("/")
    
    # If the file exists on disk (e.g. App.tsx, styles.css), return it
    if os.path.exists(local_path) and os.path.isfile(local_path):
        return FileResponse(local_path)
        
    # Otherwise, fallback to index.html for React Router to handle
    return FileResponse("index.html")

if __name__ == "__main__":
    # Databricks Apps inject the port into DATABRICKS_APP_PORT.
    port = int(os.environ.get("DATABRICKS_APP_PORT", 8080))
    # Must listen on 0.0.0.0 for the Databricks proxy to reach the app.
    uvicorn.run(app, host="0.0.0.0", port=port)
