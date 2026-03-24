"use client";
import { useEffect, useState } from "react";

export default function Toast({ message, icon, show, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        {icon && <span className="text-base">{icon}</span>}
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {message}
        </p>
      </div>
    </div>
  );
}
