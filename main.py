
import os
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# Serve the main index.html for the root path
@app.get("/")
async def read_index():
    return FileResponse("index.html")

# Mount the current directory to serve static assets (.tsx, .ts, css, etc.)
# This allows the browser to fetch the ES modules directly.
app.mount("/", StaticFiles(directory="."), name="static")

if __name__ == "__main__":
    # Databricks Apps inject the port into DATABRICKS_APP_PORT.
    # We fallback to PORT or 8080 for local development.
    port = int(os.environ.get("DATABRICKS_APP_PORT", os.environ.get("PORT", 8080)))
    # Host must be 0.0.0.0 to be accessible within the Databricks network.
    uvicorn.run(app, host="0.0.0.0", port=port)
