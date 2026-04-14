"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstallButton({ compact = false }: { compact?: boolean }) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;

    await installEvent.prompt();
    await installEvent.userChoice.catch(() => undefined);
    setInstallEvent(null);
  }

  if (isInstalled || !installEvent) {
    return null;
  }

  return (
    <button
      className={`install-btn ${compact ? "compact" : ""}`}
      onClick={handleInstall}
      type="button"
    >
      Shyiraho app
    </button>
  );
}
