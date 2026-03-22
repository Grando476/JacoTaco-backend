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
    dagreGraph.setNode(node.id, { width: 220, height: 80 });
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
      y: nodeWithPosition.y - 80 / 2,
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
                padding: 12, 
                borderRadius: 12, 
                background: '#ffffff', 
                border: '2px solid #3b82f6', 
                color: '#1e3a8a', 
                width: 220, 
                cursor: 'pointer', 
                textAlign: 'center', 
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }
          }));
          
          const rawEdges: Edge[] = data.edges.map((e: any, idx: number) => ({
              id: `e${e.source}-${e.target}-${idx}`,
              source: e.source,
              target: e.target,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#60a5fa', strokeWidth: 3 }
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
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      alert(`Clicked module: ${node.data.label}\n\nIn the future, we will redirect you to the lesson screen here.`);
      // router.push(`/lesson/${node.id}`);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f8fafc' }}>
      {loading ? (
          <div className="flex items-center justify-center h-full w-full">
              <p className="text-2xl font-semibold text-blue-600 animate-pulse">Loading EduMath Graph...</p>
          </div>
      ) : (
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={20} />
            <Controls />
          </ReactFlow>
      )}
    </div>
  );
}
