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
def pobierz_wszystko():
    try:
        return jsonify({
            "chapters": supabase.table("chapters").select("*").order("created_at").execute().data,
            "topics": supabase.table("topics").select("*, chapters(name)").order("created_at").execute().data,
            "subtopics": supabase.table("subtopics").select("*, topics(name)").order("created_at").execute().data,
            "task_groups": supabase.table("task_groups").select("*, subtopics(name)").order("created_at").execute().data,
            "tasks": supabase.table("tasks").select("*, task_groups(name)").order("created_at").execute().data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update/<table>/<id>', methods=['POST'])
def aktualizuj(table, id):
    try:
        nowe_dane = request.json
        supabase.table(table).update(nowe_dane).eq("id", id).execute()
        return jsonify({"status": "sukces"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# NOWY ENDPOINT: Dodawanie nowych rekordów
@app.route('/api/create/<table>', methods=['POST'])
def stworz(table):
    try:
        nowe_dane = request.json
        # Usuwamy id z danych, jeśli przyszło puste, żeby Supabase wygenerował UUID
        if "id" in nowe_dane: del nowe_dane["id"]
        res = supabase.table(table).insert(nowe_dane).execute()
        return jsonify({"status": "sukces", "data": res.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/delete/<table>/<id>', methods=['DELETE'])
def usun(table, id):
    try:
        supabase.table(table).delete().eq("id", id).execute()
        return jsonify({"status": "sukces"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)