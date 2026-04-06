import streamlit as st
from manager import ContentManager # Twoja klasa do obsługi bazy

# Inicjalizacja managera
manager = ContentManager()

# --- 1. INICJALIZACJA STANU (PAMIĘĆ APLIKACJI) ---
if 'nav_chapter' not in st.session_state:
    st.session_state.nav_chapter = None
if 'nav_topic' not in st.session_state:
    st.session_state.nav_topic = None
if 'nav_subtopic' not in st.session_state:
    st.session_state.nav_subtopic = None

# --- 2. FUNKCJE NAWIGACYJNE ---
def go_to_chapters():
    st.session_state.nav_chapter = None
    st.session_state.nav_topic = None
    st.session_state.nav_subtopic = None

def go_to_topics(chapter_id):
    st.session_state.nav_chapter = chapter_id
    st.session_state.nav_topic = None
    st.session_state.nav_subtopic = None

def go_to_subtopics(topic_id):
    st.session_state.nav_topic = topic_id
    st.session_state.nav_subtopic = None

def go_to_tasks(subtopic_id):
    st.session_state.nav_subtopic = subtopic_id

# --- 3. BREADCRUMBS (ŚCIEŻKA NAWIGACJI NA GÓRZE) ---
st.title("📚 Manager Bazy Zadań")
nav_cols = st.columns(4)

with nav_cols[0]:
    if st.button("🏠 Wszystkie Działy", use_container_width=True):
        go_to_chapters()
with nav_cols[1]:
    if st.session_state.nav_chapter:
        if st.button("📂 Tematy", use_container_width=True):
            go_to_topics(st.session_state.nav_chapter)
with nav_cols[2]:
    if st.session_state.nav_topic:
        if st.button("📄 Subtematy", use_container_width=True):
            go_to_subtopics(st.session_state.nav_topic)
with nav_cols[3]:
    if st.session_state.nav_subtopic:
        st.button("✏️ Zadania", disabled=True, use_container_width=True) # Jesteśmy na końcu

st.divider()

# --- 4. GŁÓWNY WIDOK ZALEŻNY OD STANU ---

# POZIOM 1: DZIAŁY (Jeśli nic nie jest wybrane)
if st.session_state.nav_chapter is None:
    st.header("Lista Działów")
    
    # Formularz dodawania działu
    with st.expander("➕ Dodaj nowy dział"):
        new_chapter = st.text_input("Nazwa działu")
        if st.button("Zapisz dział"):
            # manager.add_chapter(new_chapter)
            st.success(f"Dodano: {new_chapter}")
            st.rerun() # Odświeża widok

    # Wyświetlanie listy (Symulacja danych)
    # chapters = manager.get_chapters().data
    chapters = [{"id": "1", "name": "Potęgi i pierwiastki"}, {"id": "2", "name": "Funkcja liniowa"}]
    
    for ch in chapters:
        col1, col2 = st.columns([4, 1])
        col1.write(f"**{ch['name']}**")
        if col2.button("Wejdź 👉", key=f"btn_ch_{ch['id']}"):
            go_to_topics(ch['id'])
            st.rerun()

# POZIOM 2: TEMATY (Jeśli wybrano dział, ale nie temat)
elif st.session_state.nav_topic is None:
    st.header("Tematy w wybranym dziale")
    
    # Formularz dodawania tematu (przypięty do st.session_state.nav_chapter)
    with st.expander("➕ Dodaj nowy temat"):
        new_topic = st.text_input("Nazwa tematu")
        if st.button("Zapisz temat"):
            # manager.add_topic(st.session_state.nav_chapter, new_topic)
            st.success("Dodano temat!")
            st.rerun()

    # topics = manager.get_topics_by_chapter(st.session_state.nav_chapter).data
    topics = [{"id": "101", "name": "Potęgi o wykładniku całkowitym"}, {"id": "102", "name": "Pierwiastki"}]
    
    for top in topics:
        col1, col2 = st.columns([4, 1])
        col1.write(f"**{top['name']}**")
        if col2.button("Wejdź 👉", key=f"btn_top_{top['id']}"):
            go_to_subtopics(top['id'])
            st.rerun()

# POZIOM 3: SUBTEMATY I ZADANIA 
elif st.session_state.nav_subtopic is None:
    st.header("Subtematy")
    st.info(f"Tutaj renderujesz listę subtematów dla ID tematu: {st.session_state.nav_topic}")
    
    # Analogicznie jak wyżej...
    if st.button("Wejdź w zadania dla subtematu (Demo)"):
        go_to_tasks("uuid-jakiegos-subtematu")
        st.rerun()

# POZIOM 4: EDYCJA ZADAŃ
else:
    st.header("Zadania")
    st.write(f"Edytujesz zadania dla subtematu ID: {st.session_state.nav_subtopic}")
    
    # Tutaj wstawiasz formularz dodawania i tabelę zadań
    with st.form("add_task_form"):
        content = st.text_area("Treść zadania (LaTeX obsługiwany)")
        diff = st.selectbox("Trudność", ["Easy", "Medium", "Hard", "Very Hard"])
        ans = st.text_input("Poprawna odpowiedź")
        submit = st.form_submit_button("Zapisz zadanie")
        
        if submit:
            # manager.add_task(...)
            st.success("Zapisano!")