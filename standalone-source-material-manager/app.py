import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

# Wczytanie bezpiecznych kluczy z pliku .env
load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

app = Flask(__name__)
CORS(app) # Pozwala naszemu plikowi HTML łączyć się z tym skryptem

# 1. Endpoint do pobierania danych
@app.route('/api/tematy', methods=['GET'])
def pobierz_tematy():
    try:
        response = supabase.table("topics").select("*").order("id").execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. Endpoint do aktualizacji danych
@app.route('/api/tematy/<int:id>', methods=['POST'])
def aktualizuj_temat(id):
    try:
        nowe_dane = request.json
        response = supabase.table("topics").update(nowe_dane).eq("id", id).execute()
        return jsonify({"status": "sukces", "data": response.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Serwer działa na http://localhost:5000")
    app.run(port=5000)