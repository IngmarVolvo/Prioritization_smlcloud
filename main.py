import os
import uvicorn
import mimetypes
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Databricks Apps often require specific MIME types to be set for the browser 
# to correctly interpret .tsx and .ts files as modules.
mimetypes.add_type('application/javascript', '.ts')
mimetypes.add_type('application/javascript', '.tsx')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/javascript', '.mjs')

# Databricks Apps are hosted at a subpath provided by DATABRICKS_APP_ROOT_PATH.
# This must be passed to FastAPI so it generates the correct internal URLs.
root_path = os.environ.get("DATABRICKS_APP_ROOT_PATH", "")

app = FastAPI(
    title="Data Platform Prioritizer",
    description="A RICE-based prioritization tool for Databricks Apps.",
    root_path=root_path
)

# Standard CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """Endpoint for platform health monitoring."""
    return {
        "status": "online", 
        "root_path": root_path,
        "environment": "databricks"
    }

# Explicitly serve index.html at the root of the app.
@app.get("/")
async def serve_index():
    return FileResponse("index.html")

# Mount the current directory to serve all static assets (.tsx, .ts, .js)
# We mount this AFTER the API routes to ensure they aren't shadowed.
app.mount("/", StaticFiles(directory=".", html=True), name="static")

@app.exception_handler(404)
async def custom_404_handler(request: Request, __):
    """
    SPA Fallback: If a route is not found (and it's not an API call),
    serve index.html to allow React Router to handle the path.
    """
    # Don't fallback for API routes
    if request.url.path.startswith(f"{root_path}/api") or request.url.path.startswith("/api"):
        return JSONResponse(status_code=404, content={"detail": "API route not found"})
    
    # Strip the root path from the request to check local filesystem
    local_path = request.url.path.replace(root_path, "").lstrip("/")
    
    # If it's a real file that exists, let the static mount handle it or return it
    if os.path.exists(local_path) and os.path.isfile(local_path):
        return FileResponse(local_path)
    
    # Default to SPA index.html
    return FileResponse("index.html")

if __name__ == "__main__":
    # Databricks Apps inject the port into DATABRICKS_APP_PORT (defaults to 8080).
    port = int(os.environ.get("DATABRICKS_APP_PORT", 8080))
    # Must listen on 0.0.0.0 for the Databricks proxy to route traffic.
    uvicorn.run(app, host="0.0.0.0", port=port)
