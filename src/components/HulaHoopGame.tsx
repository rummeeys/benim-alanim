"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
} from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const HOOP_DIAMETER_PX = 300;
const HOOP_RADIUS_PX = HOOP_DIAMETER_PX / 2;
/** Süzülen kart boyutu (çarpışma merkezi) */
const TOKEN_SIZE_PX = 96;
const TOKEN_RADIUS_PX = TOKEN_SIZE_PX / 2;
const TOTAL_ROUNDS = 20;
const MAX_ON_SCREEN = 4;
const APPROACH_SECONDS = 6.2;
const RETREAT_SECONDS = 4.8;
const SPAWN_GAP_MIN_MS = 520;
const SPAWN_GAP_MAX_MS = 980;
const HOOP_ALERT_EXTEND_MS = 4200;
const MAX_SCORE = 100;
/** Çembere girişte güvenli +5 / güvensiz -5 */
const HOOP_ENTRY_POINTS = MAX_SCORE / TOTAL_ROUNDS;
const SCORE_SUCCESS_THRESHOLD = 70;

function fireCelebrationConfetti() {
  const defaults = { origin: { y: 0.55 } };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(220 * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.85 });
  fire(0.1, { spread: 120, startVelocity: 28, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 48 });
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(MAX_SCORE, value));
}

type FigureKind = "red" | "green";

type FigurePhase = "in" | "out";

type GamePhase = "playing" | "complete";

interface GameItem {
  kind: FigureKind;
  label: string;
  emoji: string;
}

const GREEN_ITEMS: GameItem[] = [
  { kind: "green", label: "Anne", emoji: "👩" },
  { kind: "green", label: "Baba", emoji: "👨" },
  { kind: "green", label: "Öğretmen", emoji: "👩‍🏫" },
  { kind: "green", label: "Kendi yatağım", emoji: "🛏️" },
  { kind: "green", label: "Çocuk odası", emoji: "🧸" },
  { kind: "green", label: "Okul çantası", emoji: "🎒" },
  { kind: "green", label: "Okul", emoji: "🏫" },
  { kind: "green", label: "Ev", emoji: "🏠" },
  { kind: "green", label: "Güvenilir arkadaş", emoji: "🤝" },
  { kind: "green", label: "Aile büyüğü", emoji: "👵" },
];

const RED_ITEMS: GameItem[] = [
  { kind: "red", label: "Tanınmayan yabancı", emoji: "👤" },
  { kind: "red", label: "Kesici alet", emoji: "✂️" },
  { kind: "red", label: "İlaç kutusu", emoji: "💊" },
  { kind: "red", label: "Başkasının özel alanı", emoji: "🚫" },
  { kind: "red", label: "Tehlikeli sokak", emoji: "🌃" },
  { kind: "red", label: "Bilmediğim site", emoji: "🔗" },
  { kind: "red", label: "Şüpheli hediye", emoji: "🎁" },
  { kind: "red", label: "Sokaktaki yabancı hayvan", emoji: "🐕" },
  { kind: "red", label: "Tanımadığım mesaj", emoji: "💬" },
  { kind: "red", label: "Issız / karanlık yer", emoji: "🌑" },
];

