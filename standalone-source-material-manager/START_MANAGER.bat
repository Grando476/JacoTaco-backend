@echo off
if not exist venv (
    echo Tworzenie srodowiska...
    python -m venv venv
)
call venv\Scripts\activate
pip install supabase python-dotenv streamlit --quiet
streamlit run app.py
pause