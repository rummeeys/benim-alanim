"use client";

import confetti from "canvas-confetti";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
} from "framer-motion";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ASIDE_WIDTH_PX = 280;
const PLAY_GAP_PX = 24;
const VIEW_PAD_X = 100;
const VIEW_PAD_TOP = 100;
const VIEW_PAD_BOTTOM = 40;
/** sm:gap-2.5 ile uyumlu (2 sütun) */
const CARD_GRID_GAP_PX = 10;
/** Görseldeki gibi kale genişliği ≈ 1.5 kart sütunu */
const CASTLE_WIDTH_CARD_MULT = 1.5;
const CASTLE_W_BASE_PX =
  CASTLE_WIDTH_CARD_MULT * (ASIDE_WIDTH_PX - CARD_GRID_GAP_PX) / 2;

const SLOT_COUNT = 6; 

const CARDS = [
  { id: "ev", label: "Ev", emoji: "🏠", correct: true },
  { id: "okul", label: "Okul", emoji: "🏫", correct: true },
  { id: "cocuk-odasi", label: "Çocuk Odası", emoji: "🧸", correct: true },
  { id: "yatak", label: "Yatak", emoji: "🛏️", correct: true },
  { id: "pijama", label: "Pijama", emoji: "🌙", correct: true },
  { id: "canta", label: "Okul Çantası", emoji: "🎒", correct: true },
  { id: "trafik", label: "Trafik Lambası", emoji: "🚦", correct: false },
  { id: "cop", label: "Çöp Kovası", emoji: "🗑️", correct: false },
  { id: "sokak", label: "Sokak Lambası", emoji: "💡", correct: false },
  { id: "araba", label: "Araba", emoji: "🚗", correct: false },
]; //Her kartın correct alanı var. Sürükleme bittiğinde doğru mu yanlış mı tek kontrolle yapılır.

function shuffle(array) { //kartları rastgele karıştır. 
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function rectsOverlap(a, b) { //çarpışma algılama için. 4 koşulun hiçbiri sağlanmıyorsa çarpışma yok demek.
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function fireConfetti() {
  const defaults = { origin: { y: 0.62 } };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(200 * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

function PoolCard({
  card,
  dropZoneRef,
  onCorrect,
  onWrong,
  gameComplete, 
  hasFreeSlot,
}) { 
  const nodeRef = useRef(null);
  const x = useMotionValue(0); //Framer Motion ile kartın konumu kontrol edilir. Yeniden render etmeyi önler. Performans açısından verimli. 
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  const snapHome = useCallback(() => { //kart yanlış yere bırakıldığında geri döner. 
    animate(x, 0, { type: "spring", stiffness: 520, damping: 38 });
    animate(y, 0, { type: "spring", stiffness: 520, damping: 38 });
  }, [x, y]);

  const handleDragEnd = useCallback( // sürükleme bittiğinde kontrol yapılır. 
    (_event, _info) => { 
      if (gameComplete) return; 
      const node = nodeRef.current; // kart konumu.
      const zone = dropZoneRef.current; //kale alanı.
      if (!node || !zone) { // çakışma yoksa
        snapHome(); // geri dön.
        return;
      }

      const cardRect = node.getBoundingClientRect(); 
      const zoneRect = zone.getBoundingClientRect();
      const overlaps = rectsOverlap(cardRect, zoneRect); 

      if (overlaps) {
        if (card.correct) {
          if (!hasFreeSlot) {
            snapHome();
            return;
          }
          onCorrect(card.id); 
          return;
        }
        onWrong(); 
        animate(x, 0, { type: "spring", stiffness: 780, damping: 34 });
        animate(y, 0, { type: "spring", stiffness: 780, damping: 34 });
        animate(rotate, [0, -16, 16, -14, 14, -10, 10, 0], { // yanlış hissi. Titreme. 
          duration: 0.5,
          ease: "easeInOut",
        });
        return;
      }

      snapHome();
    },
    [
      card.correct,
      card.id,
      dropZoneRef,
      gameComplete, 
      hasFreeSlot,
      onCorrect,
      onWrong,
      rotate,
      snapHome,
    ]
  );

  return (
    <motion.div
      ref={nodeRef}
      layout
      style={{ x, y, rotate }}
      drag={!gameComplete} 
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{
        scale: 1.06,
        cursor: "grabbing",
        zIndex: 50,
        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.2)",
      }}
      whileHover={gameComplete ? {} : { scale: 1.02 }} 
      onDragEnd={handleDragEnd}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: "spring", stiffness: 440, damping: 30 }}
      className="flex h-full min-h-0 w-full cursor-grab select-none flex-col items-center justify-center rounded-2xl border-2 border-white/90 bg-white/95 px-0.5 py-1 shadow-md"
    >
      <span
        className="text-[clamp(2rem,9vmin,3.75rem)] leading-none"
        aria-hidden
      >
        {card.emoji}
      </span>
      <span className="mt-0.5 max-w-full truncate px-0.5 text-center text-[11px] font-extrabold uppercase leading-tight tracking-wide text-slate-800 sm:text-xs">
        {card.label}
      </span>
    </motion.div>
  );
}

