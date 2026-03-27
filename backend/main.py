from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# FastAPI backend init
app = FastAPI(
    title="EduMath API",
    description="Backend API dla platformy hybrydowej EduMath",
    version="1.0.0"
)

# Configuration of CORS - to connect with frontend on vorcel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: restrict only to "https://edumath.vercel.app" or smth
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection helper
def get_db_connection():
    db_url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/edumath")
    return psycopg2.connect(db_url)

@app.get("/api/v1/health")
async def health_check():
    """
    Endpoint checking the availability of the service.
    Used for diagnostics on the frontend.
    """
    return {"status": "ok"}

@app.get("/api/v1/nodes")
async def get_nodes():
    """
    Pulls all nodes and their connections from the PostgreSQL database,
    so that the frontend can draw a graph from it.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Fetch nodes
        cur.execute("SELECT id, name, description FROM public.nodes;")
        nodes = cur.fetchall()
        
        # Fetch edges (Many-to-Many equivalent of parent_id)
        cur.execute("SELECT parent_id as source, child_id as target FROM public.node_edges;")
        edges = cur.fetchall()
        
        cur.close()
        conn.close()
        return {"nodes": nodes, "edges": edges}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/v1/nodes/{node_id}/lessons")
async def get_node_lessons(node_id: str):
    """
    Pulls all lessons associated with a specific node.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT id, title, video_url, content_markdown FROM public.lessons WHERE node_id = %s ORDER BY created_at ASC;", (node_id,))
        lessons = cur.fetchall()
        
        cur.close()
        conn.close()
        return {"lessons": lessons}
    except Exception as e:
        return {"error": str(e)}
