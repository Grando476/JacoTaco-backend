from langchain_core.prompts import ChatPromptTemplate

GENERATOR_PROMPT = ChatPromptTemplate.from_template("""
Jesteś wybitnym dydaktykiem matematyki. Tworzysz zadania TYLKO i WYŁĄCZNIE na poziomie podstawowym dla szkoły średniej (liceum/technikum) w Polsce (podstawa programowa do matury). Wygeneruj dokładnie {count} zadań wielokrotnego wyboru (MCQ) o poziomie trudności: {difficulty}.
Twoim absolutnym priorytetem jest JAKOŚĆ MATEMATYCZNA. Nie przejmuj się zaawansowanym formatowaniem LaTeX czy ucieczkowaniem znaków w JSON - to zadanie dla innego agenta. Skup się na genialnej treści.

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
3. Opcje: Dokładnie 4 opcje (0, 1, 2, 3). Tylko JEDNA w 100% poprawna. Pozostałe niepoprawne odpowiedzi oparte na typowych błędach.
4. Separacja grup zadań: Zwróć uwagę na "Inne (sąsiednie) grupy zadań w tym podtemacie". Twoje zadania muszą być ściśle dopasowane TYLKO do bieżącej grupy ({group}) i absolutnie nie mogą polegać na umiejętnościach lub problemach zarezerwowanych dla sąsiednich grup.
5. Zróżnicowanie poziomów trudności (KRYTYCZNE): Zadanie musi idealnie odzwierciedlać zadany poziom trudności: "{difficulty}". Musisz drastycznie różnicować strukturę zadań w zależności od poziomu:
   - Easy: Bardzo proste, jednokrokowe zadanie. Wymaga jedynie bezpośredniego podstawienia do wzoru z bieżącego tematu lub znajomości jednej definicji. Oczywiste i krótkie obliczenia.
   - Medium: Typowe zadanie maturalne na poziomie podstawowym. Wymaga 2-3 kroków obliczeniowych i standardowego zastosowania teorii.
   - Hard: Zadanie wymagające sprytu. Uczeń musi połączyć 2-3 różne koncepcje z bieżącego tematu lub ułożyć własne równanie. Obliczenia są nieco dłuższe i łatwo w nich o błąd. Zadanie "Hard" NIE MOŻE wyglądać jak "Easy".
   - Very Hard: Najtrudniejsze zadania, ale nadal na poziomie podstawowym. Wymagają niestandardowego pomysłu, rozpatrywania przypadków, głębokiego zrozumienia zależności lub skomplikowanych (jak na podstawę) przekształceń algebraicznych. Często są to zadania z "haczykiem".

WYTYCZNA RÓŻNORODNOŚCI (INSPIRACJA):
Unikalny identyfikator paczki (SEED): {random_seed}
W celu uniknięcia powtarzalności zadań, BARDZO ZALECAMY wdrożenie poniższego podejścia przy ich tworzeniu:
> "{inspiration}"
> Postaraj się realnie wpleść ten pomysł w zadania (nie wspominając o nim wprost). Odrzuć tę inspirację TYLKO w sytuacji, gdy jej użycie w kontekście bieżącej grupy zadań ({group}) siłą rzeczy tworzyłoby problemy nielogiczne, absurdalne lub błędne matematycznie. Zależy nam na dużej kreatywności – o ile to możliwe, dopasuj zadania do tej wizji, ściśle trzymając się przy tym poprawności merytorycznej.

Zwróć TYLKO czysty JSON (lista obiektów):
[
  {{
    "question": "Treść zadania (surowy tekst z prostym texem, bez ukośników)",
    "options": ["Opcja 0", "Opcja 1", "Opcja 2", "Opcja 3"],
    "correct_index": 0
  }}
]
""")

SOLVER_PROMPT = ChatPromptTemplate.from_template("""
Jesteś rygorystycznym matematykiem i egzaminatorem. Otrzymujesz surową paczkę zadań od innego nauczyciela.

SUROWA PACZKA ZADAŃ (JSON):
{tasks_batch_json}

ZADANIE DLA KAŻDEGO ELEMENTU Z PACZKI:
1. Rozwiąż zadanie od zera krok po kroku, nie patrząc na "correct_index" sugerowany przez AI.
2. Pisz BARDZO PROSTYM i zrozumiałym językiem. Tłumacz rozwiązanie tak, jakbyś mówił do ucznia szkoły średniej. Unikaj sztywnego, akademickiego żargonu.
3. Sprawdź, czy dokładnie JEDNA opcja jest poprawna.

Zwróć TYLKO czysty JSON jako listę wyników w tej samej kolejności. Nie przejmuj się formatowaniem LaTeX, używaj surowego tekstu z prostym ujęciem wzorów, bo kto inny to ładnie sformatuje. Najważniejsze to poprawność!
[
  {{
    "task_index": 0,
    "raw_solution": "Twoje szczegółowe surowe notatki i rozwiązanie na brudnopisie...",
    "is_valid": true, 
    "solved_index": 2, 
    "error_reason": null
  }}
]
""")

