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
      <div className="min-h-screen bg-[#171a1f] text-[#f8fafc] p-8 flex justify-center items-center">
        <p className="text-xl">Ładowanie zadań...</p>
      </div>
    );
  }

  if (error || !taskGroup) {
    return (
      <div className="min-h-screen bg-[#171a1f] text-[#f8fafc] p-8 flex flex-col justify-center items-center">
        <p className="text-xl text-red-500 mb-4">Błąd: {error || "Nie znaleziono zadań"}</p>
        <button onClick={() => router.back()} className="text-[#38bdf8] hover:text-[#0ea5e9] transition-colors">
          &larr; Wróć
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171a1f] text-[#f8fafc] p-8">
      <div className="max-w-3xl mx-auto bg-[#1a222c] border border-[#2d3748] p-8 rounded-lg shadow-xl text-[#f8fafc]">
        <button onClick={() => router.back()} className="text-[#38bdf8] hover:text-[#0ea5e9] transition-colors mb-6 inline-block">
          &larr; Wróć do Lekcji
        </button>
        <h1 className="text-3xl font-bold mb-6 text-[#f8fafc]">{taskGroup.task_group_name}</h1>

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
                <div key={task.id} className="p-6 border border-[#334155] rounded-lg bg-[#1e293b] shadow-md">
                  <h3 className="font-semibold text-lg text-[#cbd5e1] mb-4">
                    Zadanie {index + 1}
                  </h3>
                  
                  <div className="text-lg text-[#f8fafc] mb-6">
                    <MixedMathText text={contentObj.question || ''} />
                  </div>

                  {contentObj.options && Array.isArray(contentObj.options) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {contentObj.options.map((opt: string, optIndex: number) => {
                        let btnClass = "p-4 text-center border rounded-md transition-all text-lg ";
                        if (isChecked) {
                          if (optIndex === correctOpt) {
                            btnClass += "bg-[#064e3b] border-[#10b981] text-[#a7f3d0] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                          } else if (optIndex === selectedOpt) {
                            btnClass += "bg-[#7f1d1d] border-[#ef4444] text-[#fecaca] opacity-80";
                          } else {
                            btnClass += "bg-[#0f172a] border-[#334155] text-[#64748b] opacity-50";
                          }
                        } else {
                          if (selectedOpt === optIndex) {
                            btnClass += "bg-[#0c4a6e] border-[#0ea5e9] text-[#bae6fd] shadow-[0_0_10px_rgba(14,165,233,0.3)]";
                          } else {
                            btnClass += "bg-[#1a222c] border-[#334155] text-[#cbd5e1] hover:bg-[#273549] hover:border-[#0ea5e9]";
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
                    <div className="mt-8 flex flex-col items-start gap-4">
                      <button
                        onClick={() => handleCheck(task.id)}
                        disabled={isChecked || selectedOpt === undefined}
                        className={`px-8 py-3 rounded-md font-bold text-white transition-all ${
                          isChecked || selectedOpt === undefined
                            ? 'bg-[#475569] cursor-not-allowed opacity-50'
                            : 'bg-[#0ea5e9] hover:bg-[#0284c7] shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:shadow-[0_0_20px_rgba(14,165,233,0.6)]'
                        }`}
                      >
                        {isChecked ? "Sprawdzono" : "Sprawdź odpowiedź"}
                      </button>

                      {isChecked && (
                        <div className={`mt-4 p-5 w-full rounded-md border ${selectedOpt === correctOpt ? 'bg-[#064e3b]/30 border-[#10b981]' : 'bg-[#7f1d1d]/30 border-[#ef4444]'}`}>
                          <p className={`font-bold text-lg mb-2 ${selectedOpt === correctOpt ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                            {selectedOpt === correctOpt ? "✨ Świetnie! Poprawna odpowiedź." : "❌ Niestety, to nie jest poprawna odpowiedź."}
                          </p>
                          
                          {task.exemplary_solution && (
                            <div className="mt-5 pt-5 border-t border-[#334155] text-[#f8fafc]">
                              <h4 className="font-semibold text-[#38bdf8] mb-3">Wyjaśnienie:</h4>
                              <div className="text-lg bg-[#0f172a] p-4 rounded-md border border-[#1e293b]">
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
          <p className="text-[#94a3b8] italic">Brak zadań w tej grupie.</p>
        )}
      </div>
    </div>
  );
}
