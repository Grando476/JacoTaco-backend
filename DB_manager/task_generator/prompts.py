from langchain_core.prompts import ChatPromptTemplate

GENERATOR_PROMPT = ChatPromptTemplate.from_template("""
Jesteś wybitnym dydaktykiem matematyki. Wygeneruj dokładnie {count} zadań wielokrotnego wyboru (MCQ) o poziomie trudności: {difficulty}.

KONTEKST:
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria: {topic_theory}, {subtopic_theory}

ZASADY:
1. Matematyka: Każda liczba, zmienna i wzór MUSZĄ być w LaTeX ($...$ w tekście, $$...$$ w nowej linii). Dotyczy to też wariantów odpowiedzi.
2. Opcje: Dokładnie 4 opcje (0, 1, 2, 3). Tylko JEDNA w 100% poprawna. pozostałe niepoprawne odpowiedzi oparte na typowych błędach.

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