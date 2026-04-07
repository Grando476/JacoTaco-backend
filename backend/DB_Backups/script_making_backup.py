import os
import json
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing Supabase keys in .env file!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_dynamic_backup():
    print("Fetching list of tables from database...")
    
    try:
        # Call the RPC function we created in Supabase SQL Editor
        rpc_response = supabase.rpc("get_public_tables").execute()
        tables = [row['table_name'] for row in rpc_response.data]
        print(f"Found {len(tables)} tables: {', '.join(tables)}")
    except Exception as e:
        print(f"ERROR: Could not fetch tables. Did you create the get_public_tables() function? Details: {e}")
        return

    backup_data = {}
    total_records = 0
    
    print("\nStarting data download...")
    for table in tables:
        print(f"Downloading table: {table}...")
        try:
            res = supabase.table(table).select("*").limit(10000).execute()
            backup_data[table] = res.data
            count = len(res.data)
            total_records += count
            print(f"    Downloaded records: {count}")
        except Exception as e:
            print(f"    Error downloading {table}: {e}")

    date_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_name = f"backup_matgraph_dynamic_{date_str}.json"
    
    with open(file_name, "w", encoding="utf-8") as file:
        json.dump(backup_data, file, ensure_ascii=False, indent=4)
        
    print("-" * 40)
    print(f"Done! Saved a total of {total_records} records across {len(tables)} tables.")
    print(f"Backup file: {file_name}")

if __name__ == "__main__":
    create_dynamic_backup()