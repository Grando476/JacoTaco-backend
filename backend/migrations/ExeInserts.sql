-- Dodanie Działu i Tematów z linkami URL
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

-- Routing ułożony linearnie (Potęgi Całkowite -> Pierwiastki -> Potęgi Nie-całkowite)
ins_edges AS (
    INSERT INTO public.topic_edges (parent_id, child_id)
    SELECT t1.id, t2.id FROM ins_topics t1, ins_topics t2 WHERE t1.name = 'Potęgi o wykładniku całkowitym' AND t2.name = 'Pierwiastki'
    UNION ALL
    SELECT t2.id, t3.id FROM ins_topics t2, ins_topics t3 WHERE t2.name = 'Pierwiastki' AND t3.name = 'Potęgi o wykładniku nie-całkowitym'
),

-- Dodanie wszystkich Subtematów
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

-- Grupy zadań dla wypełnionego subtematu
ins_task_groups AS (
    INSERT INTO public.task_groups (subtopic_id, name)
    SELECT s.id, 'Liczenie potęg o podstawie całkowitej i zerowej' FROM ins_subtopics s WHERE s.name = 'Definicja potęgi o wykładniku naturalnym' UNION ALL
    SELECT s.id, 'Liczenie potęg o podstawie wymiernej' FROM ins_subtopics s WHERE s.name = 'Definicja potęgi o wykładniku naturalnym' UNION ALL
    SELECT s.id, 'Liczenie potęg o podstawie ujemnej i wymiernej' FROM ins_subtopics s WHERE s.name = 'Definicja potęgi o wykładniku naturalnym'
    RETURNING id, name
)

-- Zadania wraz z przykładowymi linkami wideo do poszczególnych zadań
INSERT INTO public.tasks (task_group_id, content, correct_answer, video_url)
SELECT tg.id, 'Oblicz: $$ 2^5 $$', '32', 'https://example.com/zadanie/vid1' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie całkowitej i zerowej' UNION ALL
SELECT tg.id, 'Oblicz: $$ (-3)^4 $$', '81', 'https://example.com/zadanie/vid2' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie całkowitej i zerowej' UNION ALL
SELECT tg.id, 'Oblicz: $$ 7^0 $$', '1', 'https://example.com/zadanie/vid3' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie całkowitej i zerowej' UNION ALL
SELECT tg.id, 'Oblicz: $$ 0^6 $$', '0', 'https://example.com/zadanie/vid4' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie całkowitej i zerowej' UNION ALL
SELECT tg.id, 'Oblicz: $$ (-5)^3 $$', '-125', 'https://example.com/zadanie/vid5' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie całkowitej i zerowej' UNION ALL

SELECT tg.id, 'Oblicz: $$ \left(\frac{2}{3}\right)^3 $$', '\frac{8}{27}', 'https://example.com/zadanie/vid6' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie wymiernej' UNION ALL
SELECT tg.id, 'Oblicz: $$ 0.2^2 $$', '0.04', 'https://example.com/zadanie/vid7' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie wymiernej' UNION ALL
SELECT tg.id, 'Oblicz: $$ \left(1\frac{1}{2}\right)^2 $$', '\frac{9}{4}', 'https://example.com/zadanie/vid8' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie wymiernej' UNION ALL
SELECT tg.id, 'Oblicz: $$ \left(\frac{1}{10}\right)^5 $$', '0.00001', 'https://example.com/zadanie/vid9' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie wymiernej' UNION ALL

SELECT tg.id, 'Oblicz: $$ \left(-\frac{1}{2}\right)^4 $$', '\frac{1}{16}', 'https://example.com/zadanie/vid10' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie ujemnej i wymiernej' UNION ALL
SELECT tg.id, 'Oblicz: $$ (-0.5)^3 $$', '-0.125', 'https://example.com/zadanie/vid11' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie ujemnej i wymiernej' UNION ALL
SELECT tg.id, 'Oblicz: $$ \left(-1\frac{1}{3}\right)^3 $$', '-\frac{64}{27}', 'https://example.com/zadanie/vid12' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie ujemnej i wymiernej' UNION ALL
SELECT tg.id, 'Oblicz: $$ \left(-\frac{3}{4}\right)^2 $$', '\frac{9}{16}', 'https://example.com/zadanie/vid13' FROM ins_task_groups tg WHERE tg.name = 'Liczenie potęg o podstawie ujemnej i wymiernej';