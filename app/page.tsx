import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Loader2,
  Check,
  Play,
  Pause,
  X,
  Sparkles,
  Brain,
  Moon,
  Zap,
  Infinity as InfinityIcon,
  Bot,
  CalendarCheck,
  Lock,
  Activity,
  Video,
  RefreshCw,
} from "lucide-react";

/* =========================================================================
   lib/routines.ts (ported)
   ========================================================================= */

const PAIN_AREAS = [
  { value: "lower-back", label: "Lower Back" },
  { value: "desk-neck", label: "Desk Neck" },
  { value: "tight-hips", label: "Tight Hips" },
  { value: "runners-knee", label: "Runner's Knee" },
];

const LIFESTYLES = [
  { value: "desk-worker", label: "Desk Worker", hint: "Seated 6+ hours a day" },
  { value: "active-athlete", label: "Active Athlete", hint: "Training most days" },
  { value: "on-feet", label: "On Feet All Day", hint: "Standing & moving" },
];

const SEVERITY_LABEL = {
  low: "Low intensity (1–3)",
  moderate: "Moderate intensity (4–7)",
  severe: "Severe intensity (8–10)",
};

function severityForIntensity(intensity) {
  if (intensity <= 3) return "low";
  if (intensity <= 7) return "moderate";
  return "severe";
}

// Clinical matrix: each pain area x severity band yields a distinct 3-step routine.
const ROUTINE_MATRIX = {
  "desk-neck": {
    low: [
      { title: "Gentle Upper Trapezius Stretch", instruction: "Ease one ear toward your shoulder with a light hand assist, breathing into the side of your neck.", duration: "45 seconds" },
      { title: "Slow Shoulder Rolls", instruction: "Roll your shoulders in smooth, controlled circles to loosen tension built up from screen time.", duration: "45 seconds" },
      { title: "Seated Spinal Twist", instruction: "Sit tall and rotate gently toward the back of your chair, lengthening through the upper spine.", duration: "45 seconds" },
    ],
    moderate: [
      { title: "Active Chin Tucks", instruction: "Glide your chin straight back to stack your head over your spine and reverse forward-head posture.", duration: "60 seconds" },
      { title: "Scapular Retractions", instruction: "Draw your shoulder blades down and together, holding briefly to reactivate the mid-back muscles.", duration: "60 seconds" },
      { title: "Chest Opener Stretch", instruction: "Clasp your hands behind you and lift gently to open the chest and counter rounded shoulders.", duration: "60 seconds" },
    ],
    severe: [
      { title: "Gentle Chin-to-Chest Stretch", instruction: "Let your chin drop slowly toward your chest, allowing gravity to decompress the back of the neck.", duration: "30 seconds" },
      { title: "Levator Scapulae Passive Release", instruction: "Turn your head 45 degrees and look down into your armpit, easing the muscle from skull to shoulder blade.", duration: "30 seconds" },
      { title: "Head Rotations", instruction: "Slowly turn your head side to side within a pain-free range to restore gentle rotational movement.", duration: "30 seconds" },
    ],
  },
  "tight-hips": {
    low: [
      { title: "Seated Butterfly Pose", instruction: "Sit with soles together and let your knees fall open, gently pressing them toward the floor.", duration: "45 seconds" },
      { title: "Dynamic Hip Flexor Lunge", instruction: "Step into a lunge and rock forward and back rhythmically to wake up the front of the hip.", duration: "45 seconds" },
      { title: "Figure-4 Stretch", instruction: "Cross one ankle over the opposite knee and lean in to open the glute and outer hip.", duration: "45 seconds" },
    ],
    moderate: [
      { title: "90/90 Hip Switches", instruction: "Seated with knees bent at 90 degrees, rotate both legs side to side to unlock hip rotation.", duration: "60 seconds" },
      { title: "Quadruped Hip Circles", instruction: "On all fours, draw slow circles with one knee to mobilize the hip socket through its full range.", duration: "60 seconds" },
      { title: "Deep Runner's Lunge", instruction: "Drop into a low lunge and sink your hips, feeling a deep stretch through the trailing hip flexor.", duration: "60 seconds" },
    ],
    severe: [
      { title: "Passive Child's Pose", instruction: "Sink your hips back toward your heels and rest your torso down, letting the hips release without force.", duration: "60 seconds" },
      { title: "Supine Single-Knee to Chest", instruction: "Lying on your back, draw one knee gently toward your chest and hold, then switch sides.", duration: "45 seconds" },
      { title: "Assisted Quad Stretch", instruction: "Side-lying, use a strap or hand to ease your heel toward your glute for a supported quad release.", duration: "45 seconds" },
    ],
  },
  "runners-knee": {
    low: [
      { title: "Straight Leg Raises", instruction: "Lie back with one leg bent, lift the straight leg to knee height, and lower with control.", duration: "45 seconds" },
      { title: "Side-Lying Clamshells", instruction: "On your side with knees bent, lift the top knee while keeping your feet together to fire the glutes.", duration: "45 seconds" },
      { title: "Standing Calf Stretch", instruction: "Step one foot back, keep the heel down, and lean into the wall to lengthen the calf and Achilles.", duration: "45 seconds" },
    ],
    moderate: [
      { title: "Spanish Banded Squats", instruction: "Loop a band behind your knees, sit back into a squat, and hold to load the quads pain-free.", duration: "60 seconds" },
      { title: "Patellar-Tracking Patrick Step-Ups", instruction: "Step up slowly onto a low box, keeping your knee tracking over your second toe the whole way.", duration: "60 seconds" },
      { title: "Reverse Lunges", instruction: "Step back into a controlled lunge to build quad and glute strength while sparing the kneecap.", duration: "60 seconds" },
    ],
    severe: [
      { title: "Isometric Quad Sets (No-load)", instruction: "Sit with your leg straight and gently press the back of your knee down, tightening the thigh.", duration: "30 seconds" },
      { title: "Glute Bridge Activation", instruction: "Feet flat, drive through your heels to lift your hips and rebuild support around the knee.", duration: "45 seconds" },
      { title: "Seated Hamstring Stretch", instruction: "Extend one leg and hinge gently forward with a flat back to ease tension behind the knee.", duration: "45 seconds" },
    ],
  },
  "lower-back": {
    low: [
      { title: "Cat-Cow Spinal Flow", instruction: "On all fours, alternate slowly between arching and rounding your spine, moving with your breath.", duration: "45 seconds" },
      { title: "Supine Knee-to-Chest", instruction: "Lying on your back, draw one knee toward your chest and hold, feeling the lower spine release.", duration: "60 seconds" },
      { title: "Glute Bridge Activation", instruction: "Feet flat, drive through your heels to lift your hips and squeeze the glutes at the top.", duration: "45 seconds" },
    ],
    moderate: [
      { title: "Wall Push-Ups / Wall Slides", instruction: "Press into a wall and slide your arms up and down to engage the core and mid-back safely.", duration: "60 seconds" },
      { title: "Bird-Dog Core Stabilizers", instruction: "On all fours, extend the opposite arm and leg, holding briefly to train deep spinal stability.", duration: "60 seconds" },
      { title: "Standing Hip Flexor Stretch", instruction: "In a staggered stance, tuck your pelvis and shift forward to lengthen the front of the hip.", duration: "60 seconds" },
    ],
    severe: [
      { title: "Prone Press-Ups (Decompression)", instruction: "Lie face down and press up onto your forearms, letting your hips stay heavy to decompress the discs.", duration: "45 seconds" },
      { title: "Gentle Trunk Rotations", instruction: "On your back with knees bent, let both knees drop slowly side to side within a comfortable range.", duration: "45 seconds" },
      { title: "Supported Child's Pose", instruction: "Sink your hips back over a cushion and rest your torso down to gently unload the lower back.", duration: "60 seconds" },
    ],
  },
};

