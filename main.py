
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# In a Databricks App environment, we serve the index.html for all routes
# to support client-side routing, or just the root for simple SPAs.

@app.get("/")
async def read_index():
    return FileResponse("index.html")

# Serve other static files (index.tsx, etc.)
# Note: The frontend uses ESM imports directly from the browser/CDN
# so we just need to ensure the local files are accessible.
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
