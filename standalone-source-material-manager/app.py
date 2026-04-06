import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

app = Flask(__name__)
CORS(app)

# Pobiera CAŁĄ strukturę bazy za jednym razem
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

# Uniwersalny endpoint do aktualizacji DOWOLNEJ tabeli
@app.route('/api/update/<table>/<id>', methods=['POST'])
def aktualizuj(table, id):
    try:
        nowe_dane = request.json
        supabase.table(table).update(nowe_dane).eq("id", id).execute()
        return jsonify({"status": "sukces"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Serwer API działa na http://localhost:5000")
    app.run(port=5000)