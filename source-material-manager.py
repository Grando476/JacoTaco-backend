import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Wczytanie zmiennych z pliku .env
load_dotenv()

# Pobranie wartości ze środowiska
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

# Inicjalizacja klienta
supabase: Client = create_client(url, key)

nazwa_tabeli = "topics"

# Pobranie i wyświetlenie danych
try:
    response = supabase.table(nazwa_tabeli).select("*").execute()
    if response.data:
        for wiersz in response.data:
            print(wiersz)
    else:
        print("Tabela jest pusta.")
except Exception as e:
    print(f"Wystąpił błąd: {e}")