function generateRoutine(area, intensity) {
  const severity = severityForIntensity(intensity);
  return ROUTINE_MATRIX[area][severity];
}

// Flat pool of every exercise for a given pain area, across all severity
// bands — used as the safe-alternative source for the "Swap Movement" feature.
function alternativesForArea(area, excludeTitles) {
  const bands = ROUTINE_MATRIX[area];
  const pool = [...bands.low, ...bands.moderate, ...bands.severe];
  const unused = pool.filter((ex) => !excludeTitles.includes(ex.title));
  return unused.length > 0 ? unused : pool;
}

/* =========================================================================
   Theme (design tokens ported from app/globals.css)
   Injected once as a <style> tag since this environment has no Tailwind
   config / CSS-variable theme extension available.
   ========================================================================= */

function ThemeStyles() {
  return (
    <style>{`
      .ff-root {
        --background: oklch(0.16 0.006 160);
        --foreground: oklch(0.96 0.005 160);
        --card: oklch(0.2 0.008 160);
        --primary: oklch(0.85 0.21 148);
        --primary-foreground: oklch(0.18 0.02 160);
        --secondary: oklch(0.26 0.01 160);
        --muted-foreground: oklch(0.68 0.01 160);
        --border: oklch(1 0 0 / 9%);
        --input: oklch(1 0 0 / 12%);
        color-scheme: dark;
        background: var(--background);
        color: var(--foreground);
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
        min-height: 100vh;
      }
      .ff-card { border: 1px solid var(--border); background: var(--card); border-radius: 1rem; }
      .ff-select {
        width: 100%; appearance: none; border-radius: 0.75rem; border: 1px solid var(--input);
        background: var(--secondary); color: var(--foreground); padding: 0.75rem 2.5rem 0.75rem 1rem; font-size: 0.875rem; outline: none;
      }
      .ff-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px oklch(0.85 0.21 148 / 25%); }
      .ff-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 9999px; outline: none; cursor: pointer; }
      .ff-slider::-webkit-slider-thumb {
        -webkit-appearance: none; width: 20px; height: 20px; border-radius: 9999px; background: var(--primary);
        border: 3px solid var(--background); box-shadow: 0 0 0 1px var(--primary), 0 0 12px oklch(0.85 0.21 148 / 45%);
      }
      .ff-slider::-moz-range-thumb {
        width: 20px; height: 20px; border-radius: 9999px; background: var(--primary);
        border: 3px solid var(--background); box-shadow: 0 0 0 1px var(--primary), 0 0 12px oklch(0.85 0.21 148 / 45%);
      }
      .ff-lifestyle-opt { cursor: pointer; border-radius: 0.75rem; border: 1px solid var(--input); background: var(--secondary); padding: 0.75rem 1rem; transition: border-color 0.15s, background 0.15s; }
      .ff-lifestyle-opt.active { border-color: var(--primary); background: oklch(0.85 0.21 148 / 10%); }
      .ff-lifestyle-opt:not(.active):hover { border-color: oklch(0.68 0.01 160 / 40%); }
      .ff-radio-dot { width: 1rem; height: 1rem; border-radius: 9999px; border: 1px solid var(--muted-foreground); display: grid; place-items: center; flex-shrink: 0; }
      .ff-lifestyle-opt.active .ff-radio-dot { border-color: var(--primary); }
      .ff-btn-primary { background: var(--primary); color: var(--primary-foreground); transition: opacity 0.15s; }
      .ff-btn-primary:hover { opacity: 0.95; }
      .ff-btn-primary:disabled { opacity: 0.6; cursor: default; }
      .ff-pill { background: var(--secondary); }
      .ff-pill-primary { background: oklch(0.85 0.21 148 / 15%); color: var(--primary); }
      .ff-progress-track { background: var(--secondary); }
      .ff-progress-fill { background: var(--primary); transition: width 0.5s ease-out; }
      .ff-step-card { border: 1px solid var(--border); background: var(--card); transition: background 0.2s, border-color 0.2s; }
      .ff-step-card.done { border-color: oklch(0.85 0.21 148 / 40%); background: oklch(0.85 0.21 148 / 5%); }
      .ff-step-card.flash { border-color: var(--primary); background: oklch(0.85 0.21 148 / 20%); }
      .ff-step-card.swapping { opacity: 0.55; }
      .ff-check-btn { border: 1px solid oklch(0.68 0.01 160 / 50%); background: transparent; color: var(--primary-foreground); }
      .ff-check-btn.done { background: var(--primary); border-color: var(--primary); }
      .ff-check-btn:not(.done):hover { border-color: var(--primary); }
      .ff-dur-pill { background: var(--secondary); color: var(--muted-foreground); }
      .ff-timer-btn { background: oklch(0.85 0.21 148 / 15%); color: var(--primary); }
      .ff-timer-btn.active { background: var(--primary); color: var(--primary-foreground); }
      .ff-guide-btn { border: 1px solid var(--input); background: var(--secondary); color: var(--foreground); transition: border-color 0.15s, color 0.15s; }
      .ff-guide-btn:hover { border-color: var(--primary); color: var(--primary); }
      .ff-swap-btn { border: 1px dashed var(--input); background: transparent; color: var(--muted-foreground); transition: border-color 0.15s, color 0.15s, opacity 0.15s; }
      .ff-swap-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
      .ff-swap-btn:disabled { opacity: 0.7; cursor: default; }
      .ff-footer-card { border: 1px solid oklch(0.85 0.21 148 / 30%); background: linear-gradient(135deg, oklch(0.85 0.21 148 / 15%), var(--card) 60%); }
      .ff-footer-badge { background: oklch(0.85 0.21 148 / 15%); color: var(--primary); }
      .ff-footer-btn { background: var(--primary); color: var(--primary-foreground); }
      .ff-footer-btn:hover { opacity: 0.9; }

      /* Breathing pulse guide */
      .ff-breath-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; padding: 0.5rem 0 0.25rem; animation: ff-breath-fade-in 0.3s ease-out; }
      @keyframes ff-breath-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      .ff-breath-circle {
        width: 2.75rem; height: 2.75rem; border-radius: 9999px;
        background: radial-gradient(circle at 35% 30%, oklch(0.85 0.21 148 / 90%), oklch(0.85 0.21 148 / 35%) 70%);
        box-shadow: 0 0 18px 4px oklch(0.85 0.21 148 / 45%), 0 0 40px 10px oklch(0.85 0.21 148 / 20%);
      }
      .ff-breath-circle.inhale { animation: ff-breath-grow 4s ease-in-out infinite; }
      .ff-breath-circle.exhale { animation: ff-breath-shrink 4s ease-in-out infinite; }
      @keyframes ff-breath-grow { 0% { transform: scale(0.7); } 100% { transform: scale(1.25); } }
      @keyframes ff-breath-shrink { 0% { transform: scale(1.25); } 100% { transform: scale(0.7); } }
      .ff-breath-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.02em; color: var(--primary); }

      .ff-overlay { position: fixed; inset: 0; z-index: 50; background: oklch(0.16 0.006 160 / 80%); backdrop-filter: blur(4px); animation: ff-overlay-in 0.2s ease-out; }
      @keyframes ff-overlay-in { from { opacity: 0; } to { opacity: 1; } }
      .ff-panel { border: 1px solid oklch(0.85 0.21 148 / 25%); background: var(--card); box-shadow: 0 25px 60px -15px rgba(0,0,0,0.6); animation: ff-panel-in 0.28s cubic-bezier(0.22,1,0.36,1); }
      @keyframes ff-panel-in { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .ff-panel-glow { background: oklch(0.85 0.21 148 / 20%); filter: blur(50px); }
      .ff-panel-close { border: 1px solid var(--border); background: oklch(0.26 0.01 160 / 80%); color: var(--muted-foreground); }
      .ff-panel-close:hover { color: var(--foreground); }

      /* Premium video teaser */
      .ff-video-teaser { aspect-ratio: 16 / 10; background: linear-gradient(165deg, #0a0d0b 0%, #10231a 55%, #0a0d0b 100%); border: 1px solid oklch(0.85 0.21 148 / 20%); }
      .ff-video-figure {
        position: absolute; inset: 0; display: grid; place-items: center;
        filter: blur(5px) saturate(0.9); opacity: 0.8;
        animation: ff-figure-sway 5s ease-in-out infinite;
      }
      @keyframes ff-figure-sway {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-4px) scale(1.02); }
      }
      .ff-video-scanline {
        position: absolute; inset: 0; pointer-events: none;
        background: linear-gradient(115deg, transparent 40%, oklch(0.85 0.21 148 / 18%) 50%, transparent 60%);
        background-size: 250% 250%;
        animation: ff-scan-sweep 3.5s ease-in-out infinite;
      }
      @keyframes ff-scan-sweep { 0% { background-position: 120% 0%; } 100% { background-position: -20% 0%; } }
      .ff-video-vignette { position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 50px 10px rgba(0,0,0,0.55); }
      .ff-play-btn {
        position: relative; z-index: 2; display: grid; place-items: center; width: 4rem; height: 4rem; border-radius: 9999px;
        background: oklch(0.85 0.21 148 / 92%); color: var(--primary-foreground); border: none; cursor: pointer;
        box-shadow: 0 0 0 0 oklch(0.85 0.21 148 / 55%), 0 0 30px 6px oklch(0.85 0.21 148 / 45%);
        animation: ff-pulse-glow 2s ease-in-out infinite;
      }
      .ff-video-badge {
        position: absolute; top: 0.75rem; left: 0.75rem; z-index: 2; display: inline-flex; align-items: center; gap: 0.3rem;
        background: rgba(0,0,0,0.55); color: var(--foreground); font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.04em; padding: 0.25rem 0.55rem; border-radius: 9999px; border: 1px solid oklch(0.85 0.21 148 / 30%);
      }
      .ff-video-duration {
        position: absolute; bottom: 0.65rem; right: 0.75rem; z-index: 2; background: rgba(0,0,0,0.6); color: var(--foreground);
        font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-variant-numeric: tabular-nums;
      }

      .ff-lock-icon { background: oklch(0.85 0.21 148 / 12%); }
      .ff-unlock-btn, .ff-cta-btn {
        background: var(--primary); color: var(--primary-foreground);
        box-shadow: 0 0 0 0 oklch(0.85 0.21 148 / 55%), 0 0 22px 2px oklch(0.85 0.21 148 / 35%);
        animation: ff-pulse-glow 2s ease-in-out infinite;
      }
      @keyframes ff-pulse-glow {
        0%, 100% { box-shadow: 0 0 0 0 oklch(0.85 0.21 148 / 55%), 0 0 22px 2px oklch(0.85 0.21 148 / 35%); transform: translateY(0) scale(1); }
        50% { box-shadow: 0 0 0 8px oklch(0.85 0.21 148 / 0%), 0 0 34px 6px oklch(0.85 0.21 148 / 55%); transform: translateY(0) scale(1.015); }
      }
      .ff-lock-return { color: var(--muted-foreground); text-decoration: underline; text-underline-offset: 2px; }
      .ff-lock-return:hover { color: var(--foreground); }

      .ff-eyebrow { background: oklch(0.85 0.21 148 / 15%); color: var(--primary); }
      .ff-benefit-icon { background: oklch(0.85 0.21 148 / 12%); color: var(--primary); }
      .ff-feature-card { border: 1px solid var(--border); background: oklch(0.26 0.01 160 / 40%); }
      .ff-feature-icon { background: var(--primary); color: var(--primary-foreground); }
      .ff-plan-opt { border: 1px solid var(--border); background: oklch(0.26 0.01 160 / 40%); }
      .ff-plan-opt.selected { border-color: var(--primary); background: oklch(0.85 0.21 148 / 10%); box-shadow: 0 0 0 1px var(--primary) inset; }
      .ff-plan-badge { background: var(--primary); color: var(--primary-foreground); }
      .ff-plan-radio { border: 1px solid oklch(0.68 0.01 160 / 40%); }
      .ff-plan-opt.selected .ff-plan-radio { border-color: var(--primary); background: var(--primary); color: var(--primary-foreground); }

      @media (prefers-reduced-motion: reduce) {
        .ff-unlock-btn, .ff-cta-btn, .ff-overlay, .ff-panel, .ff-play-btn, .ff-video-figure, .ff-video-scanline, .ff-breath-circle { animation: none; }
      }
    `}</style>
  );
}

