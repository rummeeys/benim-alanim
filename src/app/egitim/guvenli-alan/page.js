'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const SAMPLE_VIDEO_SRC = "/videos/level-1.mp4"; // Video source 

export default function GuvenliAlanEgitimPage() {
  const router = useRouter();
  const videoRef = useRef(null); // .play() methodu çağırmak için 
  const [hasStarted, setHasStarted] = useState(false); //Video başladı mı? kontrolü
  const [videoEnded, setVideoEnded] = useState(false); //Video bitti mi kontrolü 

  useEffect(() => {
    router.prefetch("/oyun/guvenli-alan-bulmaca"); // oyun sayfasını önceden yüklemek 
  }, [router]);

  const handlePlay = useCallback(() => {
    setHasStarted(true);
  }, []);

  const handleEnded = useCallback(() => {
    setVideoEnded(true);
  }, []);

  const handleStartClick = useCallback(() => {
    videoRef.current
      ?.play()
      ?.catch((error) => console.log("Oynatma hatası:", error)); // otomatik oynatma engellenirse 
  }, []);

  const showStartButton = !videoEnded && !hasStarted;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50">
      <div className="flex min-h-screen flex-col">
        <header className="relative flex h-16 shrink-0 items-center px-4 sm:h-[4.5rem] sm:px-8">
          <Link
            href="/dashboard"
            className="relative z-20 shrink-0 rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-extrabold text-emerald-950 shadow-lg ring-2 ring-emerald-200/90 transition hover:bg-emerald-200 hover:ring-emerald-100 sm:px-7 sm:py-3 sm:text-base"
          >
            ← Panele Dön
          </Link>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-4 md:px-8 md:py-8">
          <div className="w-full max-w-4xl">
            <p className="mb-4 text-center text-lg font-bold text-sky-800 md:text-xl">
              Güvenli Alan — Eğitim Videosu
            </p>
            <div className="overflow-hidden rounded-3xl bg-white/70 p-2 shadow-xl ring-4 ring-sky-200/80">
              <video // muted: video sesi kapalı, playInline: mobilde tam ekran açılmasın diye, preload: önden yükleme. 
                ref={videoRef}
                className="aspect-video w-full rounded-2xl bg-slate-900/5"
                src={SAMPLE_VIDEO_SRC}
                controls
                muted
                playsInline
                preload="metadata"
                onPlay={handlePlay}
                onEnded={handleEnded}
              /> 
            </div> 
          </div>
        </div>

        <div className="flex min-h-[5.5rem] shrink-0 items-center justify-center px-4 pb-10 pt-2">
          {showStartButton && ( // Video başlamadıysa başlat butonu göster
            <button
              type="button"
              onClick={handleStartClick}
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-8 py-4 text-lg font-extrabold text-emerald-950 shadow-lg ring-2 ring-emerald-300/80 transition hover:bg-emerald-300 hover:ring-emerald-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500"
            >
              Oyuna Başla 
            </button> //buton texti
          )}
          {videoEnded && ( // Video bittiyse oyun sayfasına yönlendir
            <Link //yönlendirme adresi 
              href="/oyun/guvenli-alan-bulmaca"
              className="inline-flex max-w-lg items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 px-8 py-4 text-center text-base font-extrabold leading-snug text-orange-950 shadow-lg ring-2 ring-amber-200/90 transition hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 md:text-lg"
            > 
              Harika İzledin! Şimdi Oyun Vakti
            </Link> //buton texti
          )}
        </div>
      </div>
    </main>
  );
}
