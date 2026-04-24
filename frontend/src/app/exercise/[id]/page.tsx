"use client";

import Link from "next/link";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// A helper component to parse strings like "Oblicz wartość wyrażenia $\\sqrt[4]{81}$."
const MixedMathText = ({ text }: { text: string }) => {
  if (!text || typeof text !== 'string') return null;
  
  if (!text.includes('$')) {
    return <span>{text}</span>;
  }

  // Normalize $$ to $ so we can easily split and render everything as InlineMath
  const normalizedText = text.replace(/\$\$/g, '$');
  const parts = normalizedText.split('$');
  
  return (
    <span>
      {parts.map((part, index) => {
        if (part === '') return null;
        if (index % 2 === 1) { // Odd indices are the math content
          return <InlineMath key={index} math={part} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default function ExercisePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [taskGroup, setTaskGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/exercises/${params.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setTaskGroup(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <p className="text-xl">Ładowanie zadań...</p>
      </div>
    );
  }

  if (error || !taskGroup) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col justify-center items-center">
        <p className="text-xl text-red-500 mb-4">Błąd: {error || "Nie znaleziono zadań"}</p>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline">
          &larr; Wróć
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md text-black">
        <button onClick={() => router.back()} className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Wróć do Lekcji
        </button>
        <h1 className="text-3xl font-bold mb-6">{taskGroup.task_group_name}</h1>

        {taskGroup.tasks && taskGroup.tasks.length > 0 ? (
          <div className="space-y-8">
            {taskGroup.tasks.map((task: any, index: number) => {
              // Parse the content if it's a JSON string
              let contentObj: any = {};
              try {
                contentObj = typeof task.content === 'string' ? JSON.parse(task.content) : task.content;
              } catch (e) {
                // If it's not JSON, fallback to treating it as a raw string
                contentObj = { question: task.content };
              }

              return (
                <div key={task.id} className="p-6 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">
                    Zadanie {index + 1}
                  </h3>
                  
                  {/* The Question */}
                  <div className="text-lg text-gray-900 mb-6">
                    <MixedMathText text={contentObj.question || ''} />
                  </div>

                  {/* The Options (if available) */}
                  {contentObj.options && Array.isArray(contentObj.options) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {contentObj.options.map((opt: string, optIndex: number) => (
                        <button 
                          key={optIndex}
                          className="p-3 text-center border rounded-md bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <MixedMathText text={opt} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">Brak zadań w tej grupie.</p>
        )}
      </div>
    </div>
  );
}
