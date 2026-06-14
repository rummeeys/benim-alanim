"use client";

import { Comfortaa } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ASSET_BASE = "/assets/level2-video1-1";
const TOTAL_ZONES = 30;

const DEFAULT_BUTTON_STATE = { private: "default", public: "default" };

/** Yan butonları dikeyde eşit aralıkla dağıtır (üst üste binmeyi önler) */
function assignRailTops(zones) {
  const count = zones.length;
  return zones.map((zone, index) => ({
    ...zone,
    railTop: Number((5 + (index * 90) / (count - 1)).toFixed(1)),
  }));
}

/**
 * Kız çocuk — 15 bölge (sol figür)
 * top/left: vücut odak noktası | railTop: kenar butonu
 */
const GIRL_ZONES = assignRailTops([
  { id: "k-el", label: "El", file: "El-(K).png", isPrivate: false, top: 49.5, left: 19.3 },
  { id: "k-kol", label: "Kol", file: "Kol-(K).png", isPrivate: false, top: 41.8, left: 22.5 },
  { id: "k-ayak", label: "Ayak", file: "Ayak-(K).png", isPrivate: false, top: 74.1, left: 33 },
  { id: "k-bacak", label: "Bacak", file: "Bacak-(K).png", isPrivate: false, top: 57.8, left: 32.8 },
  { id: "k-sac", label: "Saç", file: "Saç-(K).png", isPrivate: false, top: 23.6, left: 34 },
  { id: "k-goz", label: "Göz", file: "Göz-(K).png", isPrivate: false, top: 24.4, left: 34 },
  { id: "k-burun", label: "Burun", file: "Burun-(K).png", isPrivate: false, top: 26, left: 34.2 },
  { id: "k-diz", label: "Diz", file: "Diz-(K).png", isPrivate: false, top: 64.1, left: 32.7 },
  { id: "k-omuz", label: "Omuz", file: "Omuz-(K).png", isPrivate: false, top: 34.1, left: 21.5 },
  { id: "k-yuz", label: "Yüz", file: "Yüz-(K).png", isPrivate: false, top: 25.1, left: 36.5 },
  { id: "k-kulak", label: "Kulak", file: "Kulak-(K).png", isPrivate: false, top: 24.4, left: 28.2 },
  {
    id: "k-gogus",
    label: "Göğüs Özel Bölge",
    file: "Göğüs Özel Bölge-(K).png",
    isPrivate: true,
    top: 37.4,
    left: 33.7,
  },
  {
    id: "k-on-ozel",
    label: "Ön Özel Bölge",
    file: "Ön Özel Bölge-(K).png",
    isPrivate: true,
    top: 45.5,
    left: 33.6,
  },
  {
    id: "k-arka-ozel",
    label: "Arka Özel Bölge",
    file: "Arka Özel Bölge-(K).png",
    isPrivate: true,
    top: 45.1,
    left: 23.8,
  },
  {
    id: "k-dudak",
    label: "Dudak Özel Bölge",
    file: "Dudak Özel Bölge-(K).png",
    isPrivate: true,
    top: 27.4,
    left: 34,
  },
]);

/**
 * Erkek çocuk — 15 bölge (sağ figür)
 */
