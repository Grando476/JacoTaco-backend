"use client";

import { useEffect, useState, useCallback } from "react";
import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
// import { useRouter } from "next/navigation";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - 220 / 2,
      y: nodeWithPosition.y - 50 / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export default function Home() {
  // const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarLessons, setSidebarLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/nodes`);
        if (res.ok) {
          const data = await res.json();
          if (!data.nodes || !data.edges) return;
          
          const rawNodes: Node[] = data.nodes.map((n: any) => ({
              id: n.id,
              position: { x: 0, y: 0 },
              data: { label: n.name },
              style: { 
                padding: '12px 20px', 
                borderRadius: '9999px',
                background: 'linear-gradient(to right, #0ea5e9, #10b981)',
                border: 'none', 
                color: '#ffffff', 
                width: 220, 
                cursor: 'pointer', 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
              }
          }));
          
          const rawEdges: Edge[] = data.edges.map((e: any, idx: number) => ({
              id: `e${e.source}-${e.target}-${idx}`,
              source: e.source,
              target: e.target,
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#334155', strokeWidth: 2 }
          }));
          
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            rawNodes,
            rawEdges,
            'TB'
          );

          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        }
      } catch (err) {
        console.error("Error fetching nodes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNodes();
  }, [setNodes, setEdges]);
  
  const onNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setSidebarLessons([]);
      setLoadingLessons(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/nodes/${node.id}/lessons`);
        if (res.ok) {
          const data = await res.json();
          if (data.lessons) {
            setSidebarLessons(data.lessons);
          }
        }
      } catch (err) {
        console.error("Error fetching lessons:", err);
      } finally {
        setLoadingLessons(false);
      }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#12171c', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
          {loading ? (
              <div className="flex items-center justify-center h-full w-full">
                  <p className="text-2xl font-semibold text-cyan-500 animate-pulse">Loading EduMath Graph...</p>
              </div>
          ) : (
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                panOnDrag={true}
                panOnScroll={false}
                zoomOnScroll={true}
                zoomOnPinch={true}
                zoomOnDoubleClick={true}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#334155" gap={20} />
                <Controls />
              </ReactFlow>
          )}
      </div>
      
      {selectedNode && (
        <div style={{ 
            width: '350px', 
            background: '#1a222c', 
            borderLeft: '1px solid #2d3748',
            boxShadow: '-4px 0 25px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>{selectedNode.data.label as string}</h2>
                <button 
                  onClick={() => setSelectedNode(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#94a3b8' }}
                >
                    &times;
                </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '15px' }}>Lessons</h3>
                {loadingLessons ? (
                    <p style={{ color: '#64748b' }}>Loading lessons...</p>
                ) : sidebarLessons.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {sidebarLessons.map((lesson: any) => (
                            <li key={lesson.id} style={{ 
                                padding: '15px', 
                                border: '1px solid #334155', 
                                borderRadius: '8px', 
                                marginBottom: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: '#1e293b'
                            }}
                            onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.background = '#273549'; }}
                            onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b'; }}
                            >
                                <h4 style={{ margin: '0 0 5px 0', color: '#38bdf8', fontSize: '1rem' }}>{lesson.title}</h4>
                                {lesson.importance && <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Importance: {lesson.importance} / 5</span>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.875rem' }}>No lessons available for this topic yet.</p>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
