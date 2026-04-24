from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from typing import List

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
        
        # Fetch nodes (topics)
        cur.execute("""
            SELECT t.id, t.name, t.ui_x, t.ui_y, COUNT(s.id) as subtasks_count
            FROM public.topics t
            LEFT JOIN public.subtopics s ON t.id = s.topic_id
            GROUP BY t.id, t.name, t.ui_x, t.ui_y;
        """)
        nodes = cur.fetchall()
        
        # Fetch edges (topic_edges)
        cur.execute("SELECT parent_id as source, child_id as target FROM public.topic_edges;")
        edges = cur.fetchall()
        
        cur.close()
        conn.close()
        return {"nodes": nodes, "edges": edges}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/v1/nodes/{node_id}/lessons")
async def get_node_lessons(node_id: str):
    """
    Pulls all lessons (subtopics) associated with a specific node (topic).
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT id, name as title, importance FROM public.subtopics WHERE topic_id = %s ORDER BY created_at ASC;", (node_id,))
        lessons = cur.fetchall()
        
        cur.close()
        conn.close()
        return {"lessons": lessons}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/v1/lessons/{lesson_id}")
async def get_lesson_details(lesson_id: str):
    """
    Pulls details for a specific lesson (subtopic), including content_tex.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT id, topic_id, name as title, importance, sort_order, video_url, content_tex FROM public.subtopics WHERE id = %s;", (lesson_id,))
        lesson = cur.fetchone()
        
        cur.close()
        conn.close()
        if not lesson:
            return {"error": "Lesson not found"}
        return {"lesson": lesson}
    except Exception as e:
        return {"error": str(e)}

class NodePosition(BaseModel):
    id: str
    x: int
    y: int

class UpdatePositionsRequest(BaseModel):
    positions: List[NodePosition]

@app.put("/api/v1/nodes/positions")
async def update_node_positions(request: UpdatePositionsRequest):
    """
    Updates the physical X and Y coordinates for multiple topic nodes.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        for pos in request.positions:
            cur.execute(
                "UPDATE public.topics SET ui_x = %s, ui_y = %s WHERE id = %s",
                (pos.x, pos.y, pos.id)
            )
        conn.commit()
        cur.close()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}