const BOY_ZONES = assignRailTops([
  { id: "e-el", label: "El", file: "El-(E).png", isPrivate: false, top: 49.5, left: 88.7 },
  { id: "e-kol", label: "Kol", file: "Kol-(E).png", isPrivate: false, top: 41.8, left: 78.5 },
  { id: "e-ayak", label: "Ayak", file: "Ayak-(E).png", isPrivate: false, top: 74.1, left: 74.5 },
  { id: "e-bacak", label: "Bacak", file: "Bacak-(E).png", isPrivate: false, top: 57.8, left: 74.3 },
  { id: "e-sac", label: "Saç", file: "Saç-(E).png", isPrivate: false, top: 23, left: 74.7 },
  { id: "e-goz", label: "Göz", file: "Göz-(E).png", isPrivate: false, top: 24.4, left: 74.4 },
  { id: "e-burun", label: "Burun", file: "Burun-(E).png", isPrivate: false, top: 26, left: 74.2 },
  { id: "e-diz", label: "Diz", file: "Diz-(E).png", isPrivate: false, top: 64.1, left: 74.3 },
  { id: "e-omuz", label: "Omuz", file: "Omuz-(E).png", isPrivate: false, top: 34.1, left: 84.2 },
  { id: "e-yuz", label: "Yüz", file: "Yüz-(E).png", isPrivate: false, top: 25.1, left: 68.5 },
  { id: "e-kulak", label: "Kulak", file: "Kulak-(E).png", isPrivate: false, top: 24.4, left: 81.1 },
  {
    id: "e-gogus",
    label: "Göğüs Özel Bölge",
    file: "Göğüs Özel Bölge-(E).png",
    isPrivate: true,
    top: 37.4,
    left: 74.2,
  },
  {
    id: "e-on-ozel",
    label: "Ön Özel Bölge",
    file: "Ön Özel Bölge-(E).png",
    isPrivate: true,
    top: 45.5,
    left: 74.6,
  },
  {
    id: "e-arka-ozel",
    label: "Arka Özel Bölge",
    file: "Arka Özel Bölge-(E).png",
    isPrivate: true,
    top: 45.1,
    left: 84.6,
  },
  {
    id: "e-dudak",
    label: "Dudak Özel Bölge",
    file: "Dudak Özel Bölge-(E).png",
    isPrivate: true,
    top: 27.4,
    left: 73.8,
  },
]);

const BODY_ZONES = [...GIRL_ZONES, ...BOY_ZONES];

function getRenderedImageRect(containerEl) {
  const img = containerEl?.querySelector("img");
  return img?.getBoundingClientRect() ?? containerEl?.getBoundingClientRect();
}

function getSideButtonLabel(label) {
  return label.replace(" Özel Bölge", "");
}

function getAnswerButtonClassName(state, variant) {
  if (state === "wrong") {
    return "bg-rose-500 ring-rose-300 hover:bg-rose-500";
  }
  if (state === "correct") {
    return "bg-emerald-500 ring-emerald-300 hover:bg-emerald-500";
  }
  return variant === "private"
    ? "bg-violet-400 ring-violet-200 hover:bg-violet-500"
    : "bg-sky-400 ring-sky-200 hover:bg-sky-500";
}

function getSideButtonClassName(side, isDone, isPrivate, isHighlighted) {
  if (isDone) {
    return "bg-emerald-300 text-emerald-900 ring-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.45)]";
  }
  if (isHighlighted) {
    if (side === "left") {
      return isPrivate
        ? "bg-fuchsia-500 text-white ring-fuchsia-300 shadow-[0_0_16px_rgba(217,70,239,0.65)] scale-110"
        : "bg-pink-500 text-white ring-pink-300 shadow-[0_0_16px_rgba(236,72,153,0.65)] scale-110";
    }
    return isPrivate
      ? "bg-violet-500 text-white ring-violet-300 shadow-[0_0_16px_rgba(139,92,246,0.65)] scale-110"
      : "bg-sky-500 text-white ring-sky-300 shadow-[0_0_16px_rgba(14,165,233,0.65)] scale-110";
  }
  if (side === "left") {
    return isPrivate
      ? "bg-fuchsia-200/90 text-fuchsia-900 ring-fuchsia-100 hover:bg-fuchsia-300"
      : "bg-pink-200/90 text-pink-900 ring-pink-100 hover:bg-pink-300";
  }
  return isPrivate
    ? "bg-violet-200/90 text-violet-900 ring-violet-100 hover:bg-violet-300"
    : "bg-sky-200/90 text-sky-900 ring-sky-100 hover:bg-sky-300";
}

function SideZoneButton({
  zone,
  side,
  status,
  disabled,
  isHighlighted,
  onClick,
  buttonRef,
}) {
  const isDone = status === "correct";

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={`${zone.label} bölgesi`}
      disabled={disabled}
      onClick={() => onClick(zone.id)}
      style={{ top: `${zone.railTop}%` }}
      className={`absolute z-20 max-w-[4.25rem] -translate-y-1/2 rounded-full px-1.5 py-1 text-center text-[9px] font-bold leading-tight shadow-md ring-2 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-default sm:max-w-[5.25rem] sm:px-2 sm:py-1.5 sm:text-[10px] ${
        side === "left" ? "left-0" : "right-0"
      } ${getSideButtonClassName(side, isDone, zone.isPrivate, isHighlighted)}`}
    >
      {isDone ? (
        <span className="inline-flex items-center gap-0.5">
          <span aria-hidden>✅</span>
          <span>{getSideButtonLabel(zone.label)}</span>
        </span>
      ) : (
        getSideButtonLabel(zone.label)
      )}
    </button>
  );
}

