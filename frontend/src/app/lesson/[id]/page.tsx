import Link from "next/link";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

export default function LessonPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Wróć do Mapy
        </Link>
        <h1 className="text-3xl font-bold mb-6">Lekcja: {params.id}</h1>
        
        <div className="aspect-video bg-gray-200 mb-6 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">[ Video Player Placeholder ]</p>
        </div>

        <div className="prose max-w-none">
          <h2>Treść lekcji</h2>
          <p>Miejsce na treść markdown pobieraną z backendu.</p>
          <div className="my-4 p-4 bg-gray-100 rounded text-center">
            <BlockMath math="E = mc^2" />
          </div>
          <div className="mt-8 p-4 border rounded-lg bg-blue-50">
            <h3 className="font-semibold text-blue-800">Zadanie testowe (Cloze)</h3>
            <p className="mt-2 text-sm text-gray-700">Wpisz poprawny wynik:</p>
            <div className="mt-2 flex items-center gap-2">
              <span>2 + 2 = </span>
              <input type="number" className="border rounded px-2 py-1 w-20" placeholder="?" />
              <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Sprawdź</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
