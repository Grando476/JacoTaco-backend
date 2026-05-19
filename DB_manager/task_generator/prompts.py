from langchain_core.prompts import ChatPromptTemplate

GENERATOR_PROMPT = ChatPromptTemplate.from_template("""
Jesteś wybitnym dydaktykiem matematyki. Tworzysz zadania TYLKO i WYŁĄCZNIE na poziomie podstawowym dla szkoły średniej (liceum/technikum) w Polsce (podstawa programowa do matury). Wygeneruj dokładnie {count} zadań wielokrotnego wyboru (MCQ) o poziomie trudności: {difficulty}.

KONTEKST ZADANIA (GŁÓWNY CEL):
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria bieżąca: {topic_theory}, {subtopic_theory}
Inne (sąsiednie) grupy zadań w tym podtemacie: {sibling_task_groups}

WIEDZA UPRZEDNIA UCZNIA (MOŻESZ Z NIEJ KORZYSTAĆ DO UTRUDNIANIA ZADAŃ):
Poprzednie tematy ucznia: {known_topics_names}
Poprzednie podtematy z tego działu: {known_subtopics_theories}

ZAKAZANY MATERIAŁ (PRZYSZŁE TEMATY - ABSOLUTNY ZAKAZ UŻYWANIA):
Nieznane tematy (nie używaj pojęć z tych działów): {unknown_topics_names}

KRYTYCZNE ZASADY PEDAGOGICZNE I OGRANICZENIA MATERIAŁU:
1. Poziom trudności i podstawa: Wszystkie zadania muszą być w 100% zgodne z podstawą programową do matury podstawowej z matematyki w Polsce. Absolutnie nie używaj zagadnień rozszerzonych ani akademickich.
2. Ograniczenie wiedzy (STRICT): Masz BEZWZGLĘDNY ZAKAZ używania operacji, funkcji, pojęć i symboli, które nie zostały wprost wymienione w "Kontekście zadania" lub w "Wiedzy uprzedniej ucznia". 
   - Zwróć szczególną uwagę na listę "Nieznane tematy". Pod żadnym pozorem nie wprowadzaj w zadaniach zagadnień, które się na niej znajdują.
   - Utrudnianie zadania (Hard/Very Hard) ma polegać na łączeniu TYLKO JUŻ ZNANYCH pojęć (np. tworzenie bardziej złożonych wyrażeń z tym co uczeń już zna, zagnieżdżanie znanych działań, wymagające dłuższego liczenia lub sprytu), a absolutnie NIE na dodawaniu materiału z przyszłości.
3. Matematyka: Każda liczba, zmienna i wzór MUSZĄ być w LaTeX ($...$ w tekście, $$...$$ w nowej linii). Dotyczy to też wariantów odpowiedzi.
4. Opcje: Dokładnie 4 opcje (0, 1, 2, 3). Tylko JEDNA w 100% poprawna. Pozostałe niepoprawne odpowiedzi oparte na typowych błędach.
5. Separacja grup zadań: Zwróć uwagę na "Inne (sąsiednie) grupy zadań w tym podtemacie". Twoje zadania muszą być ściśle dopasowane TYLKO do bieżącej grupy ({group}) i absolutnie nie mogą polegać na umiejętnościach lub problemach zarezerwowanych dla sąsiednich grup.

WYTYCZNA RÓŻNORODNOŚCI (INSPIRACJA):
Unikalny identyfikator paczki (SEED): {random_seed}
Aby uniknąć powtarzalności zadań, spróbuj wykorzystać poniższą sugestię (potraktuj ją jako inspirację, a nie bezwzględny wymóg):
> "{inspiration}"
> Jeżeli ta inspiracja pasuje do bieżącego tematu, postaraj się wpleść ją w zadania (nie pisząc o niej wprost). Jeżeli jednak wymuszałaby stworzenie sztucznego, nielogicznego lub absurdalnego problemu, masz pełne prawo JĄ ZIGNOROWAĆ i wygenerować tradycyjne, sensowne zadania. Priorytetem jest w 100% jakość i poprawność matematyczna.

Zwróć TYLKO czysty JSON (lista obiektów):
[
  {{
    "difficulty_level": "{difficulty}",
    "content": {{
      "question": "Treść z $LaTeX$...",
      "options": ["$Opcja 0$", "$Opcja 1$", "$Opcja 2$", "$Opcja 3$"],
      "correct_index": 0
    }}
  }}
]
""")

SOLVER_PROMPT = ChatPromptTemplate.from_template("""
Jesteś rygorystycznym egzaminatorem. Otrzymujesz paczkę zadań. 

PACZKA ZADAŃ (JSON):
{tasks_batch_json}

ZADANIE DLA KAŻDEGO ELEMENTU Z PACZKI:
1. Rozwiąż zadanie od zera, nie patrząc na "correct_index" sugerowany przez AI.
2. Sprawdź, czy dokładnie JEDNA opcja jest poprawna.

Zwróć TYLKO czysty JSON jako listę wyników w tej samej kolejności:
[
  {{
    "task_index": 0,
    "exemplary_solution": "Napisz tu szczegółowe, dydaktyczne rozwiązanie krok po kroku (używaj $...$ do matematyki), gotowe do wyświetlenia uczniowi. Może to być też rozwiązanie słowne, jeżeli odpowiedź nie wymaga rozwiązania równania itd",
    "is_valid": true, 
    "solved_index": 2, 
    "error_reason": null
  }}
]
""")

FINAL_VALIDATOR_PROMPT = ChatPromptTemplate.from_template("""
Jesteś głównym audytorem matematycznym. Cel: absolutna pewność merytoryczna.

ZADANIE DO OCENY:
{final_task_json}

KRYTERIA:
1. MATEMATYKA (Krytyczne): Rozwiąż zadanie. Czy wskazany "correct_index" to na 100% poprawny wynik? Czy pozostałe dystraktory są na 100% fałszywe?
2. FORMAT: Czy WSZYSTKIE liczby, zmienne i ułamki w treści oraz opcjach są wewnątrz znaczników $...$? 

Zwróć TYLKO czysty JSON:
{{
  "reasoning": "Rozwiąż zadanie krok po kroku, a następnie sprawdź znaczniki LaTeX...",
  "is_perfect": true,
  "feedback": "Jeśli is_perfect to false, opisz krótko błąd. Jeśli true, wpisz null."
}}
""")