"use client";

import { useEffect, useState } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>("CHECKING...");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/health`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "ok") {
            setBackendStatus("YES");
          } else {
            setBackendStatus("NO");
          }
        } else {
          setBackendStatus("NO");
        }
      } catch (err) {
        setBackendStatus("NO");
      }
    };
    checkBackend();
  }, []);

  const initialNodes = [
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Matematyka Podstawowa' } },
    { id: '2', position: { x: 100, y: 100 }, data: { label: 'Algebra' } },
    { id: '3', position: { x: 400, y: 100 }, data: { label: 'Geometria' } },
  ];
  
  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">EduMath Platform</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-8 w-full max-w-2xl text-center">
        <h2 className="text-xl font-semibold mb-2">System Status</h2>
        <p className="text-lg">
          Backend Connected:{" "}
          <span className={
            backendStatus === "YES" ? "text-green-600 font-bold" : 
            backendStatus === "NO" ? "text-red-600 font-bold" : "text-yellow-600 font-bold"
          }>
            {backendStatus}
          </span>
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-2">Przykładowy Wzór (KaTeX)</h2>
        <div className="text-center p-4 bg-gray-100 rounded">
           <InlineMath math="\int_{a}^{b} x^2 \,dx" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-8 w-full max-w-4xl h-96">
        <h2 className="text-xl font-semibold mb-2">Drzewko Umiejętności (React Flow)</h2>
        <div className="h-[300px] w-full border rounded">
          <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
      
      <div className="mt-4">
        <Link href="/lesson/example-id" className="text-blue-500 hover:underline">
          Przejdź do przykładowej lekcji
        </Link>
      </div>
    </main>
  );
}
