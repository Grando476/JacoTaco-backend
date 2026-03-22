-- Insert Nodes
WITH inserted_nodes AS (
    INSERT INTO public.nodes (name, description) VALUES 
    ('Level 1: Basics', 'Introduction to the subject and basic concepts'),
    ('Level 2: Algebra', 'Expansion of knowledge and algebra methods'),
    ('Level 2: Geometry', 'Shapes, formulas, and visual logic'),
    ('Level 3: Expert', 'Difficult topics combining everything')
    RETURNING id, name
),
n1 AS (SELECT id FROM inserted_nodes WHERE name = 'Level 1: Basics'),
n2_alg AS (SELECT id FROM inserted_nodes WHERE name = 'Level 2: Algebra'),
n2_geo AS (SELECT id FROM inserted_nodes WHERE name = 'Level 2: Geometry'),
n3 AS (SELECT id FROM inserted_nodes WHERE name = 'Level 3: Expert'),

-- Insert Edges
edges_ins AS (
    INSERT INTO public.node_edges (parent_id, child_id)
    -- Level 1 splits into two branches
    SELECT n1.id, n2_alg.id FROM n1, n2_alg UNION ALL
    SELECT n1.id, n2_geo.id FROM n1, n2_geo UNION ALL
    -- Both branches merge into Level 3 (DAG feature showcasing multiple parents)
    SELECT n2_alg.id, n3.id FROM n2_alg, n3 UNION ALL
    SELECT n2_geo.id, n3.id FROM n2_geo, n3
)

-- Insert Lessons
INSERT INTO public.lessons (node_id, title, video_url, content_markdown)
-- Basics
SELECT id, 'Lesson 1.1: Intro', 'https://example.com/vid1', '# Topic 1.1\nStarting.' FROM n1 UNION ALL
SELECT id, 'Lesson 1.2: Numbers', 'https://example.com/vid2', '# Topic 1.2\nNumber types.' FROM n1 UNION ALL
-- Algebra
SELECT id, 'Lesson 2A.1: Variables', 'https://example.com/vid3', '# Topic 2A.1\nVariables.' FROM n2_alg UNION ALL
SELECT id, 'Lesson 2A.2: Equations', 'https://example.com/vid4', '# Topic 2A.2\n$x = 2$.' FROM n2_alg UNION ALL
-- Geometry
SELECT id, 'Lesson 2G.1: Shapes', 'https://example.com/vid5', '# Topic 2G.1\nTriangles.' FROM n2_geo UNION ALL
SELECT id, 'Lesson 2G.2: Angles', 'https://example.com/vid6', '# Topic 2G.2\nAngles.' FROM n2_geo UNION ALL
-- Expert (Has multiple paths leading to it)
SELECT id, 'Lesson 3.1: Synthesis', 'https://example.com/vid7', '# Topic 3.1\nCombining.' FROM n3 UNION ALL
SELECT id, 'Lesson 3.2: Final Exam', 'https://example.com/vid8', '# Topic 3.2\nExam.' FROM n3;
