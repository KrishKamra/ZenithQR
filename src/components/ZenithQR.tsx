import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
import { QRCodeSVG } from "qrcode.react";
import { Mic, ShieldCheck, ShieldAlert, ShieldX, Cpu, Activity, Zap } from "lucide-react";

/* ============================================================================
 * ZenithQR — Silicon Minimalism diagnostic suite
 * Local-first · NPU-accelerated · Zero-cloud
 * ========================================================================== */

// ---- Named constants (no magic numbers) ------------------------------------
const FIDELITY_WARN_THRESHOLD = 60;
const FIDELITY_MAX = 100;
const GAUGE_RADIUS = 70;
const GAUGE_STROKE = 10;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

const SPARK_POINTS = 32;
const SPARK_WIDTH = 240;
const SPARK_HEIGHT = 56;

const SCAN_DURATION_S = 2.6;
const BEACON_PULSE_S = 1.8;
const FAB_WAVE_RINGS = 4;
const FAB_WAVE_DURATION_S = 1.4;

const COLOR_VIOLET = "#8b5cf6";
const COLOR_AMBER = "#f59e0b";
const COLOR_LIME = "#bef264";
const COLOR_SLATE_DEEP = "#0f172a";

// ---- Public Props ----------------------------------------------------------
export interface ZenithQRProps {
  qualityScore: number; // 0..100
  latencyMs: number;
  safetyStatus: "verified" | "blocked" | "warning";
  qrData: string;
}

// ---- Helpers ---------------------------------------------------------------
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const fidelityColor = (score: number) =>
  score < FIDELITY_WARN_THRESHOLD ? COLOR_AMBER : COLOR_LIME;

const formatLatency = (ms: number) => `${ms.toFixed(2)}ms`;

// ---- Lenis smooth scroll hook ---------------------------------------------
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });
    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}

// ---- Tilt card (3D cursor-driven) -----------------------------------------
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  intensity?: number;
}

function TiltCard({
  children,
  className = "",
  delay = 0,
  intensity = 8,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 20 });
  const sy = useSpring(y, { stiffness: 180, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-intensity, intensity]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 28, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1200,
        boxShadow:
          "0 20px 60px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)",
      }}
      className={
        "relative rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl " +
        className
      }
    >
      {children}
    </motion.div>
  );
}

// ---- Scanner Hub -----------------------------------------------------------
interface ScannerHubProps {
  qrData: string;
}

