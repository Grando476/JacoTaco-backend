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

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

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

  const handleSelect = (taskId: string, optionIndex: number) => {
    if (checkedTasks[taskId]) return;
    setSelectedAnswers(prev => ({ ...prev, [taskId]: optionIndex }));
  };

  const handleCheck = (taskId: string) => {
    setCheckedTasks(prev => ({ ...prev, [taskId]: true }));
  };

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
              let contentObj: any = {};
              try {
                contentObj = typeof task.content === 'string' ? JSON.parse(task.content) : task.content;
              } catch (e) {
                contentObj = { question: task.content };
              }

              const isChecked = checkedTasks[task.id];
              const selectedOpt = selectedAnswers[task.id];
              const correctOpt = contentObj.correct_index;

              return (
                <div key={task.id} className="p-6 border rounded-lg bg-gray-50 shadow-sm">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">
                    Zadanie {index + 1}
                  </h3>
                  
                  <div className="text-lg text-gray-900 mb-6">
                    <MixedMathText text={contentObj.question || ''} />
                  </div>

                  {contentObj.options && Array.isArray(contentObj.options) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {contentObj.options.map((opt: string, optIndex: number) => {
                        let btnClass = "p-4 text-center border rounded-md transition-all text-lg ";
                        if (isChecked) {
                          if (optIndex === correctOpt) {
                            btnClass += "bg-green-100 border-green-500 text-green-900 font-bold";
                          } else if (optIndex === selectedOpt) {
                            btnClass += "bg-red-100 border-red-500 text-red-900 opacity-80";
                          } else {
                            btnClass += "bg-gray-100 border-gray-200 opacity-50";
                          }
                        } else {
                          if (selectedOpt === optIndex) {
                            btnClass += "bg-blue-100 border-blue-500 shadow-md ring-2 ring-blue-300";
                          } else {
                            btnClass += "bg-white hover:bg-blue-50 hover:border-blue-300";
                          }
                        }

                        return (
                          <button 
                            key={optIndex}
                            onClick={() => handleSelect(task.id, optIndex)}
                            disabled={isChecked}
                            className={btnClass}
                          >
                            <MixedMathText text={opt} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {contentObj.options && (
                    <div className="mt-6 flex flex-col items-start gap-4">
                      <button
                        onClick={() => handleCheck(task.id)}
                        disabled={isChecked || selectedOpt === undefined}
                        className={`px-8 py-3 rounded-md font-bold text-white transition-all ${
                          isChecked || selectedOpt === undefined
                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isChecked ? "Sprawdzono" : "Sprawdź odpowiedź"}
                      </button>

                      {isChecked && (
                        <div className={`mt-4 p-5 w-full rounded-md border ${selectedOpt === correctOpt ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <p className={`font-bold text-lg mb-2 ${selectedOpt === correctOpt ? 'text-green-700' : 'text-red-700'}`}>
                            {selectedOpt === correctOpt ? "✨ Świetnie! Poprawna odpowiedź." : "❌ Niestety, to nie jest poprawna odpowiedź."}
                          </p>
                          
                          {task.exemplary_solution && (
                            <div className="mt-4 pt-4 border-t border-gray-300 text-gray-800">
                              <h4 className="font-semibold text-gray-900 mb-3">Wyjaśnienie:</h4>
                              <div className="text-lg">
                                <MixedMathText text={task.exemplary_solution} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
