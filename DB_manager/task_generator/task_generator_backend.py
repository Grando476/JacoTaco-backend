import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client
from langchain_google_genai import ChatGoogleGenerativeAI
from pipeline import run_generation_pipeline
from flask import Response, stream_with_context

load_dotenv()
app = Flask(__name__)
CORS(app)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite-preview", 
    google_api_key=os.getenv("GOOGLE_API_KEY"), 
    temperature=0.7
)

@app.route('/api/generate/<tg_id>', methods=['POST'])
def generate_tasks_api(tg_id):
    counts = request.json 
    res = supabase.table("task_groups").select(
        "name, subtopics(name, content_tex, topics(name, content_tex, chapters(name)))"
    ).eq("id", tg_id).single().execute()
    
    d = res.data
    context = {
        "chapter": d['subtopics']['topics']['chapters']['name'],
        "topic": d['subtopics']['topics']['name'],
        "subtopic": d['subtopics']['name'],
        "group": d['name'],
        "topic_theory": d['subtopics']['topics'].get('content_tex', '') or "Brak",
        "subtopic_theory": d['subtopics'].get('content_tex', '') or "Brak"
    }

    # Zwraca dane kawałek po kawałku
    def generate():
        for task_json in run_generation_pipeline(llm, context, counts):
            yield task_json
            
    return Response(stream_with_context(generate()), mimetype='application/x-ndjson')

if __name__ == '__main__':
    app.run(port=5001)