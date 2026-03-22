-- Database schema for 'EduMath' on Supabase (PostgreSQL)

-- Skill Tree Nodes
CREATE TABLE IF NOT EXISTS public.nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Edge routing for DAG (Many to Many relationship replacing parent_id)
CREATE TABLE IF NOT EXISTS public.node_edges (
    parent_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_node_edges_parent ON public.node_edges(parent_id);
CREATE INDEX IF NOT EXISTS idx_node_edges_child ON public.node_edges(child_id);

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
