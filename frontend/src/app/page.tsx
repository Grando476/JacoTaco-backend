"use client";

import { useEffect, useState, useCallback } from "react";
import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, Position, Handle, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";
// import { useRouter } from "next/navigation";

const elk = new ELK();

const getLayoutedElements = async (nodes: Node[], edges: Edge[], direction = 'UP') => {
  const graph = {
    id: "root",
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.spacing.nodeNode': '100',
    },
    children: nodes.map((node) => ({
      ...node,
      width: 140,
      height: 140,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);
  
  if (!layoutedGraph.children) {
      return { nodes, edges };
  }

  const layoutedNodes = nodes.map((node) => {
    const layoutNode = layoutedGraph.children!.find((n) => n.id === node.id);
    return {
      ...node,
      targetPosition: Position.Bottom,
      sourcePosition: Position.Top,
      position: {
        x: layoutNode?.x || 0,
        y: layoutNode?.y || 0,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const CyberNode = ({ data, selected }: any) => {
  const color = selected ? '#fcee0a' : '#0ea5e9';
  const dropShadow = selected ? `drop-shadow(0 0 10px ${color})` : 'none';
  
  return (
    <div style={{ position: 'relative', width: 140, height: 140, filter: dropShadow, transition: 'all 0.2s', cursor: 'pointer' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0 }}>
         {/* Outer glowing octagon */}
         <polygon points="40,5 100,5 135,40 135,100 100,135 40,135 5,100 5,40" 
            fill="#0a0a0c" stroke={color} strokeWidth="3" opacity="0.9" />
         {/* Inner decoration octagon */}
         <polygon points="45,15 95,15 125,45 125,95 95,125 45,125 15,95 15,45" 
            fill="rgba(255, 255, 255, 0.03)" stroke={color} strokeWidth="1" opacity="0.5" />
      </svg>
      
      <Handle type="target" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
      
      <div style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
          color: color, textAlign: 'center', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', width: '70%', height: '70%',
          pointerEvents: 'none'
      }}>
         <span style={{ fontSize: '0.8rem', fontWeight: 'bold', lineHeight: '1.2', textShadow: `0 0 4px ${color}`, wordBreak: 'break-word' }}>
             {data.label}
         </span>
         <span style={{ 
             fontSize: '0.7rem', background: color, color: '#0a0a0c', 
             padding: '2px 8px', marginTop: '8px', borderRadius: '2px', fontWeight: 'bold'
         }}>
            {data.subtasksCount ? `${data.subtasksCount}/${data.subtasksCount}` : '0/0'}
         </span>
      </div>
      
      <Handle type="source" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

const nodeTypes = {
  cyber: CyberNode,
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
              type: 'cyber',
              position: { x: 0, y: 0 },
              data: { label: n.name, subtasksCount: n.subtasks_count },
          }));
          
          const rawEdges: Edge[] = data.edges.map((e: any, idx: number) => ({
              id: `e${e.source}-${e.target}-${idx}`,
              source: e.source,
              target: e.target,
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: '#0ea5e9',
                strokeWidth: 3,
                filter: 'drop-shadow(0 0 5px rgba(14, 165, 233, 0.6))'
              }
          }));
          
          const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
            rawNodes,
            rawEdges,
            'UP'
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
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0c', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
          {loading ? (
              <div className="flex items-center justify-center h-full w-full">
                  <p className="text-2xl font-semibold text-[#fcee0a] animate-pulse">Initializing Cyber-Tree...</p>
              </div>
          ) : (
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
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
                <Background color="#1f1f22" gap={25} size={2} variant={BackgroundVariant.Dots} />
                <Controls style={{ filter: 'invert(80%) sepia(90%) saturate(400%) hue-rotate(360deg)' }} />
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
