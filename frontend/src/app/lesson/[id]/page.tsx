"use client";

import Link from "next/link";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { useEffect, useState } from "react";

export default function LessonPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/lessons/${params.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch lesson");
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setLesson(data.lesson);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171a1f] text-[#f8fafc] p-8 flex justify-center items-center">
        <p className="text-xl">Ładowanie lekcji...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-[#171a1f] text-[#f8fafc] p-8 flex flex-col justify-center items-center">
        <p className="text-xl text-red-500 mb-4">Błąd: {error || "Nie znaleziono lekcji"}</p>
        <Link href="/" className="text-[#38bdf8] hover:text-[#0ea5e9] transition-colors">
          &larr; Wróć do Mapy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171a1f] text-[#f8fafc] p-8">
      <div className="max-w-3xl mx-auto bg-[#1a222c] border border-[#2d3748] p-8 rounded-lg shadow-xl">
        <Link href="/" className="text-[#38bdf8] hover:text-[#0ea5e9] transition-colors mb-6 inline-block">
          &larr; Wróć do Mapy
        </Link>
        <h1 className="text-3xl font-bold mb-6 text-[#f8fafc]">{lesson.title}</h1>
        
        {lesson.video_url && (
          <div className="aspect-video bg-[#1e293b] border border-[#2d3748] mb-6 flex items-center justify-center rounded-lg overflow-hidden">
            <iframe 
              src={lesson.video_url} 
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="prose max-w-none text-[#f8fafc]">
          <h2 className="text-xl font-semibold mb-4 text-[#cbd5e1]">Treść lekcji</h2>
          <div className="my-4 p-6 bg-[#1e293b] border border-[#2d3748] rounded text-center overflow-x-auto text-[#f8fafc] shadow-inner">
             {lesson.content_tex ? (
                 <BlockMath math={lesson.content_tex} />
             ) : (
                 <p className="text-[#94a3b8] italic">Brak treści.</p>
             )}
          </div>
        </div>

        {lesson.task_groups && lesson.task_groups.length > 0 && (
          <div className="mt-12 border-t border-[#2d3748] pt-8">
            <h2 className="text-2xl font-bold mb-6 text-[#f8fafc]">Grupy zadań</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.task_groups.map((group: any) => (
                <Link 
                  key={group.id} 
                  href={`/exercise/${group.id}`}
                  className="block p-5 border border-[#334155] rounded-lg bg-[#1e293b] shadow-md hover:border-[#0ea5e9] hover:bg-[#273549] transition-all group"
                >
                  <h3 className="font-semibold text-lg text-[#38bdf8] group-hover:text-[#0ea5e9]">{group.name}</h3>
                  <p className="text-[#94a3b8] text-sm mt-2">Przejdź do zadań &rarr;</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
