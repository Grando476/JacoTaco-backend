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
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <p className="text-xl">Ładowanie lekcji...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col justify-center items-center">
        <p className="text-xl text-red-500 mb-4">Błąd: {error || "Nie znaleziono lekcji"}</p>
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Wróć do Mapy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Wróć do Mapy
        </Link>
        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
        
        {lesson.video_url && (
          <div className="aspect-video bg-gray-200 mb-6 flex items-center justify-center rounded-lg overflow-hidden">
            <iframe 
              src={lesson.video_url} 
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="prose max-w-none">
          <h2>Treść lekcji</h2>
          <div className="my-4 p-4 bg-gray-100 rounded text-center overflow-x-auto text-black">
             {lesson.content_tex ? (
                 <BlockMath math={lesson.content_tex} />
             ) : (
                 <p className="text-gray-500 italic">Brak treści.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