function ScannerHub({ qrData }: ScannerHubProps) {
  return (
    <TiltCard delay={0.1} className="p-8 md:p-10">
      <div className="flex items-center justify-between mb-6" style={{ transform: "translateZ(20px)" }}>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-lime-cyber shadow-[0_0_10px_#bef264]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">
            Scanner Hub · NPU
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
          ZNX-01
        </span>
      </div>

      <div
        className="relative mx-auto w-fit rounded-xl p-6 bg-white"
        style={{
          transform: "translateZ(40px)",
          boxShadow:
            "0 30px 80px -30px rgba(139,92,246,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <QRCodeSVG
          value={qrData}
          size={224}
          bgColor="#ffffff"
          fgColor={COLOR_SLATE_DEEP}
          level="H"
          aria-label="Generated QR code"
        />

        {/* Scanning laser */}
        <div
          className="pointer-events-none absolute inset-6 overflow-hidden rounded"
          aria-hidden="true"
        >
          <motion.div
            initial={{ y: "-10%" }}
            animate={{ y: "110%" }}
            transition={{
              duration: SCAN_DURATION_S,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
            className="absolute left-0 right-0 h-0.75"
            style={{
              background: `linear-gradient(90deg, transparent, ${COLOR_VIOLET}, transparent)`,
              filter: `blur(1px) drop-shadow(0 0 8px ${COLOR_VIOLET})`,
            }}
          />
          <motion.div
            initial={{ y: "-15%" }}
            animate={{ y: "115%" }}
            transition={{
              duration: SCAN_DURATION_S,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
            className="absolute left-0 right-0 h-16"
            style={{
              background: `linear-gradient(180deg, transparent, ${COLOR_VIOLET}33, transparent)`,
              filter: "blur(6px)",
            }}
          />
        </div>

        {/* Corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            className={
              "absolute h-4 w-4 border-violet-neon " +
              (pos === "tl"
                ? "top-2 left-2 border-t-2 border-l-2"
                : pos === "tr"
                ? "top-2 right-2 border-t-2 border-r-2"
                : pos === "bl"
                ? "bottom-2 left-2 border-b-2 border-l-2"
                : "bottom-2 right-2 border-b-2 border-r-2")
            }
            style={{ filter: `drop-shadow(0 0 4px ${COLOR_VIOLET})` }}
          />
        ))}
      </div>

      <div
        className="mt-6 flex items-center justify-between font-mono text-[11px] text-slate-400"
        style={{ transform: "translateZ(20px)" }}
      >
        <span className="truncate max-w-[60%]" title={qrData}>
          payload://{qrData.slice(0, 28)}
          {qrData.length > 28 ? "…" : ""}
        </span>
        <span className="text-lime-cyber">● live</span>
      </div>
    </TiltCard>
  );
}

// ---- Fidelity Gauge --------------------------------------------------------
interface FidelityGaugeProps {
  score: number;
}

function FidelityGauge({ score }: FidelityGaugeProps) {
  const safe = clamp(score, 0, FIDELITY_MAX);
  const ratio = safe / FIDELITY_MAX;
  const color = fidelityColor(safe);

  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: 160, height: 160 }}>
        <svg
          width={160}
          height={160}
          viewBox="0 0 160 160"
          aria-label={`Fidelity score ${safe.toFixed(1)} percent`}
          role="img"
        >
          <defs>
            <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={80}
            cy={80}
            r={GAUGE_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={GAUGE_STROKE}
          />
          <motion.circle
            cx={80}
            cy={80}
            r={GAUGE_RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={GAUGE_STROKE}
            strokeLinecap="round"
            strokeDasharray={GAUGE_CIRCUMFERENCE}
            initial={{ strokeDashoffset: GAUGE_CIRCUMFERENCE, pathLength: 0 }}
            animate={{
              strokeDashoffset: GAUGE_CIRCUMFERENCE * (1 - ratio),
              pathLength: ratio,
            }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            transform="rotate(-90 80 80)"
            filter="url(#gaugeGlow)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono text-3xl font-semibold tabular-nums"
            style={{ color, textShadow: `0 0 12px ${color}66` }}
          >
            {safe.toFixed(1)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500 mt-1">
            Fidelity %
          </span>
        </div>
      </div>
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2">
          Decode Quality
        </div>
        <div className="text-slate-200 text-sm leading-snug">
          {safe < FIDELITY_WARN_THRESHOLD
            ? "Sub-threshold confidence. Recommend re-scan."
            : "Optimal fidelity. Decode confirmed."}
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1">
          <Cpu size={12} className="text-slate-400" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            NPU · local
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Safety Beacon ---------------------------------------------------------
interface SafetyBeaconProps {
  status: ZenithQRProps["safetyStatus"];
}

function SafetyBeacon({ status }: SafetyBeaconProps) {
  const cfg = useMemo(() => {
    switch (status) {
      case "verified":
        return {
          color: COLOR_LIME,
          label: "Verified",
          desc: "Signature chain intact.",
          Icon: ShieldCheck,
        };
      case "blocked":
        return {
          color: "#ef4444",
          label: "Blocked",
          desc: "Malicious payload rejected.",
          Icon: ShieldX,
        };
      case "warning":
      default:
        return {
          color: COLOR_AMBER,
          label: "Warning",
          desc: "Unverified origin detected.",
          Icon: ShieldAlert,
        };
    }
  }, [status]);

  return (
    <div className="flex items-center gap-5">
      <div className="relative grid place-items-center" style={{ width: 96, height: 96 }}>
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              `0 0 0 0 ${cfg.color}66, 0 0 20px 4px ${cfg.color}44 inset`,
              `0 0 30px 10px ${cfg.color}11, 0 0 30px 8px ${cfg.color}66 inset`,
              `0 0 0 0 ${cfg.color}66, 0 0 20px 4px ${cfg.color}44 inset`,
            ],
          }}
          transition={{ duration: BEACON_PULSE_S, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="relative h-14 w-14 rounded-full grid place-items-center"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${cfg.color}cc, ${cfg.color}33 60%, transparent 80%)`,
            boxShadow: `0 0 20px ${cfg.color}88, inset 0 0 12px ${cfg.color}66`,
          }}
        >
          <cfg.Icon size={22} className="text-slate-900" />
        </div>
      </div>

      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1">
          Safety Beacon
        </div>
        <div
          className="font-mono text-lg font-semibold"
          style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.color}55` }}
        >
          {cfg.label}
        </div>
        <div className="text-slate-300 text-xs mt-0.5">{cfg.desc}</div>

        <AnimatePresence>
          {status === "warning" && (
            <motion.button
              key="bypass"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-300 hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-violet-500"
              aria-label="Manual bypass safety override"
            >
              <Zap size={11} />
              Manual Bypass
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- Latency Telemetry + Sparkline ----------------------------------------
interface LatencyPanelProps {
  latencyMs: number;
}

function LatencyPanel({ latencyMs }: LatencyPanelProps) {
  const points = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < SPARK_POINTS; i++) {
      const base = Math.sin(i * 0.45) * 0.3 + 0.5;
      const noise = Math.random() * 0.25;
      arr.push(clamp(base + noise, 0.05, 0.95));
    }
    return arr;
  }, []);

  const polyline = useMemo(() => {
    const stepX = SPARK_WIDTH / (SPARK_POINTS - 1);
    return points
      .map((v, i) => `${(i * stepX).toFixed(2)},${(SPARK_HEIGHT - v * SPARK_HEIGHT).toFixed(2)}`)
      .join(" ");
  }, [points]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Latency · NPU
        </div>
        <Activity size={12} className="text-slate-500" />
      </div>
      <div
        className="font-mono text-5xl font-semibold tabular-nums text-slate-100"
        style={{ textShadow: `0 0 18px ${COLOR_VIOLET}55` }}
      >
        {formatLatency(latencyMs)}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
        round-trip · zero-cloud
      </div>

      <svg
        className="mt-4 w-full"
        viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ height: SPARK_HEIGHT }}
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={COLOR_VIOLET} stopOpacity="0.4" />
            <stop offset="100%" stopColor={COLOR_VIOLET} stopOpacity="0" />
          </linearGradient>
          <filter id="sparkGlow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
        <motion.polygon
          points={`0,${SPARK_HEIGHT} ${polyline} ${SPARK_WIDTH},${SPARK_HEIGHT}`}
          fill="url(#sparkFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        />
        <motion.polyline
          points={polyline}
          fill="none"
          stroke={COLOR_VIOLET}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#sparkGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

// ---- Command FAB -----------------------------------------------------------
function CommandFAB() {
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50" style={{ perspective: 800 }}>
      <AnimatePresence>
        {active &&
          Array.from({ length: FAB_WAVE_RINGS }).map((_, i) => (
            <motion.span
              key={`wave-${i}-${active}`}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 rounded-full border"
              style={{
                borderColor: COLOR_VIOLET,
                width: 64,
                height: 64,
                marginLeft: -32,
                marginTop: -32,
              }}
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 3 + i * 0.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: FAB_WAVE_DURATION_S,
                delay: i * 0.12,
                ease: "easeOut",
              }}
            />
          ))}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Activate voice command"
        onClick={() => {
          setActive(true);
          window.setTimeout(() => setActive(false), FAB_WAVE_DURATION_S * 1000);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        animate={
          pressed
            ? { scale: 0.94, z: -4 }
            : { scale: 1, z: 0 }
        }
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="relative grid h-16 w-16 place-items-center rounded-full text-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-deep"
        style={{
          background: `radial-gradient(circle at 30% 30%, #a78bfa, ${COLOR_VIOLET} 60%, #6d28d9)`,
          boxShadow: `0 12px 30px -8px ${COLOR_VIOLET}cc, inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.4)`,
          transformStyle: "preserve-3d",
        }}
      >
        <Mic size={24} />
      </motion.button>
    </div>
  );
}

// ---- Main ZenithQR ---------------------------------------------------------
function ZenithQR({ qualityScore, latencyMs, safetyStatus, qrData }: ZenithQRProps) {
  useLenis();

  return (
    <div
      className="min-h-screen w-full text-slate-100 selection:bg-violet-500/30"
      style={{
        background: `radial-gradient(1200px 600px at 20% 0%, #1e1b4b33, transparent 60%), radial-gradient(900px 500px at 100% 100%, #8b5cf61a, transparent 60%), ${COLOR_SLATE_DEEP}`,
      }}
    >
      {/* Grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-lg grid place-items-center"
              style={{
                background: `linear-gradient(135deg, ${COLOR_VIOLET}, #4c1d95)`,
                boxShadow: `0 8px 24px -6px ${COLOR_VIOLET}99`,
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <div className="font-mono text-sm tracking-[0.25em] uppercase">
                Zenith<span style={{ color: COLOR_VIOLET }}>QR</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Diagnostic Suite · v0.1
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
            <span>Zenbook · NPU 16TOPS</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span style={{ color: COLOR_LIME }}>● offline-first</span>
          </div>
        </motion.header>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ScannerHub qrData={qrData} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <TiltCard delay={0.2} className="p-6">
              <FidelityGauge score={qualityScore} />
            </TiltCard>
            <TiltCard delay={0.3} className="p-6">
              <SafetyBeacon status={safetyStatus} />
            </TiltCard>
            <TiltCard delay={0.4} className="p-6">
              <LatencyPanel latencyMs={latencyMs} />
            </TiltCard>
          </div>
        </div>

        {/* Footer ribbon */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/20 px-5 py-3 backdrop-blur-md"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Local execution · no telemetry leaves device
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
            <span>NPU 78%</span>
            <span>RAM 2.1GB</span>
            <span style={{ color: COLOR_LIME }}>● ready</span>
          </div>
        </motion.footer>

        <div className="h-32" />
      </div>

      <CommandFAB />
    </div>
  );
}

export default ZenithQR;