/* =========================================================================
   Stylized "locked video" silhouette — a simple animated fitness figure
   drawn in SVG so no external video/image assets are required.
   ========================================================================= */

function StretchSilhouette() {
  return (
    <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="142" rx="34" ry="6" fill="oklch(0.85 0.21 148 / 25%)" />
      <circle cx="60" cy="22" r="14" fill="oklch(0.85 0.21 148 / 70%)" />
      <path
        d="M60 36 C60 36 38 46 34 66 C31 80 36 96 40 108 M60 36 C60 36 82 46 86 66 C89 80 84 96 80 108"
        stroke="oklch(0.85 0.21 148 / 65%)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M58 62 C50 78 30 82 18 76 M62 62 C70 78 90 82 102 76"
        stroke="oklch(0.85 0.21 148 / 55%)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 108 C38 120 40 132 44 140 M80 108 C82 120 80 132 76 140"
        stroke="oklch(0.85 0.21 148 / 65%)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* =========================================================================
   components/assessment-form.tsx (ported)
   ========================================================================= */

function AssessmentForm({ area, setArea, intensity, setIntensity, lifestyle, setLifestyle, onGenerate, loading }) {
  return (
    <div className="ff-card p-6 sm:p-8 flex flex-col gap-8">
      {/* Pain area */}
      <div className="flex flex-col gap-3">
        <label htmlFor="pain-area" className="text-sm font-medium">Primary area of pain</label>
        <div className="relative">
          <select
            id="pain-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="ff-select"
          >
            {PAIN_AREAS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
        </div>
      </div>

      {/* Intensity slider */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor="intensity" className="text-sm font-medium">Discomfort intensity</label>
          <span className="flex items-baseline gap-1 tabular-nums">
            <span className="text-lg font-semibold" style={{ color: "var(--primary)" }}>{intensity}</span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>/ 10</span>
          </span>
        </div>
        <input
          id="intensity"
          type="range"
          min={1}
          max={10}
          step={1}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="ff-slider"
          style={{ background: `linear-gradient(to right, var(--primary) ${((intensity - 1) / 9) * 100}%, var(--secondary) ${((intensity - 1) / 9) * 100}%)` }}
        />
        <div className="flex justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>Mild</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Lifestyle */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Daily activity level</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {LIFESTYLES.map((l) => {
            const active = lifestyle === l.value;
            return (
              <label key={l.value} className={`ff-lifestyle-opt ${active ? "active" : ""}`}>
                <input
                  type="radio"
                  name="lifestyle"
                  value={l.value}
                  checked={active}
                  onChange={() => setLifestyle(l.value)}
                  className="sr-only"
                />
                <span className="flex items-center gap-2">
                  <span className="ff-radio-dot">
                    {active && <span className="size-2 rounded-full" style={{ background: "var(--primary)" }} />}
                  </span>
                  <span className="text-sm font-medium">{l.label}</span>
                </span>
                <span className="mt-1.5 block pl-6 text-xs" style={{ color: "var(--muted-foreground)" }}>{l.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="ff-btn-primary h-12 w-full rounded-xl text-base font-semibold flex items-center justify-center gap-2"
      >
        {loading ? "Analyzing your inputs…" : "Generate My Routine"}
      </button>
    </div>
  );
}

/* =========================================================================
   Breathing pulse guide — shown beneath the timer while it's running.
   ========================================================================= */

function BreathingGuide({ running }) {
  const [phase, setPhase] = useState("inhale");

  useEffect(() => {
    if (!running) return;
    setPhase("inhale");
    const id = setInterval(() => {
      setPhase((p) => (p === "inhale" ? "exhale" : "inhale"));
    }, 4000);
    return () => clearInterval(id);
  }, [running]);

  if (!running) return null;

  return (
    <div className="ff-breath-wrap">
      <span className={`ff-breath-circle ${phase}`} aria-hidden="true" />
      <span className="ff-breath-label">{phase === "inhale" ? "Inhale…" : "Exhale…"}</span>
    </div>
  );
}

/* =========================================================================
   components/routine-result.tsx (ported, + Swap Movement + Breathing Guide)
   ========================================================================= */

function parseSeconds(duration) {
  const value = parseInt(duration, 10);
  return Number.isFinite(value) && value > 0 ? value : 60;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
    osc.onended = () => ctx.close();
  } catch {
    // Audio not available — the visual flash still fires.
  }
}

function ExerciseCard({ step, index, done, onToggle, onOpenGuide, onSwap }) {
  const total = parseSeconds(step.duration);
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const [flash, setFlash] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          playBeep();
          setFlash(true);
          setTimeout(() => setFlash(false), 900);
          if (!doneRef.current) onToggle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onToggle]);

  function handleTimerClick() {
    if (remaining === 0) {
      setRemaining(total);
      setRunning(true);
      return;
    }
    setRunning((r) => !r);
  }

  function handleSwapClick() {
    if (swapping) return;
    setRunning(false);
    setSwapping(true);
    // Brief spin to sell the "AI is finding a safe alternative" moment.
    setTimeout(() => {
      onSwap(index);
      setSwapping(false);
    }, 700);
  }

  const timerActive = running || remaining < total;

  return (
    <li className={`ff-step-card rounded-2xl p-5 ${flash ? "flash" : done ? "done" : ""} ${swapping ? "swapping" : ""}`}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          aria-label={done ? `Mark ${step.title} incomplete` : `Mark ${step.title} complete`}
          className={`ff-check-btn mt-0.5 grid size-6 shrink-0 place-items-center rounded-md ${done ? "done" : ""}`}
        >
          {done && <Check className="size-4" strokeWidth={3} />}
        </button>
        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Step {index + 1}</span>
            <span className="ff-dur-pill inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs">
              <span aria-hidden="true">⏱️</span>
              {step.duration}
            </span>
            <button
              type="button"
              onClick={handleTimerClick}
              aria-label={running ? `Pause timer for ${step.title}` : `Start timer for ${step.title}`}
              className={`ff-timer-btn inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${timerActive ? "active" : ""}`}
            >
              {running ? <Pause className="size-3" fill="currentColor" strokeWidth={0} /> : <Play className="size-3" fill="currentColor" strokeWidth={0} />}
              {timerActive ? formatTime(remaining) : "Start Timer"}
            </button>
            <button
              type="button"
              onClick={onOpenGuide}
              aria-haspopup="dialog"
              className="ff-guide-btn inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >
              <Video className="size-3" />
              View Form Guide
            </button>
          </div>
          <h3
            className="text-base font-semibold"
            style={done ? { color: "var(--muted-foreground)", textDecoration: "line-through" } : undefined}
          >
            {step.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{step.instruction}</p>

          <BreathingGuide running={running} />

          <button
            type="button"
            onClick={handleSwapClick}
            disabled={swapping}
            className="ff-swap-btn mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          >
            {swapping ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Finding a safe alternative…
              </>
            ) : (
              <>
                <RefreshCw className="size-3" />
                Swap Movement
              </>
            )}
          </button>
        </div>
      </div>
    </li>
  );
}

function RoutineResult({ steps, checked, onToggle, onOpenGuide, onSwap }) {
  const completed = checked.filter(Boolean).length;
  const progress = steps.length ? Math.floor((completed / steps.length) * 100) : 0;
  const allDone = completed === steps.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="ff-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">Today&apos;s progress</h2>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {allDone ? "Routine complete — nice work." : `${completed} of ${steps.length} stretches done`}
            </p>
          </div>
          <span className="text-2xl font-semibold tabular-nums" style={{ color: "var(--primary)" }}>{progress}%</span>
        </div>
        <div className="ff-progress-track h-2.5 w-full overflow-hidden rounded-full">
          <div className="ff-progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <ExerciseCard
            key={step.title}
            step={step}
            index={i}
            done={checked[i]}
            onToggle={() => onToggle(i)}
            onOpenGuide={() => onOpenGuide(i)}
            onSwap={onSwap}
          />
        ))}
      </ol>
    </div>
  );
}

