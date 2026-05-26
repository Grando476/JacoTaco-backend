import random
import uuid

INSPIRATIONS_LIST = [
    "Odwróć typowy schemat zadania: zamiast pytać o wynik końcowy na podstawie danych wejściowych, podaj wynik końcowy i każ uczniowi odnaleźć jedną z danych początkowych.",
    "Skonstruuj polecenie w formie testowania wariantów: 'Wskaż fałszywe zdanie' lub 'Wskaż prawdziwe zdanie'. Opcje A, B, C, D muszą być niezależnymi, małymi problemami do sprawdzenia.",
    "Zbuduj zadanie bazujące na negacji. Polecenie brzmi: 'Które z poniższych wyrażeń/zjawisk NIE spełnia warunku / NIE jest równe pozostałym?'.",
    "Opakuj suchy matematyczny problem w bardzo krótkie zadanie tekstowe. Ukryj matematykę za realistyczną sytuacją (np. prędkość, zakupy, podział przedmiotów, geometria w przestrzeni).",
    "Użyj w zadaniu parametru literowego (np. k, m, p) w miejsce jednej ze standardowych liczb i zapytaj, dla jakiej wartości tego parametru warunek jest spełniony.",
    "Skup się na zidentyfikowaniu typowego błędu ucznia w obecnym temacie (np. ignorowanie zmiany znaku, fałszywa liniowość). Zbuduj bardzo podchwytliwy dystraktor bazujący dokładnie na tym błędzie.",
    "Wpleć w treść zadania dodatkową informację matematyczną, która jest całkowicie zbędna do rozwiązania problemu (tzw. szum informacyjny). Informacja ta musi brzmieć naturalnie i ściśle wiązać się z matematycznym kontekstem (np. podanie trzeciego zbioru, który nie bierze udziału w operacji, lub dodatkowej, niepotrzebnej miary kąta). Absolutnie unikaj dodawania absurdalnych, niezwiązanych z tematem zdań tekstowych.",
    "Wymuś rozwiązanie wieloetapowe: poprawna odpowiedź musi spełniać DWA narzucone z góry warunki jednocześnie (np. być mniejsza od X oraz spełniać główną własność tematu).",
    "Wymuś ewaluację wszystkich opcji poprzez polecenie typu: 'Wskaż opcję, dla której wartość/wynik jest NAJWIĘKSZA/NAJMNIEJSZA'.",
    "Oprzyj zadanie na skrajnym przypadku lub wyjątku w danym temacie (np. zbiór pusty, ułamek niezdefiniowany, brak rozwiązań, tożsamość).",
    "Nie podawaj ostatecznych wartości liczbowych w opcjach A, B, C, D. Zamiast tego, niech warianty odpowiedzi będą całymi wyrażeniami, wzorami lub równaniami opisującymi stan końcowy.",
    "Zadanie musi odstraszać na samym starcie sztucznie zagmatwanym, wizualnie skomplikowanym zapisem, który przy sprytnym spojrzeniu skraca się / upraszcza niemal do zera.",
    "Stwórz zadanie o absolutnie minimalistycznej formie. Zero tekstu, zero słów – wyłącznie jeden elegancki, ale wysoce podchwytliwy zapis matematyczny ujęty w znakach LaTeX.",
    "Przedstaw uczniowi gotowe, wieloetapowe rozwiązanie problemu (np. ujęte w 3 krokach), w którym celowo popełniono jeden subtelny błąd logiczny lub obliczeniowy. Polecenie brzmi: 'W którym kroku popełniono błąd?'.",
    "Skup się na relacjach i zależnościach. Zapytaj, jak zmiana jednego z parametrów wejściowych (np. jego dwukrotne zwiększenie) wpłynie na wynik końcowy całego procesu.",
    "Sformułuj zadanie w oparciu o szukanie ogólnej prawidłowości. Zapytaj: 'Które z poniższych wyrażeń jest zawsze prawdziwe dla dowolnych danych?' (wymusza to udowodnienie tożsamości zamiast zwykłego liczenia).",
    "Zaprojektuj zadanie polegające na przetłumaczeniu długiego opisu słownego na ścisły język matematyki. Opcjami odpowiedzi A, B, C, D niech będą same wzory, równania lub relacje.",
    "Oprzyj problem na poszukiwaniu kontrprzykładu. Podaj fałszywą tezę i poproś ucznia o wskazanie w opcjach wariantu (danych), który tę tezę jednoznacznie obala.",
    "Główną pułapką zadania uczyń założenia i dziedzinę. Dystraktory muszą być wynikami, które wychodzą z mechanicznych obliczeń, ale należy je odrzucić z powodu naturalnych ograniczeń matematycznych.",
    "Skonstruuj dystraktory w taki sposób, aby odzwierciedlały wykonanie innej, sąsiadującej operacji logicznej (np. opcje będą wynikami dodawania tam, gdzie należało mnożyć, lub odwrócenia kolejności).",
    "Wykorzystaj regułę przechodniości relacji. Podaj zależność między zmienną $X$ i $Y$ oraz między $Y$ i $Z$, a następnie zapytaj wprost o relację między skrajnymi zmiennymi $X$ i $Z$."
]

def get_generation_params() -> dict:
    """
    Zwraca słownik z unikalnym seedem i wylosowaną jedną z 20 uniwersalnych instrukcji
    skupiających AI na różnorodności formy i pułapek matematycznych.
    """
    return {
        "inspiration": random.choice(INSPIRATIONS_LIST),
        "random_seed": str(uuid.uuid4())[:8]
    }