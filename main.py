
import os
import uvicorn
import mimetypes
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Ensure the browser identifies TSX/TS files correctly for the frontend loader
mimetypes.add_type('text/tsx', '.tsx')
mimetypes.add_type('text/typescript', '.ts')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/javascript', '.mjs')

# Databricks Apps are hosted at a subpath provided by DATABRICKS_APP_ROOT_PATH.
root_path = os.environ.get("DATABRICKS_APP_ROOT_PATH", "")
app = FastAPI(
    title="Data Platform Prioritizer API",
    root_path=root_path,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for internal proxy communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """Endpoint to verify the backend is active and visible in Swagger."""
    return {"status": "online", "workspace": "databricks"}

# Catch-all route for SPA behavior - must be defined BEFORE static mount
@app.exception_handler(404)
async def custom_404_handler(request: Request, __):
    # If the request is for an API endpoint, return 404
    if request.url.path.startswith("/api"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    # Otherwise serve index.html for SPA routing
    return FileResponse("index.html")

# Mount static files LAST to avoid shadowing API routes
# This serves all files from current directory including index.html
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    # Databricks Apps inject the port into DATABRICKS_APP_PORT.
    port = int(os.environ.get("DATABRICKS_APP_PORT", 8080))
    # Must listen on 0.0.0.0 for the Databricks proxy to route traffic.
    uvicorn.run(app, host="0.0.0.0", port=port)