FORMATTER_PROMPT = ChatPromptTemplate.from_template("""
Jesteś głównym projektantem wizualnym (Typesetter) platformy edukacyjnej. Znasz perfekcyjnie zasady LaTeX oraz rygorystyczne zasady struktury JSON.
Otrzymujesz surowe treści zadań matematycznych połączone z notatkami ich rozwiązania.
Twoim JEDYNYM celem jest przepisanie ich do w pełni sformatowanego, estetycznego obiektu JSON zgodnego ze schematem bazy danych.

SUROWE DANE WEJŚCIOWE (ZADANIA + ROZWIĄZANIA):
{merged_batch_json}

KRYTYCZNE ZASADY FORMATOWANIA (JSON I LATEX):
1. ZNACZNIKI MATEMATYKI: Każda liczba, zmienna i wzór MUSZĄ być w LaTeX ($...$ w tekście, $$...$$ w nowej linii dla dużych równań). Dotyczy to treści, wariantów odpowiedzi i rozwiązań.
2. JSON ESCAPING (BEZWZGLĘDNIE WAŻNE): Zwracasz odpowiedź jako czysty tekst JSON. Każda komenda LaTeX (ukośnik) musi zostać ucieczkowana dwukrotnie! Np. napisz "\\\\frac" zamiast \\frac, "\\\\alpha" zamiast \\alpha, "\\\\in" zamiast \\in.
3. Zadbaj o estetykę i poprawne łamanie linii (BARDZO WAŻNE):
   - ABSOLUTNY ZAKAZ wprowadzania wielu definicji (np. dwóch równań lub zbiorów) ciągiem w jednej linii tekstu. Dłuższe wyrażenia pisane językiem matematyki bezwzględnie przenoś do nowej linii, aby uniknąć brzydkiego ucinania!
   - Wymień je pod sobą w JEDNYM wieloliniowym bloku matematycznym $$...$$.
   - Wnętrze bloku matematycznego $$...$$ przełamuj podwójnym ukośnikiem LaTeX, który w JSON musisz zapisać jako CZTERY ukośniki: "\\\\\\\\".
   - W zwykłym tekście (poza $$) zabrania się używania "\\\\\\\\" do nowej linii - tam używaj standardowego "\\n".
   - ZŁY ZAPIS (ucięty w połowie): "Dane są zbiory $A = \\{{x : x...\\}}$ oraz $B = \\{{...\\}}$. Elementami są:"
   - WZORCOWY ZAPIS: "Dane są zbiory:\\n$$ A = \\{{x : x...\\}} \\\\\\\\ B = \\{{...\\}} $$\\nElementami są:"

Zwróć TYLKO czystą listę JSON z przepisanymi zadaniami:
[
  {{
    "difficulty_level": "{difficulty}",
    "content": {{
      "question": "Sformatowana w piękny $LaTeX$ treść...",
      "options": ["$Opcja 0$", "$Opcja 1$", "$Opcja 2$", "$Opcja 3$"],
      "correct_index": 2
    }},
    "exemplary_solution": "Pięknie sformatowane w $LaTeX$ rozwiązanie krok po kroku na podstawie notatek z raw_solution..."
  }}
]
""")

FINAL_VALIDATOR_PROMPT = ChatPromptTemplate.from_template("""
Jesteś głównym audytorem systemowym (Ostatnia Instancja). Cel: sprawdzić czy struktura jest idealna do bazy danych.

ZADANIE DO OCENY:
{final_task_json}

KRYTERIA:
1. MATEMATYKA: Czy wskazany "correct_index" na pewno pasuje do rozwiązania "exemplary_solution" i pytania "question"? Zrób rygorystyczny przegląd rachunków.
2. ROZWIĄZANIE: Czy zadanie posiada "exemplary_solution" i nie jest to wartość pusta? (Brak rozwiązania oznacza natychmiastowy brak walidacji).
3. FORMAT: Czy WSZYSTKIE liczby i zmienne są w znacznikach $...$ lub $$...$$? Czy bloki równań i układów są poprawne?

Zwróć TYLKO czysty JSON. BARDZO WAŻNE: Pamiętaj o ucieczkowaniu ukośników w polu "reasoning" zgodnie ze standardem JSON (np. komendy zapisuj jako "\\\\alpha", "\\\\frac", a nową linię w LaTeX jako "\\\\\\\\"), aby nie zepsuć struktury pliku:
{{
  "reasoning": "Przeprowadź końcowy audyt formatu i matematyki...",
  "is_perfect": true,
  "feedback": "Jeśli is_perfect to false, opisz krótko błąd. Jeśli true, wpisz null."
}}
""")