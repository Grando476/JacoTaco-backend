-- 1. Dodanie Działu i Tematów
WITH ins_chapter AS (
    INSERT INTO public.chapters (name) VALUES ('Potęgi i pierwiastki') RETURNING id
),
ins_topics AS (
    INSERT INTO public.topics (chapter_id, name, video_url)
    SELECT id, 'Potęgi o wykładniku całkowitym', 'https://example.com/wideo/potegi-calkowite' FROM ins_chapter UNION ALL
    SELECT id, 'Pierwiastki', 'https://example.com/wideo/pierwiastki' FROM ins_chapter UNION ALL
    SELECT id, 'Potęgi o wykładniku nie-całkowitym', 'https://example.com/wideo/potegi-niecalkowite' FROM ins_chapter
    RETURNING id, name
),

-- 2. Routing grafu (Linearne połączenie)
ins_edges AS (
    INSERT INTO public.topic_edges (parent_id, child_id)
    SELECT t1.id, t2.id FROM ins_topics t1, ins_topics t2 WHERE t1.name = 'Potęgi o wykładniku całkowitym' AND t2.name = 'Pierwiastki'
    UNION ALL
    SELECT t2.id, t3.id FROM ins_topics t2, ins_topics t3 WHERE t2.name = 'Pierwiastki' AND t3.name = 'Potęgi o wykładniku nie-całkowitym'
),

-- 3. Dodanie wszystkich Subtematów
ins_subtopics AS (
    INSERT INTO public.subtopics (topic_id, name, importance)
    -- Potęgi całkowite
    SELECT t.id, 'Definicja potęgi o wykładniku naturalnym', 5 FROM ins_topics t WHERE t.name = 'Potęgi o wykładniku całkowitym' UNION ALL
    SELECT t.id, 'Wzory na Potęgach, mnożenie, dzielenie, potęgowanie, wykładnik ujemny', 5 FROM ins_topics t WHERE t.name = 'Potęgi o wykładniku całkowitym' UNION ALL
    SELECT t.id, 'Notacja wykładnicza', 2 FROM ins_topics t WHERE t.name = 'Potęgi o wykładniku całkowitym' UNION ALL
    SELECT t.id, 'Lokaty', 3 FROM ins_topics t WHERE t.name = 'Potęgi o wykładniku całkowitym' UNION ALL
    
    -- Pierwiastki
    SELECT t.id, 'Pierwiastki stopnia parzystego', 5 FROM ins_topics t WHERE t.name = 'Pierwiastki' UNION ALL
    SELECT t.id, 'Pierwiastki stopnia nieparzystego', 5 FROM ins_topics t WHERE t.name = 'Pierwiastki' UNION ALL
    SELECT t.id, 'Wzory na pierwiastkach, mnożenie, dzielenie, potęgowanie', 5 FROM ins_topics t WHERE t.name = 'Pierwiastki' UNION ALL
    SELECT t.id, 'Wyciąganie niewymierności', 3 FROM ins_topics t WHERE t.name = 'Pierwiastki' UNION ALL
    
    -- Potęgi niecałkowite
    SELECT t.id, 'Zamiana Pierwiastków na potęgi', 3 FROM ins_topics t WHERE t.name = 'Potęgi o wykładniku nie-całkowitym' UNION ALL
    SELECT t.id, 'Potęgi o wykładniku wymiernym', 3 FROM ins_topics t WHERE t.name = 'Potęgi o wykładniku nie-całkowitym' UNION ALL
    SELECT t.id, 'Potęgi o wykładniku rzeczywistym', 3 FROM ins_topics t WHERE t.name = 'Potęgi o wykładniku nie-całkowitym'
    RETURNING id, name
),

