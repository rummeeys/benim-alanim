"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [studentName, setStudentName] = useState("Arkadaşım");
  const [isLoadingName, setIsLoadingName] = useState(true);
  const [isLevel2Unlocked, setIsLevel2Unlocked] = useState(false);
  const [isLevel3Unlocked, setIsLevel3Unlocked] = useState(false);

  useEffect(() => {
    setIsLevel2Unlocked(localStorage.getItem("level2Unlocked") === "true");
    setIsLevel3Unlocked(localStorage.getItem("seviye3Acik") === "true");
  }, []);

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
            Alanıma Dön
          </Link>
        </div>

        <section
          className={`mb-8 rounded-3xl p-6 md:p-8 shadow-sm ${
            isLevel3Unlocked
              ? "bg-blue-100"
              : isLevel2Unlocked
                ? "bg-purple-100"
                : "bg-orange-100"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p
                className={`text-sm md:text-base font-bold mb-1 ${
                  isLevel3Unlocked
                    ? "text-blue-600"
                    : isLevel2Unlocked
                      ? "text-purple-700"
                      : "text-orange-700"
                }`}
              >
                Yolculuk Durumu
              </p>
              <p
                className={`text-xl md:text-2xl font-extrabold ${
                  isLevel3Unlocked
                    ? "text-blue-950"
                    : isLevel2Unlocked
                      ? "text-purple-800"
                      : "text-orange-800"
                }`}
              >
                {isLevel3Unlocked
                  ? "3. Seviye: Yardım İstemek Kahramanlıktır"
                  : isLevel2Unlocked
                    ? "2. Seviye: Vücudum Bana Özel"
                    : "1. Seviye: Güvenli Alan Kaşifi"}
              </p>
            </div>
            <span
              className="text-4xl md:text-5xl animate-pulse"
              role="img"
              aria-label={
                isLevel3Unlocked
                  ? "Kahraman"
                  : isLevel2Unlocked
                    ? "Kutlama"
                    : "Parlayan yıldız"
              }
            >
              {isLevel3Unlocked ? "🦸" : isLevel2Unlocked ? "🎉" : "⭐"}
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
            <Link
              href="/egitim/guvenli-alan"
              className="mt-auto flex w-full items-center justify-center rounded-full bg-green-500 px-6 py-3 text-lg font-extrabold text-white shadow-md hover:bg-green-600 hover:scale-105 transition-transform duration-200"
            >
              Hadi Başla!
            </Link>
          </article>

          <article
            className={`rounded-3xl p-6 md:p-7 shadow-md hover:scale-[1.02] transition-transform duration-200 flex flex-col ${
              isLevel2Unlocked ? "bg-purple-100" : "bg-gray-100"
            }`}
          >
            <div
              className="mb-4 text-5xl"
              role="img"
              aria-label={isLevel2Unlocked ? "Çiçek" : "Kilit"}
            >
              {isLevel2Unlocked ? "🌸" : "🔒"}
            </div>
            <h2
              className={`mb-3 text-2xl font-extrabold ${
                isLevel2Unlocked ? "text-purple-800" : "text-gray-700"
              }`}
            >
              Vücudum Bana Özel
            </h2>
            <p
              className={`mb-6 text-base md:text-lg ${
                isLevel2Unlocked ? "text-purple-700" : "text-gray-600"
              }`}
            >
              {isLevel2Unlocked
                ? "Vücudumuzun bize özel alanlarını tanıyarak sınırlarımızı çizmeyi öğreniyoruz!"
                : "Yakında..."}
            </p>
            {isLevel2Unlocked ? (
              <Link
                href="/egitim/vucudum-bana-ozel/video-1"
                className="mt-auto flex w-full items-center justify-center rounded-full bg-purple-500 px-6 py-3 text-lg font-extrabold text-white shadow-md hover:bg-purple-600 hover:scale-105 transition-transform duration-200"
              >
                Maceraya Başla!
              </Link>
            ) : (
              <button
                className="mt-auto w-full rounded-full bg-gray-300 px-6 py-3 text-lg font-extrabold text-gray-600 cursor-not-allowed"
                disabled
              >
                Kilitli
              </button>
            )}
          </article>

          <article
            className={`rounded-3xl p-6 md:p-7 shadow-md hover:scale-[1.02] transition-transform duration-200 flex flex-col ${
              isLevel3Unlocked ? "bg-blue-50" : "bg-gray-100"
            }`}
          >
            <div
              className="mb-4 text-5xl"
              role="img"
              aria-label={isLevel3Unlocked ? "Kahraman" : "Kilit"}
            >
              {isLevel3Unlocked ? "🦸" : "🔒"}
            </div>
            <h2
              className={`mb-3 text-2xl font-extrabold ${
                isLevel3Unlocked ? "text-blue-950" : "text-gray-700"
              }`}
            >
              Yardım İstemek Kahramanlıktır
            </h2>
            <p
              className={`mb-6 text-base md:text-lg ${
                isLevel3Unlocked ? "text-blue-700" : "text-gray-600"
              }`}
            >
              {isLevel3Unlocked
                ? "İhtiyaç duyduğumuzda güvendiğimiz yetişkinlerden doğru şekilde yardım istemeyi öğreniyoruz!"
                : "Yakında..."}
            </p>
            {isLevel3Unlocked ? (
              <Link
                href="/egitim/yardim-istemek"
                className="mt-auto flex w-full items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-lg font-extrabold text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-blue-600"
              >
                Hadi Başlayalım!
              </Link>
            ) : (
              <button
                className="mt-auto w-full rounded-full bg-gray-300 px-6 py-3 text-lg font-extrabold text-gray-600 cursor-not-allowed"
                disabled
              >
                Kilitli
              </button>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
