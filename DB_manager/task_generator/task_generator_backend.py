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
    temperature=0.9
)

@app.route('/api/generate/<tg_id>', methods=['POST'])
def generate_tasks_api(tg_id):
    counts = request.json 
    res = supabase.table("task_groups").select(
        "name, subtopics(id, name, content_tex, task_groups(name), topics(name, content_tex, chapters(name)))"
    ).eq("id", tg_id).single().execute()
    
    d = res.data
    subtopic_id = d['subtopics']['id']
    
    try:
        pk_res = supabase.rpc("get_prior_knowledge", {"p_subtopic_id": subtopic_id}).execute()
        prior_knowledge = pk_res.data or {}
    except Exception as e:
        print(f"Warning: Failed to fetch prior knowledge: {e}")
        prior_knowledge = {}

    known_topics_names = prior_knowledge.get("known_topics_names") or []
    known_subtopics_data = prior_knowledge.get("known_subtopics") or []
    unknown_topics_names = prior_knowledge.get("unknown_topics_names") or []
    
    # Format subtopics theories
    known_subtopics_theories = []
    for st in known_subtopics_data:
        known_subtopics_theories.append(f"{st.get('name')}: {st.get('content_tex', '')}")

    sibling_task_groups = [tg['name'] for tg in d['subtopics'].get('task_groups', []) if tg['name'] != d['name']]

    context = {
        "chapter": d['subtopics']['topics']['chapters']['name'],
        "topic": d['subtopics']['topics']['name'],
        "subtopic": d['subtopics']['name'],
        "group": d['name'],
        "topic_theory": d['subtopics']['topics'].get('content_tex', '') or "Brak",
        "subtopic_theory": d['subtopics'].get('content_tex', '') or "Brak",
        "known_topics_names": ", ".join(known_topics_names) if known_topics_names else "Brak",
        "known_subtopics_theories": " | ".join(known_subtopics_theories) if known_subtopics_theories else "Brak",
        "unknown_topics_names": ", ".join(unknown_topics_names) if unknown_topics_names else "Brak",
        "sibling_task_groups": ", ".join(sibling_task_groups) if sibling_task_groups else "Brak"
    }

    # Zwraca dane kawałek po kawałku
    def generate():
        for task_json in run_generation_pipeline(llm, context, counts):
            yield task_json
            
    return Response(stream_with_context(generate()), mimetype='application/x-ndjson')

if __name__ == '__main__':
    app.run(port=5001)