-- 4. Grupy zadań (Wszystkie kategorie z JSONa)
ins_task_groups AS (
    INSERT INTO public.task_groups (subtopic_id, name)
    -- Definicja potęgi
    SELECT s.id, 'Liczenie potęg o podstawie całkowitej i zerowej' FROM ins_subtopics s WHERE s.name = 'Definicja potęgi o wykładniku naturalnym' UNION ALL
    SELECT s.id, 'Liczenie potęg o podstawie wymiernej' FROM ins_subtopics s WHERE s.name = 'Definicja potęgi o wykładniku naturalnym' UNION ALL
    SELECT s.id, 'Liczenie potęg o podstawie ujemnej i wymiernej' FROM ins_subtopics s WHERE s.name = 'Definicja potęgi o wykładniku naturalnym' UNION ALL
    -- Wzory na potęgach
    SELECT s.id, 'Mnożenie/Dzielenie potęg o tych samych podstawach' FROM ins_subtopics s WHERE s.name = 'Wzory na Potęgach, mnożenie, dzielenie, potęgowanie, wykładnik ujemny' UNION ALL
    SELECT s.id, 'Wychodzenie z nawiasu do potęgi w którym był iloczyn/iloraz' FROM ins_subtopics s WHERE s.name = 'Wzory na Potęgach, mnożenie, dzielenie, potęgowanie, wykładnik ujemny' UNION ALL
    SELECT s.id, 'Obliczanie Potęgi podniesionej do potęgi' FROM ins_subtopics s WHERE s.name = 'Wzory na Potęgach, mnożenie, dzielenie, potęgowanie, wykładnik ujemny' UNION ALL
    SELECT s.id, 'Sprowadzanie liczb do wspólnej podstawy potęgi' FROM ins_subtopics s WHERE s.name = 'Wzory na Potęgach, mnożenie, dzielenie, potęgowanie, wykładnik ujemny' UNION ALL
    SELECT s.id, 'obliczanie potęg z liczb ujemnych i obliczanie ujemnych potęg' FROM ins_subtopics s WHERE s.name = 'Wzory na Potęgach, mnożenie, dzielenie, potęgowanie, wykładnik ujemny' UNION ALL
    SELECT s.id, 'Zadania złożone z powyższych elementów' FROM ins_subtopics s WHERE s.name = 'Wzory na Potęgach, mnożenie, dzielenie, potęgowanie, wykładnik ujemny' UNION ALL
    -- Notacja wykładnicza
    SELECT s.id, 'Przekształcanie do notacji wykładniczej' FROM ins_subtopics s WHERE s.name = 'Notacja wykładnicza' UNION ALL
    SELECT s.id, 'Przekształcanie z notacji wykładniczej' FROM ins_subtopics s WHERE s.name = 'Notacja wykładnicza' UNION ALL
    SELECT s.id, 'Dodawanie, Odejmowanie notacji wykładniczej' FROM ins_subtopics s WHERE s.name = 'Notacja wykładnicza' UNION ALL
    SELECT s.id, 'Mnożenie, dzielenie notacji wykładniczej' FROM ins_subtopics s WHERE s.name = 'Notacja wykładnicza' UNION ALL
    SELECT s.id, 'Potęgowanie notacji wykładniczej' FROM ins_subtopics s WHERE s.name = 'Notacja wykładnicza' UNION ALL
    -- Lokaty
    SELECT s.id, 'Obliczanie odsetek' FROM ins_subtopics s WHERE s.name = 'Lokaty' UNION ALL
    SELECT s.id, 'Obliczanie kapitału po x latach przy y oprocentowaniu' FROM ins_subtopics s WHERE s.name = 'Lokaty' UNION ALL
    SELECT s.id, 'Obliczanie jakie oprocentowanie jest korzystniejszy' FROM ins_subtopics s WHERE s.name = 'Lokaty'
    RETURNING id, name
)

-- 5. Wstawianie konkretnych zadań
INSERT INTO public.tasks (task_group_id, content, correct_answer, video_url)
-- Definicja potęgi
SELECT id, 'Oblicz: $$ 2^5 $$', '32', 'https://example.com/zad/1' FROM ins_task_groups WHERE name = 'Liczenie potęg o podstawie całkowitej i zerowej' UNION ALL
SELECT id, 'Oblicz: $$ (-3)^4 $$', '81', 'https://example.com/zad/2' FROM ins_task_groups WHERE name = 'Liczenie potęg o podstawie całkowitej i zerowej' UNION ALL
SELECT id, 'Oblicz: $$ \left(\frac{2}{3}\right)^3 $$', '\frac{8}{27}', 'https://example.com/zad/6' FROM ins_task_groups WHERE name = 'Liczenie potęg o podstawie wymiernej' UNION ALL

-- Wzory na potęgach (Przykłady)
SELECT id, 'Oblicz: $$ 3^2 \cdot 3^4 $$', '3^6', 'https://example.com/zad/m1' FROM ins_task_groups WHERE name = 'Mnożenie/Dzielenie potęg o tych samych podstawach' UNION ALL
SELECT id, 'Oblicz: $$ (10^2)^3 $$', '1000000', 'https://example.com/zad/p5' FROM ins_task_groups WHERE name = 'Obliczanie Potęgi podniesionej do potęgi' UNION ALL
SELECT id, 'Oblicz: $$ 5^{-1} $$', '\frac{1}{5}', 'https://example.com/zad/u1' FROM ins_task_groups WHERE name = 'obliczanie potęg z liczb ujemnych i obliczanie ujemnych potęg' UNION ALL

-- Notacja wykładnicza (Przykłady)
SELECT id, 'Zapisz w notacji: $$ 50000 $$', '5 \cdot 10^4', 'https://example.com/zad/nw1' FROM ins_task_groups WHERE name = 'Przekształcanie do notacji wykładniczej' UNION ALL
SELECT id, 'Oblicz: $$ (2 \cdot 10^3) \cdot (4 \cdot 10^2) $$', '8 \cdot 10^5', 'https://example.com/zad/md1' FROM ins_task_groups WHERE name = 'Mnożenie, dzielenie notacji wykładniczej' UNION ALL

-- Lokaty (Przykłady)
SELECT id, 'Oblicz odsetki od $$ 1000 \text{ zł} $$ przy $$ 5\% $$ rocznie.', '50 \text{ zł}', 'https://example.com/zad/lo1' FROM ins_task_groups WHERE name = 'Obliczanie odsetek' UNION ALL
SELECT id, 'Kapitał po $$ 2 $$ latach z $$ 1000 \text{ zł} $$ przy $$ 10\% $$ złożonym.', '1210 \text{ zł}', 'https://example.com/zad/cap1' FROM ins_task_groups WHERE name = 'Obliczanie kapitału po x latach przy y oprocentowaniu';