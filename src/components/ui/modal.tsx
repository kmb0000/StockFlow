"use client";

import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useEffect } from "react";

type ModalType = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalType) {
  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      {/* 1. OVERLAY (Le fond sombre) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 2. FENÊTRE MODALE */}
      <div
        className={cn(
          "relative bg-(--bg-card) border border-(--border) w-full max-w-md",
          "rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden",
          "animate-in fade-in zoom-in slide-in-from-bottom-4 duration-200",
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-(--border)">
          <h2 className="text-lg font-bold text-(--text-primary)">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-(--text-secondary) hover:text-(--text-primary)"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
