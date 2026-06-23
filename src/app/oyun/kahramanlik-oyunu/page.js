"use client";

import confetti from "canvas-confetti";
import { Comfortaa } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const INITIAL_SCENARIO_ID = "kutu1";
const VICTORY_EXIT_ID = "cikis5";

const FLOW_ROWS = [
  ["kutu1"],
  ["kutu2", "kutu3"],
  ["kutu4", "kutu5", "kutu6", "kutu7"],
  [
    "cikis1",
    "cikis2",
    "cikis3",
    "cikis4",
    "cikis5",
    "cikis6",
    "cikis7",
    "cikis8",
  ],
];

const SCENARIOS = {
  kutu1: {
    id: "kutu1",
    label: "Senaryo 1",
    text: "Tanımadığın biriyle bir yerde yalnızsın ve seninle oyun oynamak istediğini, ama bu oyunu kimseye söyleyemeyeceğinden bahsediyor. Eğer kimseye söylemez ve benimle bu oyunu oynarsan sana ödül vereceğim diyor. Bu durum karşısında ne yapmalısın?",
    audioSrc: "/sounds/senaryo-1.m4a",
    options: [
      {
        label: "Kimseye söylemeyeceğimi söyler, onunla oyun oynarım.",
        next: "kutu2",
      },
      {
        label:
          "Tanımadığımız kişilerle ailemiz olmadan iletişim kurmamalıyız. Bunu bildiğim için teklifini reddeder ve oradan hemen uzaklaşmaya çalışırım.",
        next: "kutu3",
      },
    ],
  },
  kutu2: {
    id: "kutu2",
    label: "Senaryo 2",
    text: 'Oynamaya başlarken o kişi sana şöyle dedi: "Oyunumuz şu, ben sana dokunacağım, sen de bana dokunacaksın. Oyunumuzu bağırmadan, ağlamadan bitirirsek sana istediğin oyuncağı alacağım." Bu durumda ne yaparsın?',
    audioSrc: "/sounds/senaryo-2.m4a",
    options: [
      {
        label: "İstediğim oyuncağı almak için kabul ederim.",
        next: "kutu4",
      },
      {
        label:
          'Eyvah, bu durum beni çok huzursuz etti! Vücudum bana özeldir! Hemen "HAYIR!" diye bağırıp kaçmalıyım!',
        next: "kutu5",
      },
    ],
  },
  kutu3: {
    id: "kutu3",
    label: "Senaryo 3",
    text: "Harikasın! Teklifi reddettin ve oradan uzaklaşmaya başladın. Peki şimdi bu durumu ne yapmalısın?",
    audioSrc: "/sounds/senaryo-3.m4a",
    options: [
      {
        label:
          "Hemen anneme, babama veya öğretmenime gider, yaşadığım her şeyi anlatırım.",
        next: "kutu6",
      },
      {
        label: "Kimseye söylemem, içimde saklarım.",
        next: "kutu7",
      },
    ],
  },
  kutu4: {
    id: "kutu4",
    label: "Senaryo 4",
    text: "Kötü niyetli kişiler bizi kandırmak için oyuncak veya ödül sözü verebilirler. Ama vücudumuz bize özeldir ve kimse bizden bunu saklamamızı isteyemez! Şimdi ne yaparsın?",
    audioSrc: "/sounds/senaryo-4.m4a",
    options: [
      {
        label: "Yine de oyunu oynamaya devam ederim.",
        next: "cikis1",
      },
      {
        label: "Korksam da sessiz kalırım.",
        next: "cikis2",
      },
    ],
  },
  kutu5: {
    id: "kutu5",
    label: "Senaryo 5",
    text: "Çok iyi yaptın, kaçtın! Ama bu tür bir olayı kimseye anlatmazsan kimse sana yardım edemez. Şimdi ne yapmalısın?",
    audioSrc: null,
    options: [
      {
        label: "Güvendiğim bir yetişkine hemen anlatırım.",
        next: "cikis3",
      },
      {
        label: "Kimseye söylemem, içimde saklarım.",
        next: "cikis4",
      },
    ],
  },
  kutu6: {
    id: "kutu6",
    label: "Senaryo 6",
    text: "Güvendiğin bir yetişkine anlatmaya karar verdin. Ona giderken kalbin hızlı hızlı atıyor. Ne yaparsın?",
    audioSrc: "/sounds/senaryo-6.m4a",
    options: [
      {
        label:
          "Anneme, babama veya öğretmenime gidip yaşadığım her şeyi anlatırım.",
        next: "cikis5",
      },
      {
        label: "Son anda vazgeçer, konuşmam.",
        next: "cikis6",
      },
    ],
  },
  kutu7: {
    id: "kutu7",
    label: "Senaryo 7",
    text: "Kötü bir durumu içimizde saklamak bizi daha da üzebilir. Güvendiğimiz bir yetişkine anlatmak kahramanlıktır! Şimdi ne yaparsın?",
    audioSrc: null,
    options: [
      {
        label: "Yine de kimseye söylemem.",
        next: "cikis7",
      },
      {
        label: "Belki sonra anlatırım, şimdilik beklerim.",
        next: "cikis8",
      },
    ],
  },
};

