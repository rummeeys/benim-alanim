"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [studentName, setStudentName] = useState("Arkadaşım");
  const [isLoadingName, setIsLoadingName] = useState(true);

  useEffect(() => {
    const fetchLatestStudent = async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("name")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log("Veritabanı verisi:", data);
        if (error) {
          console.error("Supabase hata:", error);
        }

        if (!error && data?.name) {
          setStudentName(data.name);
        } else {
          setStudentName("Arkadaşım");
        }
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setStudentName("Arkadaşım");
      } finally {
        setIsLoadingName(false);
      }
    };

    fetchLatestStudent();
  }, []);

  return (
    <main className="min-h-screen bg-yellow-50 px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 tracking-tight">
            {isLoadingName ? "Yükleniyor..." : `Hoş geldin ${studentName}!`}
          </h1>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-blue-200 px-6 py-3 text-base md:text-lg font-extrabold text-blue-800 shadow-md hover:bg-blue-300 hover:scale-105 transition-transform duration-200"
          >
            Adaya Dön
          </Link>
        </div>

        <section className="mb-8 rounded-3xl bg-orange-100 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm md:text-base font-bold text-orange-700 mb-1">
                Yolculuk Durumu
              </p>
              <p className="text-xl md:text-2xl font-extrabold text-orange-800">
                1. Seviye: Güvenli Alan Kaşifi
              </p>
            </div>
            <span
              className="text-4xl md:text-5xl animate-pulse"
              role="img"
              aria-label="Parlayan yıldız"
            >
              ⭐
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="rounded-3xl bg-green-100 p-6 md:p-7 shadow-md hover:scale-[1.02] transition-transform duration-200 flex flex-col">
            <div className="mb-4 text-5xl" role="img" aria-label="Ev">
              🏠
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-green-800">
              Benim Güvenli Alanım
            </h2>
            <p className="mb-6 text-green-700 text-base md:text-lg">
              Evde, okulda ve parkta kendini güvende hissettiğin yerleri keşfet!
            </p>
            <button className="mt-auto w-full rounded-full bg-green-500 px-6 py-3 text-lg font-extrabold text-white shadow-md hover:bg-green-600 hover:scale-105 transition-transform duration-200">
              Hadi Başla!
            </button>
          </article>

          <article className="rounded-3xl bg-gray-100 p-6 md:p-7 shadow-md hover:scale-[1.02] transition-transform duration-200 flex flex-col">
            <div className="mb-4 text-5xl" role="img" aria-label="Kilit">
              🔒
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-gray-700">
              Vücudum Bana Özel
            </h2>
            <p className="mb-6 text-gray-600 text-base md:text-lg">
              Yakında...
            </p>
            <button
              className="mt-auto w-full rounded-full bg-gray-300 px-6 py-3 text-lg font-extrabold text-gray-600 cursor-not-allowed"
              disabled
            >
              Kilitli
            </button>
          </article>

          <article className="rounded-3xl bg-gray-100 p-6 md:p-7 shadow-md hover:scale-[1.02] transition-transform duration-200 flex flex-col">
            <div className="mb-4 text-5xl" role="img" aria-label="Kilit">
              🔒
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-gray-700">
              Yardım İstemek Kahramanlıktır
            </h2>
            <p className="mb-6 text-gray-600 text-base md:text-lg">
              Yakında...
            </p>
            <button
              className="mt-auto w-full rounded-full bg-gray-300 px-6 py-3 text-lg font-extrabold text-gray-600 cursor-not-allowed"
              disabled
            >
              Kilitli
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}