function CastleDropZone({ //kale alanı. 
  dropZoneRef,
  slots, //boş kartlar.
  greenPulse,
  gameComplete,
}) {
  return (
    <div className="relative m-0 box-border flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden p-0">
      <div className="pointer-events-none flex h-9 w-full shrink-0 items-end justify-center gap-2 px-2 sm:h-10 sm:gap-2.5">
        <div className="h-8 w-12 rounded-t-xl bg-gradient-to-b from-rose-300 to-rose-400 shadow-sm ring-1 ring-rose-200/80 sm:h-9 sm:w-14" />
        <div className="h-9 w-14 rounded-t-xl bg-gradient-to-b from-violet-300 to-violet-400 shadow-md ring-1 ring-violet-200/80 sm:h-10 sm:w-16" />
        <div className="h-8 w-12 rounded-t-xl bg-gradient-to-b from-amber-300 to-amber-400 shadow-sm ring-1 ring-amber-200/80 sm:h-9 sm:w-14" />
      </div>

      <div className="relative z-10 m-0 box-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.25rem] border-[3px] border-pink-200 bg-gradient-to-b from-sky-200/95 via-indigo-100/90 to-purple-100/95 p-0 shadow-[0_8px_20px_rgba(99,102,241,0.2)] ring-2 ring-amber-100/90 sm:rounded-[1.35rem] sm:border-[4px]">
        {greenPulse > 0 && (
          <motion.div
            key={greenPulse} //slot yerleşirse yeşil ışık yanar.
            initial={{ opacity: 0.85 }}
            animate={{
              opacity: [0.8, 1, 0.7],
              boxShadow: [
                "0 0 0 0 rgba(34,197,94,0.45)",
                "0 0 32px 14px rgba(34,197,94,0.55)",
                "0 0 0 0 rgba(34,197,94,0)",
              ],
            }}
            transition={{ duration: 0.58, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
            aria-hidden
          />
        )}

        <div className="m-0 flex shrink-0 items-center justify-center gap-2 px-2 pb-1 pt-2 sm:gap-2.5 sm:px-2.5 sm:pb-1.5 sm:pt-2.5">
          <span className="text-2xl sm:text-3xl" aria-hidden>
            🏰
          </span>
          <h2 className="text-center text-sm font-extrabold text-purple-900 drop-shadow-sm sm:text-base">
            Güvenli Kale
          </h2>
        </div>

        <div
          ref={dropZoneRef}
          className="m-0 grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2.5 overflow-hidden rounded-xl border-[3px] border-dashed border-amber-400/85 bg-white/55 p-2.5 sm:gap-3.5 sm:rounded-2xl sm:border-[3px] sm:p-3.5"
        >
          {slots.map((cardId, index) => {
            const card = cardId ? CARDS.find((c) => c.id === cardId) : null;
            return (
              <div
                key={`slot-${index}`}
                className="flex min-h-0 w-full items-center justify-center overflow-hidden rounded-xl border-[3px] border-dashed border-emerald-400/55 bg-emerald-50/35 sm:rounded-2xl sm:border-[3px]"
              >
                {card ? (
                  <motion.div
                    initial={{ scale: 0.82, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      boxShadow: [
                        "0 0 0 0 rgba(34,197,94,0.45)",
                        "0 0 22px 8px rgba(34,197,94,0.35)",
                        "0 4px 12px rgba(34,197,94,0.18)",
                      ],
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 440,
                      damping: 26,
                      boxShadow: { duration: 0.45 },
                    }}
                    className="flex h-full min-h-0 w-full flex-col items-center justify-center rounded-md border-2 border-green-500 bg-green-100/95 p-0.5 sm:rounded-lg sm:p-1"
                  >
                    <span className="text-[clamp(1.35rem,6vmin,3rem)] leading-none">
                      {card.emoji}
                    </span>
                    <span className="mt-1 line-clamp-2 text-center text-[13px] font-extrabold uppercase leading-tight text-green-900 sm:text-sm">
                      {card.label}
                    </span>
                  </motion.div>
                ) : (
                  <span className="text-xl font-bold text-emerald-500/35 sm:text-2xl">
                    +
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {gameComplete && (
          <p className="pointer-events-none absolute bottom-1.5 left-0 right-0 z-30 m-0 text-center text-xs font-extrabold text-purple-900 drop-shadow-sm sm:bottom-2 sm:text-sm">
            Hepsi tamam!
          </p>
        )}
      </div>
    </div>
  );
}

export default function GuvenliAlanBulmacaPage() {
  const dropZoneRef = useRef(null);
  const asideRef = useRef(null);
  const poolGridRef = useRef(null);
  const [order] = useState(() => shuffle(CARDS)); //bileşen ilk mount edildiğinde kartlar karışır.
  const [slots, setSlots] = useState(() => Array(SLOT_COUNT).fill(null)); //state. boş kartlar.
  const [wrongFlash, setWrongFlash] = useState(false); //state. yanlış hissi. Titreme.
  const [wrongBanner, setWrongBanner] = useState(false); //state. zıp! 
  const [greenPulse, setGreenPulse] = useState(0); //state. yeşil ışık.
  const [layoutNatural, setLayoutNatural] = useState({ gridH: 0, asideH: 0 });
  const [layoutScale, setLayoutScale] = useState(1); //hem kartı hem de kaleyi yan yana göstermek için. 

  const placedIds = useMemo(() => slots.filter(Boolean), [slots]);
  const placedSet = useMemo(() => new Set(placedIds), [placedIds]);
  const gameComplete = placedIds.length >= SLOT_COUNT;
  const hasFreeSlot = slots.some((s) => s === null);

  const poolCards = useMemo(
    () => order.filter((c) => !placedSet.has(c.id)),
    [order, placedSet]
  );

  useEffect(() => { 
    setLayoutNatural({ gridH: 0, asideH: 0 });
  }, [poolCards.length]);

  const { gridH: naturalGridH, asideH: naturalAsideTotal } = layoutNatural;

  useLayoutEffect(() => {
    const aside = asideRef.current;
    const gridEl = poolGridRef.current;
    if (!aside || !gridEl) return;

    if (naturalGridH < 8) {
      const tryRead = () => {
        const gh = gridEl.offsetHeight;
        const ah = aside.offsetHeight;
        if (gh > 8 && ah > 8) {
          setLayoutNatural({ gridH: gh, asideH: ah });
        }
      };
      tryRead();
      if (gridEl.offsetHeight < 8) requestAnimationFrame(tryRead);
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const availW = Math.max(200, vw - VIEW_PAD_X);
    const availH = Math.max(200, vh - VIEW_PAD_TOP - VIEW_PAD_BOTTOM);
    const totalW = CASTLE_W_BASE_PX + PLAY_GAP_PX + ASIDE_WIDTH_PX;
    const r = Math.min(
      1,
      availW / totalW,
      availH / Math.max(naturalAsideTotal, 1)
    );
    setLayoutScale(r);
  }, [naturalGridH, naturalAsideTotal, poolCards.length, gameComplete]);

  useEffect(() => {
    if (naturalGridH < 8) return;
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const availW = Math.max(200, vw - VIEW_PAD_X);
      const availH = Math.max(200, vh - VIEW_PAD_TOP - VIEW_PAD_BOTTOM);
      const totalW = CASTLE_W_BASE_PX + PLAY_GAP_PX + ASIDE_WIDTH_PX;
      setLayoutScale(
        Math.min(
          1,
          availW / totalW,
          availH / Math.max(naturalAsideTotal, 1)
        )
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [naturalGridH, naturalAsideTotal]);

  useEffect(() => { 
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  const handleCorrect = useCallback((id) => {
    setSlots((prev) => {
      if (prev.includes(id)) return prev;
      const i = prev.findIndex((s) => s === null);
      if (i === -1) return prev;
      const next = [...prev];
      next[i] = id;
      queueMicrotask(() => {
        setGreenPulse((n) => n + 1);
        fireConfetti();
      });
      return next;
    });
  }, []);

  const handleWrong = useCallback(() => {
    setWrongFlash(true);
    setWrongBanner(true);
    window.setTimeout(() => setWrongFlash(false), 900);
    window.setTimeout(() => setWrongBanner(false), 2400);
  }, []);

  return (
    <main className="relative h-screen max-h-[100dvh] w-screen overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
      >
        <div className="absolute left-[5%] top-[8%] h-16 w-28 rounded-full bg-white/80 blur-sm sm:h-20 sm:w-36" />
        <div className="absolute left-[20%] top-[4%] h-12 w-40 rounded-full bg-white/70 blur-md sm:left-[25%] sm:top-[6%]" />
        <div className="absolute right-[8%] top-[12%] h-14 w-32 rounded-full bg-white/75 blur-sm" />
        <div className="absolute right-[22%] top-[6%] h-20 w-44 rounded-full bg-white/65 blur-md" />
        <div className="absolute bottom-[32%] left-[15%] h-10 w-24 rounded-full bg-white/60 blur-sm" />
        <div className="absolute bottom-[38%] right-[18%] h-12 w-36 rounded-full bg-white/55 blur-md" />
      </div>

      <AnimatePresence>
        {wrongFlash && (
          <motion.div
            key="red-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-40"
            style={{
              boxShadow: "inset 0 0 72px 30px rgba(239, 68, 68, 0.52)",
            }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wrongBanner && (
          <motion.div
            key="wrong-msg"
            role="status"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <p className="max-w-[min(95vw,28rem)] text-center text-3xl font-extrabold leading-tight text-red-700 drop-shadow-[0_2px_0_#fff,0_4px_20px_rgba(0,0,0,0.12)] sm:text-4xl md:text-5xl">
              Zıp! Buraya ait değil sanki
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex h-full min-h-0 flex-col px-[clamp(50px,6vw,80px)]">
        <header className="relative flex h-16 w-full shrink-0 items-center sm:h-[4.5rem]">
          <Link
            href="/egitim/guvenli-alan"
            className="relative z-20 shrink-0 rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-extrabold text-emerald-950 shadow-lg ring-2 ring-emerald-200/90 transition hover:bg-emerald-200 hover:ring-emerald-100 sm:px-7 sm:py-3 sm:text-base"
          >
            ← Videoya Dön
          </Link>
          <p className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-2 sm:px-4">
            <span className="max-w-[min(88vw,40rem)] text-center text-2xl font-extrabold leading-tight text-purple-950 drop-shadow-sm sm:text-3xl md:text-4xl">
              Doğruları kaleye sürükle!
            </span>
          </p>
        </header>

        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 px-0 pb-4 sm:pb-6">
          <div className="flex w-full max-w-full flex-col items-center justify-center sm:w-auto">
            <div
              className="flex flex-col items-stretch sm:flex-row sm:items-center"
              style={{
                gap:
                  naturalGridH > 7
                    ? `${PLAY_GAP_PX * layoutScale}px`
                    : `${PLAY_GAP_PX}px`,
              }}
            >
              <div
                className="relative box-border shrink-0 overflow-hidden"
                style={
                  naturalGridH > 7
                    ? (() => {
                        const w = CASTLE_W_BASE_PX * layoutScale;
                        const h = naturalGridH * layoutScale;
                        return {
                          width: w,
                          height: h,
                          minWidth: w,
                          minHeight: h,
                          maxWidth: w,
                          maxHeight: h,
                        };
                      })()
                    : {
                        width: "min(88vw, 204px)",
                        height: "min(70vh, 420px)",
                      }
                }
              >
                <CastleDropZone
                  dropZoneRef={dropZoneRef}
                  slots={slots}
                  greenPulse={greenPulse}
                  gameComplete={gameComplete}
                />
              </div>

              <aside
                ref={asideRef}
                className="flex w-full max-w-[280px] shrink-0 flex-col sm:w-[280px]"
                style={
                  naturalGridH > 7
                    ? {
                        width: `${ASIDE_WIDTH_PX * layoutScale}px`,
                        height: `${naturalAsideTotal * layoutScale}px`,
                        maxWidth: "100%",
                      }
                    : { width: "100%", maxWidth: "280px" }
                }
              >
                <p className="m-0 mb-1.5 shrink-0 px-0 text-center text-xs font-extrabold uppercase tracking-wide text-purple-900/85 sm:mb-2 sm:text-sm">
                  Kartlar
                </p>
                <motion.div
                  ref={poolGridRef}
                  layout
                  className={`grid min-h-0 grid-cols-2 gap-2 sm:gap-2.5 ${
                    naturalGridH > 7
                      ? "grid-rows-5 shrink-0"
                      : "flex-1 grid-rows-5"
                  }`}
                  style={
                    naturalGridH > 7
                      ? { height: `${naturalGridH * layoutScale}px` }
                      : undefined
                  }
                >
                  <AnimatePresence mode="popLayout">
                    {poolCards.map((card) => (
                      <PoolCard
                        key={card.id}
                        card={card}
                        dropZoneRef={dropZoneRef}
                        onCorrect={handleCorrect}
                        onWrong={handleWrong}
                        gameComplete={gameComplete}
                        hasFreeSlot={hasFreeSlot}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </aside>
            </div>
          </div>

          <AnimatePresence>
            {gameComplete && (
              <motion.div
                key="next-game-cta"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className="flex w-full shrink-0 justify-center px-2"
              >
                <Link
                  href="/oyun/hula-hoop"
                  className="rounded-full bg-purple-600 px-8 py-3 text-center text-base font-extrabold text-white shadow-lg ring-2 ring-purple-300/90 transition hover:bg-purple-500 hover:ring-purple-200 sm:px-10 sm:py-3.5 sm:text-lg"
                >
                  Sonraki Oyuna Geç →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
