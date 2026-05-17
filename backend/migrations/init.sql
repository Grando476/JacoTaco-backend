CREATE TYPE task_difficulty AS ENUM ('Easy', 'Medium', 'Hard', 'Very Hard');

-- 1. Działy
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tematy (Węzły drzewa)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    ui_x INTEGER DEFAULT 0 NOT NULL,
    ui_y INTEGER DEFAULT 0 NOT NULL,
    content_tex TEXT DEFAULT '', -- NOWE POLA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Routing grafu dla tematów (DAG)
CREATE TABLE IF NOT EXISTS public.topic_edges (
    parent_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_edges_parent ON public.topic_edges(parent_id);
CREATE INDEX IF NOT EXISTS idx_topic_edges_child ON public.topic_edges(child_id);

-- 3. Subtematy
CREATE TABLE IF NOT EXISTS public.subtopics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    importance SMALLINT CHECK (importance >= 1 AND importance <= 5) NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    video_url TEXT,
    content_tex TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Grupy Zadań
CREATE TABLE IF NOT EXISTS public.task_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subtopic_id UUID NOT NULL REFERENCES public.subtopics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Zadania
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_group_id UUID NOT NULL REFERENCES public.task_groups(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL,
    difficulty_level task_difficulty DEFAULT 'Easy' NOT NULL,
    exemplary_solution TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indeksy przyspieszające
CREATE INDEX IF NOT EXISTS idx_topics_chapter ON public.topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic ON public.subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_task_groups_subtopic ON public.task_groups(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group ON public.tasks(task_group_id);

-- TWORZENIE FUNKCJI SYSTEMOWYCH I POMOCNICZYCH
CREATE OR REPLACE FUNCTION get_public_tables()
RETURNS TABLE(table_name text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT table_name::text 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
$$;

-- NOWA FUNKCJA DO POBIERANIA SCHEMATU Z BAZY
CREATE OR REPLACE FUNCTION get_schema_info(tables text[])
RETURNS json LANGUAGE plpgsql AS $$
DECLARE res json;
BEGIN
  SELECT json_agg(json_build_object('table', table_name, 'column', column_name, 'type', data_type))
  INTO res FROM information_schema.columns WHERE table_name = ANY(tables);
  RETURN res;
END; $$;

-- FUNKCJA POBIERAJĄCA POPRZEDNIĄ WIEDZĘ (Z GRAFU I POPRZEDNICH PODTEMATÓW)
CREATE OR REPLACE FUNCTION get_prior_knowledge(p_subtopic_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_topic_id UUID;
    v_sort_order INTEGER;
    v_known_topics JSON;
    v_known_subtopics JSON;
BEGIN
    -- Pobierz topic_id i sort_order dla podanego podtematu
    SELECT topic_id, sort_order INTO v_topic_id, v_sort_order
    FROM public.subtopics
    WHERE id = p_subtopic_id;

    -- Pobierz nazwy poprzednich tematów korzystając z grafu (DAG)
    WITH RECURSIVE ancestors AS (
        SELECT parent_id
        FROM public.topic_edges
        WHERE child_id = v_topic_id
        UNION
        SELECT e.parent_id
        FROM public.topic_edges e
        INNER JOIN ancestors a ON a.parent_id = e.child_id
    )
    SELECT COALESCE(json_agg(t.name), '[]'::json) INTO v_known_topics
    FROM public.topics t
    JOIN ancestors a ON t.id = a.parent_id;

    -- Pobierz wcześniejsze podtematy w ramach tego samego tematu
    SELECT COALESCE(json_agg(
        json_build_object(
            'name', name,
            'content_tex', content_tex
        )
    ), '[]'::json) INTO v_known_subtopics
    FROM public.subtopics
    WHERE topic_id = v_topic_id AND sort_order < v_sort_order;

    -- Zwróć wynik jako JSON
    RETURN json_build_object(
        'known_topics_names', v_known_topics,
        'known_subtopics', v_known_subtopics
    );
END;
$$;