/* =========================================================================
   components/form-guide-lock-modal.tsx (+ premium video teaser)
   ========================================================================= */

function FormGuideLockModal({ open, onClose, onUnlock }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ff-overlay fixed inset-0 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-title"
        className="ff-panel relative my-4 w-full max-w-md overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="ff-panel-close absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full"
        >
          <X className="size-4" />
        </button>

        <div className="relative flex flex-col gap-5 p-6 pt-6 sm:p-7 sm:pt-7">
          {/* Blurred video teaser */}
          <div className="ff-video-teaser relative w-full overflow-hidden rounded-2xl">
            <span className="ff-video-badge">🔒 Premium Preview</span>
            <span className="ff-video-duration">2:14</span>
            <div className="ff-video-figure">
              <StretchSilhouette />
            </div>
            <div className="ff-video-scanline" aria-hidden="true" />
            <div className="ff-video-vignette" aria-hidden="true" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="ff-play-btn" aria-label="Play locked form guide video" onClick={onUnlock}>
                <Play className="size-6" fill="currentColor" strokeWidth={0} style={{ marginLeft: "3px" }} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <span className="ff-lock-icon grid size-12 place-items-center rounded-full">
              <Lock className="size-5" style={{ color: "var(--primary)" }} />
            </span>
            <h2 id="lock-title" className="text-xl font-bold">Form Video Guides are Locked</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Executing stretches incorrectly can delay your recovery or cause further strain. Upgrade to{" "}
              <strong style={{ color: "var(--foreground)" }}>Premium</strong> to unlock step-by-step video
              demonstrations, custom breathing cues, and 1-on-1 AI coach feedback.
            </p>
            <button onClick={onUnlock} className="ff-unlock-btn w-full rounded-2xl text-base font-bold" style={{ height: "3.25rem" }}>
              Unlock Form Guides Now
            </button>
            <button onClick={onClose} className="ff-lock-return bg-transparent border-0 text-sm cursor-pointer">
              Return to my tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   components/premium-modal.tsx (ported)
   ========================================================================= */

const TRANSFORMATIONS = [
  { icon: Brain, title: "Clear the Desk Fog", body: 'Loosen up tight shoulders and "desk neck" so you can think clearly and finish your workday energized, not exhausted.' },
  { icon: Moon, title: "Sleep Without the Ache", body: "Target deep tissue tension so you can finally toss and turn less and wake up feeling fully recovered." },
  { icon: Zap, title: "Get Back to What You Love", body: "Build stable joints and resilient muscles so you can run, lift, or play with your kids without worrying about getting hurt." },
];

const FEATURES = [
  { icon: InfinityIcon, title: "Unlimited Access", body: "Unlock the full matrix for every muscle group, from feet to jaw." },
  { icon: Bot, title: "1-on-1 AI Health Coach", body: 'A private chat module to ask questions like "My knee hurts specifically when walking downstairs, what should I swap?"' },
  { icon: CalendarCheck, title: "30-Day Recovery Streak Calendar", body: "Keep track of your consistency and build a life-changing daily habit." },
];

function PlanOption({ selected, onSelect, label, price, unit, badge }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`ff-plan-opt relative flex flex-col items-start gap-1 rounded-2xl p-4 text-left ${selected ? "selected" : ""}`}
    >
      {badge && (
        <span className="ff-plan-badge absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          {badge}
        </span>
      )}
      <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
        <span className="ff-plan-radio grid size-4 place-items-center rounded-full">
          {selected && <Check className="size-3" strokeWidth={3} />}
        </span>
        {label}
      </span>
      <span className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{price}</span>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{unit}</span>
      </span>
    </button>
  );
}