export default function OzelAlanimOyun1Page() {
  const boardRef = useRef(null);
  const imageRef = useRef(null);
  const sideButtonRefs = useRef({});

  const [zoneStatus, setZoneStatus] = useState(() =>
    Object.fromEntries(BODY_ZONES.map((zone) => [zone.id, "pending"]))
  );
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [popupButtonState, setPopupButtonState] = useState(DEFAULT_BUTTON_STATE);
  const [isClosingPopup, setIsClosingPopup] = useState(false);
  const [pointerLines, setPointerLines] = useState([]);
  const [hoveredZoneId, setHoveredZoneId] = useState(null);

  const completedCount = useMemo(
    () => BODY_ZONES.filter((zone) => zoneStatus[zone.id] === "correct").length,
    [zoneStatus]
  );

  const gameComplete = completedCount === TOTAL_ZONES;
  const activeZone = BODY_ZONES.find((zone) => zone.id === activeZoneId) ?? null;
  const progressPercent = (completedCount / TOTAL_ZONES) * 100;

  const updatePointerLines = useCallback(() => {
    const board = boardRef.current;
    const image = imageRef.current;
    if (!board || !image) return;

    const boardRect = board.getBoundingClientRect();
    const imageRect = getRenderedImageRect(image);
    if (!imageRect) return;

    const nextLines = BODY_ZONES.map((zone) => {
      const buttonEl = sideButtonRefs.current[zone.id];
      if (!buttonEl) return null;

      const buttonRect = buttonEl.getBoundingClientRect();
      const isGirl = zone.id.startsWith("k-");

      const startX =
        imageRect.left + (zone.left / 100) * imageRect.width - boardRect.left;
      const startY =
        imageRect.top + (zone.top / 100) * imageRect.height - boardRect.top;
      const endX = buttonRect.left + buttonRect.width / 2 - boardRect.left;
      const endY = buttonRect.top + buttonRect.height / 2 - boardRect.top;

      const bend = Math.max(Math.abs(endX - startX) * 0.42, 36);
      const midX = isGirl ? startX - bend : startX + bend;
      const midY = (startY + endY) / 2;

      return {
        id: zone.id,
        isGirl,
        isDone: zoneStatus[zone.id] === "correct",
        d: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`,
      };
    }).filter(Boolean);

    setPointerLines(nextLines);
  }, [zoneStatus]);

  useLayoutEffect(() => {
    updatePointerLines();

    const board = boardRef.current;
    if (!board) return undefined;

    const observer = new ResizeObserver(() => updatePointerLines());
    observer.observe(board);
    if (imageRef.current) observer.observe(imageRef.current);

    window.addEventListener("resize", updatePointerLines);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePointerLines);
    };
  }, [updatePointerLines]);

  useEffect(() => {
    setPopupButtonState(DEFAULT_BUTTON_STATE);
    setIsClosingPopup(false);
  }, [activeZoneId]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleClosePopup = useCallback(() => {
    if (isClosingPopup) return;
    setActiveZoneId(null);
    setPopupButtonState(DEFAULT_BUTTON_STATE);
  }, [isClosingPopup]);

  const handleZoneClick = useCallback(
    (zoneId) => {
      if (gameComplete) return;
      if (zoneStatus[zoneId] === "correct") return;
      setActiveZoneId(zoneId);
    },
    [gameComplete, zoneStatus]
  );

  const handleAnswer = useCallback(
    (chosePrivate) => {
      if (!activeZone || isClosingPopup) return;

      const buttonKey = chosePrivate ? "private" : "public";
      const isCorrect = activeZone.isPrivate === chosePrivate;

      if (isCorrect) {
        setIsClosingPopup(true);
        setPopupButtonState((prev) => ({ ...prev, [buttonKey]: "correct" }));

        window.setTimeout(() => {
          setZoneStatus((prev) => ({ ...prev, [activeZone.id]: "correct" }));
          setActiveZoneId(null);
          setPopupButtonState(DEFAULT_BUTTON_STATE);
          setIsClosingPopup(false);
        }, 500);
        return;
      }

      setPopupButtonState((prev) => ({ ...prev, [buttonKey]: "wrong" }));
    },
    [activeZone, isClosingPopup]
  );

  return (
    <main
      className={`${comfortaa.className} relative flex h-screen w-screen flex-col justify-between overflow-hidden bg-gradient-to-b from-violet-100 via-pink-50 to-amber-50 p-4`}
    >
      <Link
        href="/egitim/vucudum-bana-ozel/video-2"
        aria-label="2. videoya geç"
        className="fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-extrabold text-violet-600 shadow-md ring-2 ring-violet-200 transition hover:scale-105 hover:bg-violet-100 hover:text-violet-800 sm:right-5 sm:top-5 sm:h-10 sm:w-10"
      >
        →
      </Link>

      <header className="mx-auto w-full max-w-7xl shrink-0">
        <div className="rounded-2xl bg-white/75 p-3 shadow-md ring-2 ring-violet-100 sm:rounded-3xl sm:p-4">
          <p className="mb-1.5 text-center text-xs font-bold text-violet-700 sm:mb-2 sm:text-sm">
            30 bölgeden {completedCount} tanesini keşfettin!
          </p>
          <div className="h-3 overflow-hidden rounded-full bg-violet-100 ring-1 ring-violet-200 sm:h-4">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-400"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 items-center justify-center">
        <div
          ref={boardRef}
          className="relative flex h-full max-h-full w-full items-stretch justify-center gap-1 sm:gap-2 lg:gap-3"
        >
            <svg
              className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
              aria-hidden
            >
              <defs>
                <marker
                  id="arrow-girl"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill="#f0abfc" />
                </marker>
                <marker
                  id="arrow-boy"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill="#7dd3fc" />
                </marker>
              </defs>
              {pointerLines.map((line) => (
                <path
                  key={line.id}
                  d={line.d}
                  fill="none"
                  stroke={line.isDone ? "#6ee7b7" : line.isGirl ? "#f0abfc" : "#7dd3fc"}
                  strokeWidth={line.isDone ? 2.5 : 2}
                  strokeDasharray={line.isDone ? "none" : "6 5"}
                  strokeLinecap="round"
                  markerEnd={`url(#${line.isGirl ? "arrow-girl" : "arrow-boy"})`}
                  opacity={line.isDone ? 0.95 : 0.75}
                />
              ))}
            </svg>

            <div className="relative w-[3.75rem] shrink-0 self-stretch sm:w-24 lg:w-28">
              <div className="relative h-full w-full">
                {GIRL_ZONES.map((zone) => (
                  <SideZoneButton
                    key={zone.id}
                    zone={zone}
                    side="left"
                    status={zoneStatus[zone.id]}
                    isHighlighted={hoveredZoneId === zone.id}
                    disabled={gameComplete || zoneStatus[zone.id] === "correct"}
                    onClick={handleZoneClick}
                    buttonRef={(node) => {
                      sideButtonRefs.current[zone.id] = node;
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative flex h-full min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden">
              <div
                ref={imageRef}
                className="relative aspect-[1536/2730] h-full max-h-full w-auto max-w-full shrink-0 origin-center scale-[1.22] sm:scale-[1.26]"
              >
                <Image
                  src={`${ASSET_BASE}/oyunn1.png`}
                  alt="Kız ve erkek çocuk — vücut bölgelerini keşfet"
                  fill
                  priority
                  className="pointer-events-none object-contain opacity-100"
                  sizes="(max-width: 768px) 55vw, 480px"
                  onLoad={updatePointerLines}
                />

                {BODY_ZONES.map((zone) => {
                  const isGirl = zone.id.startsWith("k-");
                  const isDone = zoneStatus[zone.id] === "correct";

                  return (
                    <button
                      key={`focus-${zone.id}`}
                      type="button"
                      aria-label={`${zone.label} bölgesini incele`}
                      disabled={gameComplete || isDone}
                      style={{ top: `${zone.top}%`, left: `${zone.left}%` }}
                      onMouseEnter={() => setHoveredZoneId(zone.id)}
                      onMouseLeave={() => setHoveredZoneId(null)}
                      onFocus={() => setHoveredZoneId(zone.id)}
                      onBlur={() => setHoveredZoneId(null)}
                      onClick={() => handleZoneClick(zone.id)}
                      className={`absolute z-[30] flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:h-5 sm:w-5 ${
                        isDone ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`h-1.5 w-1.5 rounded-full ring-1 ${
                          isGirl
                            ? "bg-pink-200/50 ring-pink-100/40"
                            : "bg-sky-200/50 ring-sky-100/40"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative w-[3.75rem] shrink-0 self-stretch sm:w-24 lg:w-28">
              <div className="relative h-full w-full">
                {BOY_ZONES.map((zone) => (
                  <SideZoneButton
                    key={zone.id}
                    zone={zone}
                    side="right"
                    status={zoneStatus[zone.id]}
                    isHighlighted={hoveredZoneId === zone.id}
                    disabled={gameComplete || zoneStatus[zone.id] === "correct"}
                    onClick={handleZoneClick}
                    buttonRef={(node) => {
                      sideButtonRefs.current[zone.id] = node;
                    }}
                  />
                ))}
              </div>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {activeZone && !gameComplete && (
          <motion.div
            key="zone-popup"
            className="fixed inset-0 z-40 flex items-center justify-center bg-violet-900/25 px-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="zone-popup-title"
              className="relative w-full max-w-md rounded-3xl bg-white/95 p-5 shadow-2xl ring-4 ring-pink-100 sm:max-w-lg sm:p-7"
              initial={{ scale: 0.88, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <button
                type="button"
                aria-label="Pop-up'ı kapat"
                onClick={handleClosePopup}
                disabled={isClosingPopup}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-base font-extrabold text-pink-500 shadow-sm ring-2 ring-pink-200 transition hover:scale-105 hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-60 sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-lg"
              >
                ✕
              </button>

              <p
                id="zone-popup-title"
                className="mb-4 mt-2 text-center text-lg font-bold text-violet-800 sm:text-xl"
              >
                Bu bölge neresi?
              </p>

              <div className="relative mx-auto mb-6 aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 to-pink-50 ring-2 ring-violet-100 sm:max-w-[300px]">
                <Image
                  src={`${ASSET_BASE}/${activeZone.file}`}
                  alt={activeZone.label}
                  fill
                  className="object-contain p-2"
                  sizes="300px"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <motion.button
                  type="button"
                  whileHover={popupButtonState.private === "default" ? { scale: 1.02 } : undefined}
                  whileTap={popupButtonState.private === "default" ? { scale: 0.98 } : undefined}
                  onClick={() => handleAnswer(true)}
                  disabled={isClosingPopup}
                  className={`flex-1 rounded-2xl px-4 py-4 text-sm font-bold text-white shadow-lg ring-2 transition sm:text-base ${getAnswerButtonClassName(popupButtonState.private, "private")}`}
                >
                  Burası bana özel! 🔐
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={popupButtonState.public === "default" ? { scale: 1.02 } : undefined}
                  whileTap={popupButtonState.public === "default" ? { scale: 0.98 } : undefined}
                  onClick={() => handleAnswer(false)}
                  disabled={isClosingPopup}
                  className={`flex-1 rounded-2xl px-4 py-4 text-sm font-bold text-white shadow-lg ring-2 transition sm:text-base ${getAnswerButtonClassName(popupButtonState.public, "public")}`}
                >
                  Burası özel değil. 😊
                </motion.button>
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
                  className="object-contain drop-shadow-lg"
                  sizes="176px"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 text-base font-bold leading-relaxed text-violet-900 sm:text-lg"
              >
                Harika bir iş çıkardın! Hem kendi vücudunu hem de arkadaşlarının
                vücut sınırlarını mükemmel öğrendin!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Link
                  href="/egitim/vucudum-bana-ozel/video-2"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 px-8 py-4 text-base font-extrabold text-orange-950 shadow-lg ring-2 ring-amber-200/90 transition hover:scale-[1.03] hover:shadow-xl sm:text-lg"
                >
                  2. Videoya Geç →
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
