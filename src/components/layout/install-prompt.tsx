"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return; // already installed
    if (localStorage.getItem("pwa-install-dismissed")) return;

    const p = detectPlatform();
    setPlatform(p);

    // Android / Desktop Chrome: listen for browser prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show manual instructions after a short delay if not yet installed
    if (p === "ios") {
      const t = setTimeout(() => setShow(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    setShowIosGuide(false);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  const handleInstall = async () => {
    if (platform === "ios") {
      setShowIosGuide(true);
      return;
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-3 right-3 z-[200] mx-auto max-w-sm">
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl shadow-black/60">
        {/* iOS step-by-step guide */}
        {showIosGuide ? (
          <>
            <div className="mb-3 flex items-start justify-between">
              <p className="text-sm font-semibold">Add to Home Screen</p>
              <button onClick={dismiss} className="ml-2 text-zinc-500 hover:text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950">1</span>
                Tap the <Share className="inline h-4 w-4 text-blue-400" /> <strong>Share</strong> button in Safari
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950">2</span>
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950">3</span>
                Tap <strong>"Add"</strong> — done! ✓
              </li>
            </ol>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full text-xs"
              onClick={dismiss}
            >
              Got it
            </Button>
          </>
        ) : (
          <>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-192.png" alt="Songbook" className="h-12 w-12 rounded-xl" />
                <div>
                  <p className="text-sm font-semibold">Install Songbook</p>
                  <p className="text-xs text-zinc-400">Works offline · No app store needed</p>
                </div>
              </div>
              <button onClick={dismiss} className="ml-2 mt-0.5 text-zinc-500 hover:text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-amber-500 text-zinc-950 hover:bg-amber-400 text-xs font-semibold"
                size="sm"
                onClick={handleInstall}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {platform === "ios" ? "How to install" : "Install App"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