function PremiumModal({ open, onClose }) {
  const [plan, setPlan] = useState("lifetime");
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ff-overlay fixed inset-0 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-title"
        className="ff-panel relative my-4 w-full max-w-lg overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div aria-hidden="true" className="ff-panel-glow pointer-events-none absolute -top-24 left-1/2 h-48 w-3/4 -translate-x-1/2 rounded-full" />

        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close upgrade dialog"
          className="ff-panel-close absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full"
        >
          <X className="size-4" />
        </button>

        <div className="relative flex flex-col gap-8 p-6 sm:p-8">
          <header className="flex flex-col gap-4">
            <span className="ff-eyebrow inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="size-3.5" />
              FlexFix Premium
            </span>
            <h2 id="premium-title" className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Stop letting daily aches dictate your potential.
            </h2>
            <p className="text-pretty leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Whether it&apos;s that nagging lower back ache from your desk chair, a stiff neck that
              kills your focus by 2 PM, or a knee that holds you back from running&mdash;you
              shouldn&apos;t have to just &quot;live with it.&quot; FlexFix Premium is your personal,
              digital physical therapist available 24/7.
            </p>
          </header>

          <ul className="flex flex-col gap-4">
            {TRANSFORMATIONS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span className="ff-benefit-icon mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl">
                  <Icon className="size-4.5" strokeWidth={2.25} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold leading-snug">{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>What you get</p>
            <div className="grid gap-2.5">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="ff-feature-card flex gap-3 rounded-2xl p-4">
                  <span className="ff-feature-icon mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg">
                    <Icon className="size-4" strokeWidth={2.5} />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold leading-snug">{title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <PlanOption selected={plan === "monthly"} onSelect={() => setPlan("monthly")} label="Monthly" price="$14.99" unit="/ month" />
              <PlanOption selected={plan === "lifetime"} onSelect={() => setPlan("lifetime")} label="Lifetime Access" price="$49" unit="one-time" badge="Best Value · Save 70%" />
            </div>

            <button className="ff-cta-btn mt-1 h-14 w-full rounded-2xl text-base font-bold">
              Start My Pain-Free Journey Now
            </button>

            <p className="flex items-center justify-center gap-1.5 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
              <Lock className="size-3.5" />
              30-Day Money-Back Guarantee. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   app/page.tsx (ported)
   ========================================================================= */

export default function FlexFixApp() {
  const [area, setArea] = useState("lower-back");
  const [intensity, setIntensity] = useState(5);
  const [lifestyle, setLifestyle] = useState("desk-worker");

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState(null);
  const [checked, setChecked] = useState([]);
  // Snapshot of the inputs the displayed plan was generated from.
  const [plan, setPlan] = useState(null);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [guideOpenIndex, setGuideOpenIndex] = useState(null);

  function handleGenerate() {
    setLoading(true);
    setSteps(null);
    // Simulate an AI generation delay.
    setTimeout(() => {
      const routine = generateRoutine(area, intensity);
      setSteps(routine);
      setChecked(new Array(routine.length).fill(false));
      setPlan({ area, intensity });
      setLoading(false);
    }, 1500);
  }

  function toggle(index) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function handleUnlockFromGuide() {
    setGuideOpenIndex(null);
    // Smoothly hand off from the lock modal to the premium pricing card.
    setTimeout(() => setPremiumOpen(true), 150);
  }

  function handleSwap(index) {
    if (!plan) return;
    setSteps((prev) => {
      const excludeTitles = prev.map((s) => s.title);
      const options = alternativesForArea(plan.area, excludeTitles);
      const replacement = options[Math.floor(Math.random() * options.length)];
      const next = [...prev];
      next[index] = replacement;
      return next;
    });
    // A freshly swapped-in exercise starts unchecked.
    setChecked((prev) => prev.map((v, i) => (i === index ? false : v)));
  }

  return (
    <div className="ff-root">
      <ThemeStyles />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 py-14 sm:py-20">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Activity className="size-4.5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold tracking-tight">FlexFix AI</span>
          </div>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Hyper-personalized mobility &amp; injury rehab
          </h1>
          <p className="max-w-lg text-pretty leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Tell us where it hurts and how you move through your day. FlexFix builds a focused
            daily routine to relieve pain and rebuild mobility.
          </p>
        </header>

        <AssessmentForm
          area={area}
          setArea={setArea}
          intensity={intensity}
          setIntensity={setIntensity}
          lifestyle={lifestyle}
          setLifestyle={setLifestyle}
          onGenerate={handleGenerate}
          loading={loading}
        />

        {loading && (
          <div className="ff-card flex items-center justify-center gap-3 p-8" style={{ color: "var(--muted-foreground)" }}>
            <Loader2 className="size-5 animate-spin" style={{ color: "var(--primary)" }} />
            <span className="text-sm font-medium">Analyzing biomechanics...</span>
          </div>
        )}

        {steps && !loading && plan && (
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold tracking-tight">Your Recovery Plan</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="ff-pill inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
                  {PAIN_AREAS.find((p) => p.value === plan.area)?.label}
                </span>
                <span className="ff-pill-primary inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
                  {SEVERITY_LABEL[severityForIntensity(plan.intensity)]}
                </span>
              </div>
            </div>
            <RoutineResult
              steps={steps}
              checked={checked}
              onToggle={toggle}
              onOpenGuide={setGuideOpenIndex}
              onSwap={handleSwap}
            />
          </section>
        )}
      </main>

      {/* Premium CTA footer */}
      <footer className="mt-4 pt-8 pb-14 px-5" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mx-auto w-full max-w-2xl">
          <div className="ff-footer-card relative overflow-hidden rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="ff-footer-badge inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
                  <Sparkles className="size-3" />
                  Premium
                </span>
                <h3 className="text-pretty text-lg font-semibold">Unlock advanced routines and 1-on-1 AI coaching.</h3>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Upgrade to Premium.</p>
              </div>
              <button
                onClick={() => setPremiumOpen(true)}
                className="ff-footer-btn h-11 shrink-0 rounded-xl px-6 text-sm font-semibold"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </footer>

      <FormGuideLockModal
        open={guideOpenIndex !== null}
        onClose={() => setGuideOpenIndex(null)}
        onUnlock={handleUnlockFromGuide}
      />
      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
}
