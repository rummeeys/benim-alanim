"use client";

import confetti from "canvas-confetti";
import { Comfortaa } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ASSET_BASE = "/assets/level2-video1-2";
const TOTAL_CARDS = 16;
const POINTS_PER_CARD = 100 / TOTAL_CARDS;
const PASS_SCORE = 70;

const CARD_BACK_COLORS = [
  "from-pink-200 to-rose-100 ring-pink-200/80",
  "from-sky-200 to-blue-100 ring-sky-200/80",
  "from-violet-200 to-purple-100 ring-violet-200/80",
  "from-amber-200 to-yellow-100 ring-amber-200/80",
  "from-emerald-200 to-teal-100 ring-emerald-200/80",
  "from-orange-200 to-amber-100 ring-orange-200/80",
  "from-fuchsia-200 to-pink-100 ring-fuchsia-200/80",
  "from-cyan-200 to-sky-100 ring-cyan-200/80",
  "from-lime-200 to-green-100 ring-lime-200/80",
  "from-indigo-200 to-violet-100 ring-indigo-200/80",
  "from-rose-200 to-pink-100 ring-rose-200/80",
  "from-teal-200 to-cyan-100 ring-teal-200/80",
  "from-yellow-200 to-amber-100 ring-yellow-200/80",
  "from-purple-200 to-fuchsia-100 ring-purple-200/80",
  "from-blue-200 to-indigo-100 ring-blue-200/80",
  "from-green-200 to-emerald-100 ring-green-200/80",
];

const BASE_CARDS = [
  ...Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    image: `${ASSET_BASE}/iyi-dokunus${index + 1}.jpg`,
    type: "iyi",
  })),
  ...Array.from({ length: 8 }, (_, index) => ({
    id: index + 9,
    image: `${ASSET_BASE}/kotu-dokunus${index + 1}.jpg`,
    type: "kotu",
  })),
];

const DEFAULT_BUTTON_STATE = { iyi: "default", kotu: "default" };
const CARD_ROWS_LAYOUT = [5, 6, 5];
const CARD_SIZE_CLASS =
  "w-[calc((min(100vw-1.5rem,42rem)-1.5rem)/4)] sm:w-[calc((min(100vw-2rem,42rem)-2.25rem)/4)] md:w-[calc((min(100vw-2rem,42rem)-3rem)/4)]";

