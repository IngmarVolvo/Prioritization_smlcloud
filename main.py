
import os
import uvicorn
import mimetypes
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure the browser treats .ts and .tsx files as JavaScript modules
mimetypes.add_type('application/javascript', '.ts')
mimetypes.add_type('application/javascript', '.tsx')

# Databricks Apps are often hosted behind a proxy at a subpath.
# We use root_path to ensure Swagger and routing work correctly.
app = FastAPI(root_path=os.environ.get("DATABRICKS_APP_ROOT_PATH", ""))

# Mount the current directory to serve static assets (.tsx, .ts, index.html, etc.)
# html=True ensures index.html is served automatically at the root.
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    # Databricks Apps inject the port into DATABRICKS_APP_PORT.
    # Fallback to 8080 for local development.
    port = int(os.environ.get("DATABRICKS_APP_PORT", 8080))
    # Host must be 0.0.0.0 for visibility within the Databricks network.
    uvicorn.run(app, host="0.0.0.0", port=port)
