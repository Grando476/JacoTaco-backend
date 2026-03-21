-- Database schema for 'EduMath' on Supabase (PostgreSQL)

-- Skill Tree
CREATE TABLE IF NOT EXISTS public.nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.nodes(id) ON DELETE SET NULL, -- Self-referencing dla drzewka
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for parent_id to speed up loading the tree
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON public.nodes(parent_id);

-- Table for Lessons assigned to Nodes
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    video_url TEXT, -- link to video 
    content_markdown TEXT, -- content text and LaTeX formulas (to be rendered in react-katex package)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for node_id in lessons
CREATE INDEX IF NOT EXISTS idx_lessons_node_id ON public.lessons(node_id);

-- Optional (Future: Table for authorized users and progress - EduMath App)
-- CREATE TABLE IF NOT EXISTS public.user_progress ( ... );