const EXIT_LABELS = {
  cikis1: "1. Çıkış",
  cikis2: "2. Çıkış",
  cikis3: "3. Çıkış",
  cikis4: "4. Çıkış",
  cikis5: "5. Çıkış",
  cikis6: "6. Çıkış",
  cikis7: "7. Çıkış",
  cikis8: "8. Çıkış",
};

function isScenarioId(id) {
  return id.startsWith("kutu");
}

function fireVictoryConfetti() {
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

function FlowchartSkeleton() {
  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-4 px-2 py-6">
      {[1, 2, 4, 8].map((count, rowIndex) => (
        <div
          key={`skeleton-row-${rowIndex}`}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {Array.from({ length: count }, (_, index) => (
            <div
              key={`skeleton-${rowIndex}-${index}`}
              className={`animate-pulse rounded-2xl bg-white/50 ring-2 ring-sky-100 ${
                rowIndex === 3 ? "h-12 w-16 sm:h-14 sm:w-20" : "h-14 w-28 sm:h-16 sm:w-32"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkyBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-[#dbeafe] to-sky-200" />
      <div className="absolute left-[6%] top-[8%] h-24 w-40 rounded-full bg-white/75 blur-sm sm:h-28 sm:w-48" />
      <div className="absolute right-[10%] top-[12%] h-20 w-36 rounded-full bg-white/65 blur-md sm:h-24 sm:w-44" />
      <div className="absolute bottom-[20%] left-[14%] h-16 w-28 rounded-full bg-white/55 blur-sm" />
      <div className="absolute bottom-[28%] right-[16%] h-20 w-36 rounded-full bg-white/50 blur-md" />
      <div className="absolute left-[42%] top-[22%] h-14 w-24 rounded-full bg-white/45 blur-sm" />
    </div>
  );
}

function FlowNode({
  nodeId,
  isUnlocked,
  isActive,
  isExit,
  isFailed,
  isVictory,
  onClick,
}) {
  const label = isExit
    ? EXIT_LABELS[nodeId]
    : SCENARIOS[nodeId]?.label ?? nodeId;

  let className =
    "rounded-2xl px-3 py-2 text-center text-xs font-extrabold shadow-md ring-2 transition-all duration-300 sm:px-4 sm:py-3 sm:text-sm ";

  if (!isUnlocked) {
    className +=
      "cursor-default bg-sky-200/40 text-sky-400/70 ring-sky-100/60 opacity-40";
  } else if (isFailed) {
    className +=
      "bg-rose-400 text-white ring-rose-300 scale-105 shadow-lg shadow-rose-200/70";
  } else if (isVictory) {
    className +=
      "bg-emerald-400 text-white ring-emerald-300 scale-105 shadow-lg shadow-emerald-200/70";
  } else if (isActive) {
    className +=
      "cursor-pointer bg-gradient-to-br from-sky-400 to-blue-500 text-white ring-sky-200 hover:scale-105 hover:shadow-lg";
  } else {
    className +=
      "cursor-pointer bg-gradient-to-br from-sky-300/90 to-blue-400/90 text-white ring-sky-100 hover:scale-[1.03]";
  }

  const sizeClass = isExit
    ? "min-w-[4.5rem] sm:min-w-[5.5rem]"
    : "min-w-[7rem] sm:min-w-[8.5rem]";

  return (
    <motion.button
      type="button"
      disabled={!isUnlocked || isExit}
      onClick={onClick}
      initial={false}
      animate={
        isUnlocked
          ? { opacity: 1, scale: isActive ? 1.04 : 1 }
          : { opacity: 0.4, scale: 0.96 }
      }
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`${className} ${sizeClass}`}
    >
      <span>{label}</span>
      {nodeId === VICTORY_EXIT_ID && isVictory && (
        <span className="mt-1 block text-base" aria-hidden>
          🦸‍♂️✨
        </span>
      )}
    </motion.button>
  );
}

function ScenarioModal({ scenario, isPlayingAudio, onClose, onPlayAudio, onChoose }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-blue-950/20 px-3 backdrop-blur-sm sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl rounded-3xl bg-white/95 p-5 shadow-2xl ring-4 ring-sky-100 sm:p-7"
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <button
          type="button"
          aria-label="Modalı kapat"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-base font-extrabold text-blue-600 ring-2 ring-sky-200 transition hover:bg-sky-200 sm:right-4 sm:top-4"
        >
          ✕
        </button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative mx-auto h-28 w-28 shrink-0 sm:mx-0 sm:h-32 sm:w-32">
            <Image
              src="/bulut.png"
              alt="Bulut rehberi"
              fill
              className="object-contain drop-shadow-lg"
              sizes="128px"
            />
          </div>

          <div className="flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-base font-bold leading-relaxed text-blue-950 sm:text-lg">
                {scenario.text}
              </p>
              <button
                type="button"
                onClick={() => onPlayAudio(scenario.audioSrc)}
                className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-gradient-to-r from-sky-300 to-blue-300 px-4 py-2.5 text-sm font-extrabold text-blue-950 shadow-md ring-2 ring-sky-200 transition hover:scale-105"
              >
                {isPlayingAudio ? "Dinleniyor… 🔊" : "Sesi Dinle 🔊"}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {scenario.options.map((option) => (
                <motion.button
                  key={option.label}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onChoose(option.next)}
                  className="rounded-2xl bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-4 text-left text-sm font-bold text-blue-950 shadow-md ring-2 ring-sky-200 transition hover:from-sky-200 hover:to-blue-200 sm:text-base"
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FailResetModal({ onReset }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/25 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="flex w-full max-w-lg flex-col items-center rounded-3xl bg-white/95 px-6 py-8 text-center shadow-2xl ring-4 ring-rose-100 sm:px-8"
        initial={{ scale: 0.9, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
      >
        <div className="relative mb-5 h-32 w-32 sm:h-36 sm:w-36">
          <Image
            src="/bulut.png"
            alt="Bulut rehberi"
            fill
            className="object-contain drop-shadow-lg"
            sizes="144px"
          />
        </div>
        <p className="mb-6 text-base font-bold leading-relaxed text-blue-950 sm:text-lg">
          Bu yol güvenli değildi. Merak etme, zamanda geri gidip kahraman gibi
          doğru seçimleri yapabilirsin! 🕒💙
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-300 via-sky-300 to-blue-300 px-8 py-4 text-base font-extrabold text-blue-950 shadow-lg ring-2 ring-rose-200 transition hover:scale-[1.02]"
        >
          🕒 Zamanda Geri Git!
        </button>
      </motion.div>
    </motion.div>
  );
}

function VictoryModal({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/20 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative flex w-full max-w-lg flex-col items-center rounded-3xl bg-white/95 px-6 py-8 text-center shadow-2xl ring-4 ring-emerald-100 sm:px-8"
        initial={{ scale: 0.9, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
      >
        <button
          type="button"
          aria-label="Pop-up'ı kapat"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-base font-extrabold text-blue-600 ring-2 ring-sky-200 transition hover:scale-105 hover:bg-sky-200 sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-lg"
        >
          ✕
        </button>
        <div className="relative mb-5 h-32 w-32 sm:h-36 sm:w-36">
          <Image
            src="/bulut.png"
            alt="Bulut kahramanı"
            fill
            className="object-contain drop-shadow-lg"
            sizes="144px"
          />
          <span className="absolute -right-1 -top-1 text-2xl" aria-hidden>
            🦸
          </span>
        </div>
        <p className="mb-6 text-base font-bold leading-relaxed text-blue-950 sm:text-lg">
          Tebrikler Gerçek Kahraman! 🦸‍♂️✨ Kendini, sınırlarını ve sesini nasıl
          koruyacağını harika bir şekilde öğrendin! Artık sen kendi kahramanınsın!
          🛡️💙
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500 px-8 py-4 text-base font-extrabold text-white shadow-lg ring-2 ring-emerald-200 transition hover:scale-[1.02] sm:text-lg"
        >
          Ana Panele Dön 🎈
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function KahramanlikOyunuPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState(
    () => new Set([INITIAL_SCENARIO_ID])
  );
  const [activeScenarioId, setActiveScenarioId] = useState(INITIAL_SCENARIO_ID);
  const [reachedExitId, setReachedExitId] = useState(null);
  const [failedExitId, setFailedExitId] = useState(null);
  const [modalScenarioId, setModalScenarioId] = useState(null);
  const [gamePhase, setGamePhase] = useState("playing");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  const modalScenario = modalScenarioId ? SCENARIOS[modalScenarioId] : null;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gamePhase === "victory" && hasMounted) {
      fireVictoryConfetti();
    }
  }, [gamePhase, hasMounted]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  const resetGame = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setUnlockedIds(new Set([INITIAL_SCENARIO_ID]));
    setActiveScenarioId(INITIAL_SCENARIO_ID);
    setReachedExitId(null);
    setFailedExitId(null);
    setModalScenarioId(null);
    setGamePhase("playing");
    setIsPlayingAudio(false);
  }, []);

  const handlePlayAudio = useCallback((src) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(src);
    audioRef.current = audio;

    audio.addEventListener("ended", () => setIsPlayingAudio(false));
    audio.addEventListener("pause", () => setIsPlayingAudio(false));

    setIsPlayingAudio(true);
    audio.play().catch(() => setIsPlayingAudio(false));
  }, []);

  const handleExitReached = useCallback((exitId) => {
    setReachedExitId(exitId);
    setModalScenarioId(null);

    if (exitId === VICTORY_EXIT_ID) {
      setGamePhase("victory");
      return;
    }

    setFailedExitId(exitId);
    setGamePhase("fail");
  }, []);

  const handleChooseOption = useCallback(
    (nextId) => {
      stopAudio();
      setModalScenarioId(null);

      if (isScenarioId(nextId)) {
        setUnlockedIds((prev) => {
          const next = new Set(prev);
          next.add(nextId);
          return next;
        });
        setActiveScenarioId(nextId);
        return;
      }

      setUnlockedIds((prev) => {
        const next = new Set(prev);
        next.add(nextId);
        return next;
      });
      handleExitReached(nextId);
    },
    [handleExitReached, stopAudio]
  );

  const handleNodeClick = useCallback(
    (nodeId) => {
      if (!isScenarioId(nodeId)) return;
      if (!unlockedIds.has(nodeId)) return;
      if (gamePhase !== "playing") return;
      if (nodeId !== activeScenarioId) return;
      setModalScenarioId(nodeId);

      // Popup açılınca sesini otomatik oynat
      const src = SCENARIOS[nodeId]?.audioSrc;
      if (src) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const audio = new Audio(src);
        audioRef.current = audio;
        audio.addEventListener("ended", () => setIsPlayingAudio(false));
        audio.addEventListener("pause", () => setIsPlayingAudio(false));
        setIsPlayingAudio(true);
        audio.play().catch(() => setIsPlayingAudio(false));
      }
    },
    [activeScenarioId, gamePhase, unlockedIds]
  );

  const handleDismissVictory = useCallback(() => {
    setGamePhase("completed");
  }, []);

  const rowGaps = useMemo(
    () => ["gap-0", "gap-8 sm:gap-16", "gap-3 sm:gap-5", "gap-2 sm:gap-3"],
    []
  );

  return (
    <main
      className={`${comfortaa.className} relative flex h-screen flex-col overflow-hidden`}
    >
      <SkyBackground />

      <header className="relative z-10 flex h-16 shrink-0 items-center px-4 sm:h-[4.5rem] sm:px-8">
        <Link
          href="/egitim/yardim-istemek"
          className="shrink-0 rounded-full bg-white/85 px-4 py-2 text-sm font-extrabold text-blue-900 shadow-md ring-2 ring-sky-200 transition hover:bg-white sm:px-5 sm:py-2.5 sm:text-base"
        >
          ← Videoya Dön
        </Link>
        <p className="pointer-events-none absolute inset-x-0 text-center text-sm font-extrabold text-blue-950 sm:text-base md:text-lg">
          Kendi Maceranı Seç
        </p>
      </header>

      <section className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 sm:px-4">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center py-4">
          {!hasMounted ? (
            <FlowchartSkeleton />
          ) : (
            <div className="flex w-full flex-col items-center gap-5 sm:gap-7">
              {FLOW_ROWS.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className={`flex flex-wrap items-center justify-center ${rowGaps[rowIndex]}`}
                >
                  {row.map((nodeId) => {
                    const isExit = !isScenarioId(nodeId);
                    const isUnlocked = unlockedIds.has(nodeId);
                    const isActive =
                      isScenarioId(nodeId) &&
                      nodeId === activeScenarioId &&
                      gamePhase === "playing";
                    const isFailed = failedExitId === nodeId;
                    const isVictory =
                      reachedExitId === VICTORY_EXIT_ID &&
                      nodeId === VICTORY_EXIT_ID;

                    return (
                      <FlowNode
                        key={nodeId}
                        nodeId={nodeId}
                        isUnlocked={isUnlocked}
                        isActive={isActive}
                        isExit={isExit}
                        isFailed={isFailed}
                        isVictory={isVictory}
                        onClick={() => handleNodeClick(nodeId)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {modalScenario && gamePhase === "playing" && (
          <ScenarioModal
            key={modalScenario.id}
            scenario={modalScenario}
            isPlayingAudio={isPlayingAudio}
            onClose={() => { stopAudio(); setModalScenarioId(null); }}
            onPlayAudio={handlePlayAudio}
            onChoose={handleChooseOption}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gamePhase === "fail" && <FailResetModal onReset={resetGame} />}
      </AnimatePresence>

      <AnimatePresence>
        {gamePhase === "victory" && (
          <VictoryModal onClose={handleDismissVictory} />
        )}
      </AnimatePresence>
    </main>
  );
}
