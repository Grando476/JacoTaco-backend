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

-- 3. Subtematy (ZMODYFIKOWANE)
CREATE TABLE IF NOT EXISTS public.subtopics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    importance SMALLINT CHECK (importance >= 1 AND importance <= 5) NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    video_url TEXT,
    content_tex TEXT DEFAULT '', -- NOWE POLA
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
    content TEXT NOT NULL,
    difficulty_level task_difficulty DEFAULT 'Easy' NOT NULL,
    correct_answer TEXT, 
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