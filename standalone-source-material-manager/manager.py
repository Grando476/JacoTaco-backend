import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class ContentManager:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        self.db: Client = create_client(url, key)

    # --- READ ---
    def get_tasks(self, difficulty=None):
        query = self.db.table("tasks").select("*, task_groups(name)")
        if difficulty:
            query = query.eq("difficulty_level", difficulty)
        return query.execute()

    # --- CREATE ---
    def add_task(self, group_id, content, answer, difficulty="Easy", video_url=None):
        data = {
            "task_group_id": group_id,
            "content": content,
            "correct_answer": answer,
            "difficulty_level": difficulty, # Obsługuje Twój nowy ENUM
            "video_url": video_url
        }
        return self.db.table("tasks").insert(data).execute()

    # --- UPDATE ---
    def update_task_difficulty(self, task_id, new_difficulty):
        return self.db.table("tasks")\
            .update({"difficulty_level": new_difficulty})\
            .eq("id", task_id).execute()

    # --- DELETE ---
    def delete_task(self, task_id):
        return self.db.table("tasks").delete().eq("id", task_id).execute()
    
    def get_topics_by_chapter(self, chapter_id):
        return self.db.table("topics").select("*").eq("chapter_id", chapter_id).execute()

# Użycie:
manager = ContentManager()
# res = manager.add_task("uuid-grupy", "Ile to 2+2?", "4", "Easy")