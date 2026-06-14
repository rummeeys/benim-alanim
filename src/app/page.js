"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpenModal = () => {
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
    setError("");
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Önce adını yazmayı unutma olur mu?");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const { error: supabaseError } = await supabase
        .from("students")
        .insert({ name: trimmedName });

      if (supabaseError) {
        setError("Ufak bir sorun çıktı, tekrar dener misin?");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("studentName", trimmedName);
      router.push(`/dashboard?name=${encodeURIComponent(trimmedName)}`);
    } catch (e) {
      setError("Ufak bir sorun çıktı, tekrar dener misin?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-yellow-50">
      <div className="max-w-xl w-full px-6 py-12 text-center">
        <div className="mb-6 flex items-center justify-center">
          <Image
            src="/bulut.png"
            alt="Bulut"
            width={140}
            height={120}
            className="h-auto w-[140px] object-contain"
            priority
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-blue-700 mb-4">
          Benim Alanım&apos;a Hoş Geldin!
        </h1>

        <p className="text-lg md:text-xl text-blue-900/80 mb-8">
          Burada güven, dostluk ve mahremiyet hakkında eğlenceli maceralara çıkacaksın.
          Hazırsan, renkli bir yolculuk seni bekliyor!
        </p>

        <button
          className="inline-flex items-center justify-center px-10 py-4 text-lg md:text-xl font-extrabold rounded-full bg-orange-400 text-white shadow-lg hover:bg-orange-500 hover:shadow-xl active:scale-95 transition-transform transition-shadow duration-200"
          onClick={handleOpenModal}
        >
          Maceraya Başla!
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-50">
          <div className="w-full max-w-md mx-4 rounded-3xl bg-white shadow-xl p-8 text-center relative">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-sm"
              onClick={handleCloseModal}
              disabled={isLoading}
              aria-label="Kapat"
            >
              ✕
            </button>

            <h2 className="text-2xl md:text-3xl font-extrabold text-blue-700 mb-4">
              Merhaba Arkadaşım! Adın Nedir?
            </h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adını buraya yaz :)"
              className="w-full mt-4 rounded-2xl border-2 border-yellow-200 bg-yellow-50/60 px-4 py-3 text-lg outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-200 transition"
            />

            {error && (
              <p className="mt-3 text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              className="mt-6 inline-flex items-center justify-center w-full px-6 py-3 text-lg font-extrabold rounded-full bg-green-400 text-white shadow-md hover:bg-green-500 hover:shadow-lg active:scale-95 transition-transform transition-shadow duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Bekle, hazırlanıyoruz..." : "Hadi Gidelim!"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}