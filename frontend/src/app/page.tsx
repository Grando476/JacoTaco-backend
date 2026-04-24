"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, Position, Handle, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const CyberNode = ({ data, selected }: any) => {
  const color = selected ? '#facc15' : '#4cd39b'; // Yellow when selected, mint green when unselected
  const dropShadow = selected ? `drop-shadow(0 0 10px ${color})` : 'none';
  
  return (
    <div style={{ position: 'relative', width: 140, height: 140, filter: dropShadow, transition: 'all 0.2s', cursor: 'pointer' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0 }}>
         {/* Outer glowing octagon */}
         <polygon points="40,5 100,5 135,40 135,100 100,135 40,135 5,100 5,40" 
            fill="#1e293b" stroke={color} strokeWidth="3" opacity="0.9" />
         {/* Inner decoration octagon */}
         <polygon points="45,15 95,15 125,45 125,95 95,125 45,125 15,95 15,45" 
            fill="rgba(255, 255, 255, 0.03)" stroke={color} strokeWidth="1" opacity="0.5" />
      </svg>
      
      <Handle type="target" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
      
      <div style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
          color: '#f8fafc', textAlign: 'center', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', width: '70%', height: '70%',
          pointerEvents: 'none'
      }}>
         <span style={{ fontSize: '0.8rem', fontWeight: 'bold', lineHeight: '1.2', textShadow: `0 0 4px rgba(0,0,0,0.5)`, wordBreak: 'break-word' }}>
             {data.label}
         </span>
         <span style={{ 
             fontSize: '0.7rem', background: color, color: '#0f172a', 
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
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [savingLayout, setSavingLayout] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarLessons, setSidebarLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rfInstance, setRfInstance] = useState<any>(null);

  const filteredNodes = searchQuery
    ? nodes.filter(n => (n.data.label as string).toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const onSearchSelect = (node: Node) => {
    if (rfInstance) {
      rfInstance.setCenter(node.position.x + 70, node.position.y + 70, { zoom: 1.2, duration: 800 });
    }
    onNodeClick({} as React.MouseEvent, node);
    setSearchQuery("");
  };

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
              targetPosition: Position.Bottom,
              sourcePosition: Position.Top,
              position: { x: n.ui_x || 0, y: n.ui_y || 0 },
              data: { label: n.name, subtasksCount: n.subtasks_count },
          }));
          
          const rawEdges: Edge[] = data.edges.map((e: any, idx: number) => ({
              id: `e${e.source}-${e.target}-${idx}`,
              source: e.source,
              target: e.target,
              type: 'default',
              animated: false,
              style: { 
                stroke: '#047857', // Rich emerald/forest green for natural connections
                strokeWidth: 2,
                filter: 'drop-shadow(0 0 2px rgba(4, 120, 87, 0.4))'
              }
          }));

          setNodes(rawNodes);
          setEdges(rawEdges);
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

  const saveLayout = async () => {
    setSavingLayout(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const positions = nodes.map((n) => ({
        id: n.id,
        x: Math.round(n.position.x),
        y: Math.round(n.position.y),
      }));
      
      const res = await fetch(`${apiUrl}/api/v1/nodes/positions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions }),
      });
      if (!res.ok) {
        let msg = `HTTP Error ${res.status}: ${res.statusText}`;
        try {
          const errData = await res.json();
          msg += ` - ${errData.detail || errData.error || JSON.stringify(errData)}`;
        } catch {
          msg += ` - ${await res.text()}`;
        }
        throw new Error(msg);
      }
      
      const data = await res.json();
      if (data.error) {
         throw new Error(`Database Error: ${data.error}`);
      }
      
      alert("Layout saved successfully!");
    } catch (err: any) {
      console.error("Error saving layout:", err);
      alert(`Failed to save layout.\n\nDetails: ${err.message}`);
    } finally {
      setSavingLayout(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#171a1f', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
          {loading ? (
              <div className="flex items-center justify-center h-full w-full">
                  <p className="text-2xl font-semibold text-[#fcee0a] animate-pulse">Initializing Cyber-Tree...</p>
              </div>
          ) : (
              <>
              <div style={{
                  position: 'absolute', top: 20, left: 20, zIndex: 100,
                  display: 'flex', flexDirection: 'column', gap: '5px'
              }}>
                  <input 
                      type="text" 
                      placeholder="Szukaj tematu..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                          padding: '10px 15px', width: '300px',
                          background: '#1a222c', color: '#f8fafc',
                          border: '1px solid #2d3748', borderRadius: '5px',
                          outline: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                      }}
                  />
                  {searchQuery && (
                      <div style={{
                          background: '#1a222c', border: '1px solid #2d3748',
                          borderRadius: '5px', maxHeight: '300px', overflowY: 'auto',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                      }}>
                          {filteredNodes.length > 0 ? filteredNodes.map(node => (
                              <div 
                                  key={node.id} 
                                  onClick={() => onSearchSelect(node)}
                                  style={{
                                      padding: '10px 15px', color: '#cbd5e1',
                                      cursor: 'pointer', borderBottom: '1px solid #2d3748',
                                      transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={(e: any) => e.currentTarget.style.background = '#273549'}
                                  onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                              >
                                  {node.data.label as string}
                              </div>
                          )) : (
                              <div style={{ padding: '10px 15px', color: '#64748b', fontStyle: 'italic' }}>
                                  Brak wyników
                              </div>
                          )}
                      </div>
                  )}
              </div>
              <button 
                  onClick={saveLayout}
                  disabled={savingLayout}
                  style={{
                      position: 'absolute', top: 20, right: 20, zIndex: 100,
                      padding: '10px 20px', background: savingLayout ? '#64748b' : '#0ea5e9',
                      color: 'white', border: 'none', borderRadius: '5px',
                      fontWeight: 'bold', cursor: savingLayout ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)', transition: 'background 0.2s'
                  }}
              >
                  {savingLayout ? 'Saving...' : 'Save Layout'}
              </button>
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                panOnDrag={true}
                panOnScroll={false}
                zoomOnScroll={true}
                zoomOnPinch={true}
                zoomOnDoubleClick={true}
                minZoom={0.01}
                fitView
                onInit={setRfInstance}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#334155" gap={25} size={2} variant={BackgroundVariant.Dots} />
                <Controls style={{ filter: 'invert(80%) sepia(90%) saturate(400%) hue-rotate(360deg)' }} />
              </ReactFlow>
              </>
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
                            onClick={() => router.push(`/lesson/${lesson.id}`)}
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