function shuffle<T>(array: T[]): T[] {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildDeck(): GameItem[] {
  return shuffle([...GREEN_ITEMS, ...RED_ITEMS]);
}

/**
 * Figür merkezi ile oyun alanı merkezi arasındaki mesafe (px).
 * Hula-hoop çapı HOOP_DIAMETER_PX → yarıçap HOOP_RADIUS_PX ile uyumlu.
 */
function distanceFromCenter(
  figureCenterX: number,
  figureCenterY: number,
  arenaCenterX: number,
  arenaCenterY: number
): number {
  const dx = figureCenterX - arenaCenterX;
  const dy = figureCenterY - arenaCenterY;
  return Math.sqrt(dx * dx + dy * dy);
}

function figureCenterAtProgress(
  f: { startX: number; startY: number; progress: number },
  arenaCenterX: number,
  arenaCenterY: number
): { x: number; y: number } {
  const t = f.progress;
  return {
    x: f.startX + (arenaCenterX - f.startX) * t,
    y: f.startY + (arenaCenterY - f.startY) * t,
  };
}

/**
 * Çember diski: figür merkezi ile saha merkezi arası mesafe ≤ yarıçap.
 * (300px çaplı çember = HOOP_RADIUS_PX)
 */
function checkCollision(
  figureCenterX: number,
  figureCenterY: number,
  arenaCenterX: number,
  arenaCenterY: number
): boolean {
  return (
    distanceFromCenter(
      figureCenterX,
      figureCenterY,
      arenaCenterX,
      arenaCenterY
    ) <= HOOP_RADIUS_PX
  );
}

interface Figure {
  id: string;
  item: GameItem;
  startX: number;
  startY: number;
  arenaW: number;
  arenaH: number;
  progress: number;
  phase: FigurePhase;
  /** Güvensiz öğe çember diskinin içindeyken görsel kırmızı */
  insideHoop: boolean;
  /** Güvensiz: çember içine girdi (görsel uyarı; puan düşmez) */
  entryPenaltyApplied: boolean;
  /** Güvenli: çembere girince doğru hamle puanı verildi mi */
  safeBonusApplied: boolean;
  /** Güvensiz: çember dışındayken tıklayıp uzaklaştırınca doğru hamle puanı */
  defenseBonusApplied: boolean;
}

function randomEdgePointVisible(
  width: number,
  height: number
): { x: number; y: number } {
  const edge = Math.floor(Math.random() * 4);
  const inset = TOKEN_RADIUS_PX + 8;
  const xMin = inset;
  const xMax = Math.max(inset, width - inset);
  const yMin = inset;
  const yMax = Math.max(inset, height - inset);

  switch (edge) {
    case 0:
      return { x: xMin + Math.random() * (xMax - xMin), y: yMin };
    case 1:
      return { x: xMax, y: yMin + Math.random() * (yMax - yMin) };
    case 2:
      return { x: xMin + Math.random() * (xMax - xMin), y: yMax };
    default:
      return { x: xMin, y: yMin + Math.random() * (yMax - yMin) };
  }
}

function readPlayfieldSize(el: HTMLElement | null): { w: number; h: number } {
  if (!el || typeof window === "undefined") {
    return { w: 0, h: 0 };
  }
  const rect = el.getBoundingClientRect();
  let w = Math.round(rect.width) || el.clientWidth || 0;
  let h = Math.round(rect.height) || el.clientHeight || 0;
  if (h < 2) {
    h = Math.round(
      el.parentElement?.getBoundingClientRect().height ||
        window.innerHeight * 0.92
    );
  }
  if (w < 2) {
    w = Math.round(window.innerWidth || 360);
  }
  h = Math.max(h, 240);
  w = Math.max(w, 280);
  return { w, h };
}

function newFigureId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}-${performance.now()}`;
}

function createFigure(
  width: number,
  height: number,
  item: GameItem
): Figure {
  const { x, y } = randomEdgePointVisible(width, height);
  return {
    id: newFigureId(),
    item,
    startX: x,
    startY: y,
    arenaW: width,
    arenaH: height,
    progress: 0,
    phase: "in",
    insideHoop: false,
    entryPenaltyApplied: false,
    safeBonusApplied: false,
    defenseBonusApplied: false,
  };
}

export default function HulaHoopGame() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [figures, setFigures] = useState<Figure[]>([]);
  const [deck, setDeck] = useState<GameItem[]>(() => buildDeck());
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>("playing");
  const [score, setScore] = useState(0);
  const [hoopViolated, setHoopViolated] = useState(false);
  const [hoopAlertActive, setHoopAlertActive] = useState(false);
  const [speech, setSpeech] = useState(false);
  const shakeControls = useAnimationControls();
  const hoopAlertClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnIdxRef = useRef(0);
  const figuresRef = useRef<Figure[]>([]);
  const deckRef = useRef<GameItem[]>(deck);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    figuresRef.current = figures;
  }, [figures]);

  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  const extendHoopAlert = useCallback(() => {
    setHoopViolated(true);
    setHoopAlertActive(true);
    if (hoopAlertClearRef.current) {
      clearTimeout(hoopAlertClearRef.current);
    }
    hoopAlertClearRef.current = window.setTimeout(() => {
      setHoopAlertActive(false);
      setHoopViolated(false);
      hoopAlertClearRef.current = null;
    }, HOOP_ALERT_EXTEND_MS);
  }, []);

  const triggerScreenShake = useCallback(() => {
    void shakeControls
      .start({
        x: [0, -14, 14, -10, 10, -6, 6, 0],
        y: [0, 6, -6, 4, -4, 0],
        transition: { duration: 0.48, ease: "easeInOut" },
      })
      .then(() => {
        shakeControls.set({ x: 0, y: 0 });
      });
  }, [shakeControls]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setSize(readPlayfieldSize(el));
    };

    update();
    const ro = new ResizeObserver(() => {
      update();
    });
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hoopAlertClearRef.current) clearTimeout(hoopAlertClearRef.current);
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (gamePhase !== "playing") return;

    let stopped = false;

    const queueSpawn = () => {
      if (stopped) return;
      const gap =
        SPAWN_GAP_MIN_MS +
        Math.random() * (SPAWN_GAP_MAX_MS - SPAWN_GAP_MIN_MS);

      spawnTimeoutRef.current = window.setTimeout(() => {
        spawnTimeoutRef.current = null;
        if (stopped) return;

        if (spawnIdxRef.current >= TOTAL_ROUNDS) return;

        if (figuresRef.current.length >= MAX_ON_SCREEN) {
          queueSpawn();
          return;
        }

        const item = deckRef.current[spawnIdxRef.current];
        if (!item) return;

        const { w, h } = readPlayfieldSize(containerRef.current);
        if (w < 32 || h < 32) {
          queueSpawn();
          return;
        }

        setFigures((prev) => [
          ...prev,
          createFigure(w, h, item),
        ]);
        spawnIdxRef.current += 1;
        setSpawnedCount(spawnIdxRef.current);

        queueSpawn();
      }, gap);
    };

    queueSpawn();

    return () => {
      stopped = true;
      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
        spawnTimeoutRef.current = null;
      }
    };
  }, [gamePhase, sessionKey]);

  useEffect(() => {
    if (gamePhase !== "playing") return;
    if (spawnedCount < TOTAL_ROUNDS) return;
    if (figures.length > 0) return;
    setGamePhase("complete");
  }, [gamePhase, spawnedCount, figures.length]);

  useEffect(() => {
    if (gamePhase !== "complete") return;
    if (score < SCORE_SUCCESS_THRESHOLD) return;
    fireCelebrationConfetti();
  }, [gamePhase, score]);

  useEffect(() => {
    if (gamePhase !== "playing") return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const rawDt = (now - last) / 1000;
      const dt = Math.min(0.05, rawDt);
      last = now;

      setFigures((prev) => {
        if (prev.length === 0) return prev;

        let newUnsafeEntries = 0;
        let newSafeEntries = 0;

        const next = prev
          .map((f) => {
            const aw = Math.max(1, f.arenaW);
            const ah = Math.max(1, f.arenaH);
            const cx = aw / 2;
            const cy = ah / 2;

            if (f.phase === "in") {
              const np = Math.min(1, f.progress + dt / APPROACH_SECONDS);
              const { x: px, y: py } = figureCenterAtProgress(
                { ...f, progress: np },
                cx,
                cy
              );
              const inside = checkCollision(px, py, cx, cy);

              let insideHoop = f.insideHoop;
              let entryPenaltyApplied = f.entryPenaltyApplied;
              let safeBonusApplied = f.safeBonusApplied;

              if (f.item.kind === "red") {
                if (inside) {
                  insideHoop = true;
                  if (!entryPenaltyApplied) {
                    entryPenaltyApplied = true;
                    newUnsafeEntries += 1;
                  }
                }
              } else {
                if (inside) {
                  insideHoop = true;
                  if (!safeBonusApplied) {
                    safeBonusApplied = true;
                    newSafeEntries += 1;
                  }
                }
              }

              return {
                ...f,
                progress: np,
                insideHoop,
                entryPenaltyApplied,
                safeBonusApplied,
              };
            }

            const np = Math.max(0, f.progress - dt / RETREAT_SECONDS);
            return { ...f, progress: np };
          })
          .filter((f) => {
            if (f.phase === "in" && f.progress >= 1) return false;
            if (f.phase === "out" && f.progress <= 0) return false;
            return true;
          });

        if (newSafeEntries > 0 || newUnsafeEntries > 0) {
          requestAnimationFrame(() => {
            setScore((s) =>
              clampScore(
                s +
                  newSafeEntries * HOOP_ENTRY_POINTS -
                  newUnsafeEntries * HOOP_ENTRY_POINTS
              )
            );
            if (newUnsafeEntries > 0) {
              extendHoopAlert();
              triggerScreenShake();
            }
          });
        }

        return next;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gamePhase, extendHoopAlert, triggerScreenShake]);

  /**
   * Yalnızca tıklanan figürü günceller; diğer tüm öğeler aynı kalır.
   */
  const handleFigureClick = useCallback(
    (figureId: string) => {
      const snapshot = figuresRef.current;
      const target = snapshot.find((f) => f.id === figureId);
      if (!target || target.phase !== "in") return;

      if (target.item.kind === "green") {
        setFigures((prev) =>
          prev.map((f) =>
            f.id === figureId ? { ...f, phase: "out" as const } : f
          )
        );
        return;
      }

      setFigures((prev) =>
        prev.map((f) =>
          f.id === figureId ? { ...f, phase: "out" as const } : f
        )
      );

      setSpeech(true);
      window.setTimeout(() => setSpeech(false), 2400);
    },
    []
  );

  const handleContinueToDashboard = useCallback(() => {
    localStorage.setItem("level2Unlocked", "true");
    localStorage.setItem("studentLevel", "2");

    // Supabase'deki level'ı da güncelle
    const studentId = localStorage.getItem("studentId");
    if (studentId) {
      import("@/lib/supabase").then(({ supabase }) => {
        supabase
          .from("students")
          .update({ level: 2 })
          .eq("id", studentId)
          .then(({ error }) => {
            if (error) console.error("Level 2 sync error:", error);
          });
      });
    }

    router.push("/dashboard");
  }, [router]);

  const restartGame = useCallback(() => {
    if (hoopAlertClearRef.current) {
      clearTimeout(hoopAlertClearRef.current);
      hoopAlertClearRef.current = null;
    }
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
    setDeck(buildDeck());
    setFigures([]);
    spawnIdxRef.current = 0;
    setSpawnedCount(0);
    setScore(0);
    setHoopViolated(false);
    setHoopAlertActive(false);
    setSpeech(false);
    setGamePhase("playing");
    setSessionKey((k) => k + 1);
  }, []);

  const { w: measureW, h: measureH } = readPlayfieldSize(containerRef.current);
  const layoutW = Math.max(1, size.w || measureW);
  const layoutH = Math.max(1, size.h || measureH);

  const roundsLabel = `${Math.min(spawnedCount, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS}`;
  const isHighScore = score >= SCORE_SUCCESS_THRESHOLD;
  const lowScoreMessage =
    "Sınırlarını korumak için biraz daha pratiğe ihtiyacın var gibi görünüyor. Tekrar denemeye ne dersin?";

  return (
    <div
      className="relative flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-visible bg-gradient-to-b from-sky-200 via-sky-100 to-sky-50"
      style={{ height: "100%", minHeight: 0 }}
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-3 top-3 z-[45] shrink-0 rounded-full bg-emerald-300 px-4 py-2 text-xs font-extrabold text-emerald-950 shadow-lg ring-2 ring-emerald-200/90 transition hover:bg-emerald-200 hover:ring-emerald-100 sm:left-4 sm:top-4 sm:px-5 sm:py-2.5 sm:text-sm"
      >
        ← Geri Dön
      </button>

      {/* HUD */}
      <div className="pointer-events-none absolute left-3 right-3 top-14 z-40 flex justify-between gap-2 text-xs font-bold text-slate-800 sm:left-4 sm:right-4 sm:top-[4.25rem] sm:text-sm">
        <span className="rounded-full bg-white/90 px-3 py-1.5 shadow-md ring-1 ring-slate-200/80">
          Öğe: {roundsLabel}
        </span>
        <span className="rounded-full bg-white/90 px-3 py-1.5 shadow-md ring-1 ring-slate-200/80">
          Puan: {score}
        </span>
      </div>

      <motion.div
        ref={containerRef}
        className="relative isolate min-h-[min(85dvh,720px)] w-full min-w-0 flex-1 will-change-transform"
        initial={{ x: 0, y: 0 }}
        animate={shakeControls}
      >
        {/* Hula-hoop — ihlalde kırmızı + belirgin titreme */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ width: HOOP_DIAMETER_PX, height: HOOP_DIAMETER_PX }}
        >
          <motion.div
            className="h-full w-full"
            animate={hoopViolated || hoopAlertActive ? "violation" : "calm"}
            variants={{
              calm: {
                rotate: 0,
                x: 0,
                scale: [1, 1.04, 1],
                transition: {
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              },
              violation: {
                rotate: [0, -8, 8, -8, 8, -5, 5, 0],
                x: [0, -6, 6, -5, 5, -3, 3, 0],
                scale: [1, 1.08, 0.94, 1.05, 1],
                transition: {
                  duration: 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              },
            }}
          >
            <motion.div
              className={`h-full w-full rounded-full border-[6px] ${
                hoopViolated || hoopAlertActive
                  ? "border-red-500 shadow-[0_0_32px_rgba(239,68,68,0.88)]"
                  : "border-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.75)]"
              }`}
            />
          </motion.div>
        </div>

        {/* Süzülen öğeler — z-50: arka plan / çember üstünde; overflow ile kırpılmaması için kenarda doğarlar */}
        {figures.length > 0 &&
          figures.map((f) => {
            const aw = Math.max(1, f.arenaW || layoutW);
            const ah = Math.max(1, f.arenaH || layoutH);
            const fcx = aw / 2;
            const fcy = ah / 2;
            const t = f.progress;
            const x = f.startX + (fcx - f.startX) * t;
            const y = f.startY + (fcy - f.startY) * t;
            const isRed = f.item.kind === "red";
            const showUnsafeInside = isRed && f.insideHoop;

            return (
              <motion.button
                key={f.id}
                type="button"
                data-safe={isRed ? "false" : "true"}
                aria-label={`${isRed ? "Güvenli olmayan" : "Güvenli"}: ${f.item.label}`}
                className={`absolute z-50 flex touch-manipulation flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1.5 py-1 text-center shadow-md outline-none ring-offset-2 transition-[transform,colors] duration-200 focus-visible:ring-2 ${
                  showUnsafeInside
                    ? "cursor-pointer border-red-700 bg-red-200 hover:bg-red-300 hover:scale-[1.04] active:scale-[0.98] focus-visible:ring-red-500"
                    : "cursor-pointer border-amber-300/90 bg-[#FEF9C7] hover:scale-[1.04] active:scale-[0.98] focus-visible:ring-amber-400"
                }`}
                style={{
                  width: TOKEN_SIZE_PX,
                  minHeight: TOKEN_SIZE_PX,
                  left: x - TOKEN_RADIUS_PX,
                  top: y - TOKEN_RADIUS_PX,
                  pointerEvents: "auto",
                }}
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFigureClick(f.id);
                }}
              >
                <span className="text-2xl leading-none sm:text-[1.65rem]">
                  {f.item.emoji}
                </span>
                <span
                  className={`line-clamp-2 max-w-[5.5rem] text-[9px] font-extrabold leading-tight sm:max-w-[6rem] sm:text-[10px] ${
                    showUnsafeInside ? "text-red-950" : "text-slate-900"
                  }`}
                >
                  {f.item.label}
                </span>
              </motion.button>
            );
          })}

        {/* Merkez karakter — tıklamaları figürlere iletmek için pointer-events yok */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
          <Image
            src="/bulut.png"
            alt="Bulut"
            width={168}
            height={140}
            className="h-auto w-[168px] max-w-none drop-shadow-lg"
            priority
          />

          <AnimatePresence>
            {speech && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="absolute -top-[76px] left-1/2 w-[210px] -translate-x-1/2 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-md"
              >
                <span className="block leading-snug">Burası benim alanım!</span>
                <span className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-slate-300 bg-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {gamePhase === "complete" && (
          <motion.div
            key="win-overlay"
            role="dialog"
            aria-modal
            aria-labelledby="hula-end-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border-2 p-6 text-center shadow-2xl sm:p-8 ${
                isHighScore
                  ? "border-emerald-200 bg-gradient-to-b from-white to-emerald-50/95 ring-4 ring-emerald-100/80"
                  : "border-amber-200 bg-gradient-to-b from-white to-amber-50/95 ring-4 ring-amber-100/90"
              }`}
            >
              <p
                id="hula-end-title"
                className={`text-lg font-extrabold leading-snug sm:text-xl ${
                  isHighScore ? "text-emerald-950" : "text-amber-950"
                }`}
              >
                {isHighScore
                  ? "2. seviyeye geçmeye hak kazandın!🥳"
                  : lowScoreMessage}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Puanın:{" "}
                <span
                  className={
                    isHighScore ? "font-extrabold text-emerald-700" : "font-extrabold text-amber-800"
                  }
                >
                  {score}
                </span>{" "}
                / {MAX_SCORE}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {isHighScore ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-full bg-purple-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg ring-2 ring-purple-300/80 transition hover:bg-purple-500 sm:px-8"
                    onClick={handleContinueToDashboard}
                  >
                    Panele Dön ve Devam Et
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-full bg-purple-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg ring-2 ring-purple-300/80 transition hover:bg-purple-500"
                      onClick={restartGame}
                    >
                      Başa Dön
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href="/egitim/guvenli-alan"
                        className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg ring-2 ring-sky-200 transition hover:bg-sky-400 sm:w-auto"
                      >
                        Videoyu Tekrar İzle
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
