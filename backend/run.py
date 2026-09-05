import uvicorn
import os
import sys

# Ensure backend app is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and expose the app for deployment platforms (Render, Vercel, etc.)
from app.main import app

if __name__ == "__main__":
    print("Starting AI Personal Expense Tracker FastAPI Server on http://localhost:8000 ...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