function shuffle(array) {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function createInitialDeck() {
  return BASE_CARDS.map((card, index) => ({
    ...card,
    faceNumber: index + 1,
  }));
}

function createShuffledDeck() {
  return shuffle(BASE_CARDS).map((card, index) => ({
    ...card,
    faceNumber: index + 1,
  }));
}

function CardGridSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4">
      {CARD_ROWS_LAYOUT.map((count, rowIndex) => (
        <div
          key={`skeleton-row-${rowIndex}`}
          className="flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4"
        >
          {Array.from({ length: count }, (_, slotIndex) => (
            <div
              key={`skeleton-${rowIndex}-${slotIndex}`}
              className={`aspect-square shrink-0 animate-pulse rounded-2xl bg-white/60 shadow-md ring-2 ring-violet-100/80 ${CARD_SIZE_CLASS}`}
            />
          ))}
        </div>
      ))}
    </div>
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

function fireMiniConfetti() {
  confetti({
    particleCount: 36,
    spread: 62,
    startVelocity: 26,
    gravity: 0.9,
    scalar: 0.72,
    ticks: 110,
    origin: { x: 0.58, y: 0.52 },
  });
  confetti({
    particleCount: 18,
    spread: 38,
    startVelocity: 18,
    scalar: 0.55,
    ticks: 90,
    origin: { x: 0.62, y: 0.5 },
  });
}

function getAnswerButtonClassName(state, variant) {
  if (state === "wrong") {
    return "bg-rose-500 ring-rose-300 hover:bg-rose-500";
  }
  if (state === "correct") {
    return "bg-emerald-500 ring-emerald-300 hover:bg-emerald-500";
  }
  return variant === "iyi"
    ? "bg-emerald-400 ring-emerald-200 hover:bg-emerald-500"
    : "bg-rose-400 ring-rose-200 hover:bg-rose-500";
}

function PopupAnswerButton({
  variant,
  label,
  state,
  shakeTrigger,
  showWrongGlow,
  disabled,
  onClick,
}) {
  return (
    <motion.button
      key={`${variant}-${shakeTrigger}`}
      type="button"
      initial={{ x: 0 }}
      animate={
        shakeTrigger > 0
          ? { x: [0, -12, 12, -10, 10, -6, 6, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.45, ease: "easeInOut" }}
      whileHover={state === "default" ? { scale: 1.02 } : undefined}
      whileTap={state === "default" ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-4 text-sm font-bold text-white ring-2 transition-shadow duration-500 sm:py-5 sm:text-base md:text-lg ${
        showWrongGlow
          ? "shadow-[0_0_15px_rgba(239,68,68,0.7)]"
          : "shadow-lg"
      } ${getAnswerButtonClassName(state, variant)}`}
    >
      {label}
    </motion.button>
  );
}

function MemoryCard({
  card,
  index,
  isFlipped,
  isCompleted,
  disabled,
  onSelect,
}) {
  const backColor = CARD_BACK_COLORS[index % CARD_BACK_COLORS.length];

  return (
    <button
      type="button"
      aria-label={`Kart ${card.faceNumber}`}
      disabled={disabled}
      onClick={() => onSelect(card.id)}
      className={`group relative aspect-square shrink-0 ${CARD_SIZE_CLASS} [perspective:900px] focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-default`}
    >
      <div
        className={`relative h-full w-full rounded-2xl shadow-md transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner ring-2 [backface-visibility:hidden] ${backColor}`}
        >
          <span className="text-2xl font-extrabold text-violet-900/80 drop-shadow-sm sm:text-3xl md:text-4xl">
            {card.faceNumber}
          </span>
        </div>

        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-white ring-2 ring-violet-100 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Image
            src={card.image}
            alt={`Kart ${card.faceNumber}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 22vw, 120px"
          />
          {isCompleted && (
            <div className="absolute inset-0 flex items-start justify-end bg-emerald-500/15 p-1.5 sm:p-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm text-white shadow-lg ring-2 ring-white sm:h-8 sm:w-8 sm:text-base"
                aria-hidden
              >
                ✓
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function OzelAlanimOyun2Page() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [deck, setDeck] = useState(createInitialDeck);
  const [completedIds, setCompletedIds] = useState(() => new Set());
  const [scoredIds, setScoredIds] = useState(() => new Set());
  const [activeCardId, setActiveCardId] = useState(null);
  const [popupButtonState, setPopupButtonState] = useState(DEFAULT_BUTTON_STATE);
  const [shakeTriggers, setShakeTriggers] = useState({ iyi: 0, kotu: 0 });
  const [wrongGlow, setWrongGlow] = useState({ iyi: false, kotu: false });
  const [hadWrongAttempt, setHadWrongAttempt] = useState(false);
  const [isClosingPopup, setIsClosingPopup] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const score = useMemo(
    () => Math.round(scoredIds.size * POINTS_PER_CARD),
    [scoredIds]
  );

  const openedCount = completedIds.size;
  const progressPercent = (openedCount / TOTAL_CARDS) * 100;
  const passed = score >= PASS_SCORE;

  const activeCard = useMemo(
    () => deck.find((card) => card.id === activeCardId) ?? null,
    [deck, activeCardId]
  );

  const deckRows = useMemo(() => {
    let cursor = 0;
    return CARD_ROWS_LAYOUT.map((count) => {
      const row = deck.slice(cursor, cursor + count);
      cursor += count;
      return row;
    });
  }, [deck]);

  const resetPopupState = useCallback(() => {
    setPopupButtonState(DEFAULT_BUTTON_STATE);
    setShakeTriggers({ iyi: 0, kotu: 0 });
    setWrongGlow({ iyi: false, kotu: false });
    setHadWrongAttempt(false);
    setIsClosingPopup(false);
  }, []);

  const handleSelectCard = useCallback(
    (cardId) => {
      if (gameComplete || completedIds.has(cardId) || activeCardId) return;
      setActiveCardId(cardId);
      resetPopupState();
    },
    [activeCardId, completedIds, gameComplete, resetPopupState]
  );

  const finishCard = useCallback(
    (cardId, earnedPoint) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.add(cardId);
        if (next.size === TOTAL_CARDS) {
          setGameComplete(true);
        }
        return next;
      });

      if (earnedPoint) {
        setScoredIds((prev) => new Set(prev).add(cardId));
      }
    },
    []
  );

  const handleAnswer = useCallback(
    (answerType) => {
      if (!activeCard || isClosingPopup) return;

      const isCorrect = answerType === activeCard.type;

      if (!isCorrect) {
        setHadWrongAttempt(true);
        setPopupButtonState((prev) => ({
          ...prev,
          [answerType]: "wrong",
        }));
        setShakeTriggers((prev) => ({
          ...prev,
          [answerType]: prev[answerType] + 1,
        }));
        setWrongGlow((prev) => ({ ...prev, [answerType]: true }));
        window.setTimeout(() => {
          setWrongGlow((prev) => ({ ...prev, [answerType]: false }));
        }, 600);
        return;
      }

      setPopupButtonState((prev) => ({
        ...prev,
        [answerType]: "correct",
      }));
      setIsClosingPopup(true);
      fireMiniConfetti();

      const earnedPoint = !hadWrongAttempt;
      const cardId = activeCard.id;

      window.setTimeout(() => {
        finishCard(cardId, earnedPoint);
        setActiveCardId(null);
        resetPopupState();
      }, 500);
    },
    [activeCard, finishCard, hadWrongAttempt, isClosingPopup, resetPopupState]
  );

  const handleClosePopup = useCallback(() => {
    if (isClosingPopup) return;
    setActiveCardId(null);
    resetPopupState();
  }, [isClosingPopup, resetPopupState]);

  const handleStartLevel3 = useCallback(() => {
    localStorage.setItem("seviye3Acik", "true");
    router.push("/dashboard");
  }, [router]);

  useEffect(() => {
    setDeck(createShuffledDeck());
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (gameComplete && passed) {
      fireConfetti();
    }
  }, [gameComplete, passed]);

  return (
    <main
      className={`${comfortaa.className} flex h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-100 via-violet-50 to-pink-100 p-3 sm:p-4`}
    >
      <header className="shrink-0 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/egitim/vucudum-bana-ozel/video-2"
            className="shrink-0 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-violet-800 shadow-md ring-2 ring-violet-100 transition hover:bg-white sm:px-4 sm:py-2 sm:text-sm"
          >
            ← Videoya Dön
          </Link>
          <p className="text-center text-sm font-extrabold text-violet-900 sm:text-base md:text-lg">
            İyi mi, Kötü mü Dokunuş?
          </p>
          <div className="w-[4.5rem] shrink-0 sm:w-24" aria-hidden />
        </div>

        <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white/75 p-3 shadow-lg ring-2 ring-violet-100/90 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold text-violet-800 sm:text-sm">
            <span>Skor: {score}/100</span>
            <span>
              Açılan kart: {openedCount}/{TOTAL_CARDS}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-violet-100 shadow-inner sm:h-3.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 items-center justify-center py-2 sm:py-3">
        {!hasMounted ? (
          <CardGridSkeleton />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4">
            {deckRows.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4"
              >
                {row.map((card) => {
                  const index = deck.findIndex((item) => item.id === card.id);
                  const isCompleted = completedIds.has(card.id);
                  const isFlipped = isCompleted || activeCardId === card.id;

                  return (
                    <MemoryCard
                      key={card.id}
                      card={card}
                      index={index}
                      isFlipped={isFlipped}
                      isCompleted={isCompleted}
                      disabled={gameComplete || isCompleted || Boolean(activeCardId)}
                      onSelect={handleSelectCard}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {activeCard && (
          <motion.div
            key="answer-modal"
            className="fixed inset-0 z-40 flex items-center justify-center bg-violet-900/25 px-3 backdrop-blur-sm sm:px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="touch-popup-title"
              className="relative w-full max-w-3xl rounded-3xl bg-white/95 p-4 shadow-2xl ring-4 ring-violet-100 sm:p-6 md:p-8"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <button
                type="button"
                aria-label="Pop-up'ı kapat"
                onClick={handleClosePopup}
                disabled={isClosingPopup}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-base font-extrabold text-violet-500 shadow-sm ring-2 ring-violet-200 transition hover:scale-105 hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-60 sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-lg"
              >
                ✕
              </button>

              <p
                id="touch-popup-title"
                className="mb-4 mt-1 text-center text-lg font-bold text-violet-800 sm:text-xl"
              >
                Bu dokunuş nasıl?
              </p>

              <div className="flex flex-col items-center gap-5 md:flex-row md:items-stretch md:gap-6">
                <div className="relative mx-auto aspect-square w-full max-w-[220px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 to-pink-50 ring-2 ring-violet-100 sm:max-w-[260px] md:max-w-[300px]">
                  <Image
                    src={activeCard.image}
                    alt={`Kart ${activeCard.faceNumber}`}
                    fill
                    className="object-cover"
                    sizes="300px"
                    priority
                  />
                </div>

                <div className="flex w-full flex-1 flex-col justify-center gap-3 sm:gap-4">
                  <PopupAnswerButton
                    variant="iyi"
                    label="İyi Dokunuş 😊"
                    state={popupButtonState.iyi}
                    shakeTrigger={shakeTriggers.iyi}
                    showWrongGlow={wrongGlow.iyi}
                    disabled={isClosingPopup}
                    onClick={() => handleAnswer("iyi")}
                  />
                  <PopupAnswerButton
                    variant="kotu"
                    label="Kötü Dokunuş 🛑"
                    state={popupButtonState.kotu}
                    shakeTrigger={shakeTriggers.kotu}
                    showWrongGlow={wrongGlow.kotu}
                    disabled={isClosingPopup}
                    onClick={() => handleAnswer("kotu")}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameComplete && (
          <motion.div
            key="game-complete"
            className="fixed inset-0 z-50 flex items-center justify-center bg-violet-900/30 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="flex w-full max-w-lg flex-col items-center rounded-3xl bg-white/95 px-6 py-8 text-center shadow-2xl ring-4 ring-amber-100 sm:px-10 sm:py-10"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="relative mb-5 h-36 w-36 sm:h-44 sm:w-44"
              >
                <Image
                  src="/bulut.png"
                  alt="Bulut karakteri"
                  fill
                  className={`object-contain drop-shadow-lg ${passed ? "" : "opacity-90 saturate-75"}`}
                  sizes="176px"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 text-base font-bold leading-relaxed text-violet-900 sm:text-lg"
              >
                {passed ? (
                  <>
                    Harikasın! İyi ve kötü dokunuşları mükemmel ayırt ettin. Artık bir
                    sonraki seviyeye geçmeye tamamen hazırsın! 🚀✨
                  </>
                ) : (
                  <>
                    Harika denemeydi! Ama özel alanlarımızı korumayı daha iyi öğrenmek
                    için videomuzu bir kez daha izlemeye ne dersin? 😊🐳
                  </>
                )}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                {passed ? (
                  <button
                    type="button"
                    onClick={handleStartLevel3}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 px-8 py-4 text-base font-extrabold text-orange-950 shadow-lg ring-2 ring-amber-200/90 transition hover:scale-[1.03] hover:shadow-xl sm:text-lg"
                  >
                    3. Seviyeye Başla! 🌈
                  </button>
                ) : (
                  <Link
                    href="/egitim/vucudum-bana-ozel/video-2"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-300 via-violet-300 to-pink-300 px-8 py-4 text-base font-extrabold text-violet-950 shadow-lg ring-2 ring-sky-200/90 transition hover:scale-[1.03] hover:shadow-xl sm:text-lg"
                  >
                    Videoyu Tekrar İzle 🎬
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
