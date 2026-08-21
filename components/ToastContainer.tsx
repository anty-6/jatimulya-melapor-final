"use client";

import { useEffect, useState } from "react";
import { useToast, Toast, ToastType } from "@/lib/toast-context";

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const STYLES: Record<ToastType, string> = {
  success: "bg-green-600 text-white",
  error:   "bg-red-600 text-white",
  warning: "bg-amber-500 text-white",
  info:    "bg-navy-800 text-white",
};

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  // animate-in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(onDismiss, 300);
  }

  return (
    <div
      className={`
        flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg min-w-[280px] max-w-sm
        transition-all duration-300
        ${STYLES[t.type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <span className="mt-0.5 text-sm font-bold shrink-0">
        {ICONS[t.type]}
      </span>
      <p className="flex-1 text-sm leading-snug">{t.message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-white/70 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem t={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
