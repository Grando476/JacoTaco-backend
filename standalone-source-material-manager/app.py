import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

app = Flask(__name__)
CORS(app)

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        return jsonify({
            "chapters": supabase.table("chapters").select("*").order("created_at").execute().data,
            "topics": supabase.table("topics").select("*, chapters(name)").order("created_at").execute().data,
            "subtopics": supabase.table("subtopics").select("*, topics(name)").order("sort_order").execute().data,
            "task_groups": supabase.table("task_groups").select("*, subtopics(name)").order("created_at").execute().data,
            "tasks": supabase.table("tasks").select("*, task_groups(name)").order("created_at").execute().data,
            "topic_edges": supabase.table("topic_edges").select("*").execute().data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update/<table>/<id>', methods=['POST'])
def update_data(table, id):
    try:
        new_data = request.json
        supabase.table(table).update(new_data).eq("id", id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create/<table>', methods=['POST'])
def create_data(table):
    try:
        new_data = request.json
        if "id" in new_data: del new_data["id"]
        res = supabase.table(table).insert(new_data).execute()
        return jsonify({"status": "success", "data": res.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete/<table>/<id>', methods=['DELETE'])
def delete_data(table, id):
    try:
        supabase.table(table).delete().eq("id", id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete_edge/<parent_id>/<child_id>', methods=['DELETE'])
def delete_edge(parent_id, child_id):
    try:
        supabase.table("topic_edges").delete().eq("parent_id", parent_id).eq("child_id", child_id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)