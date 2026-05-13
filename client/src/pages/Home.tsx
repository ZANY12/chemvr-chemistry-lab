import React, { useState } from "react";
import { Scene } from "@/components/Scene";
import { DashboardOverlay } from "@/components/DashboardOverlay";
import { ExperimentSelector } from "@/components/ExperimentSelector";
import { NavigationHint } from "@/components/NavigationHint";

export default function Home() {
  const [lastInteraction, setLastInteraction] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const handleInteraction = (item: string) => {
    setLastInteraction(item);
    // Auto-clear after 3s
    setTimeout(() => setLastInteraction(null), 3000);
  };

  React.useEffect(() => {
    const onError = (event: ErrorEvent) => {
      setFatalError(event.message || 'Unknown error');
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = (event.reason instanceof Error)
        ? event.reason.message
        : String(event.reason);
      setFatalError(reason || 'Unhandled rejection');
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {fatalError && (
        <div className="fixed inset-x-4 top-4 z-50 rounded-md border border-red-500/30 bg-slate-950/80 p-3 text-[12px] text-red-200 backdrop-blur">
          {fatalError}
        </div>
      )}
      {/* 3D Scene Layer */}
      <Scene onInteract={handleInteraction} />
      
      {/* UI Overlay Layer (HTML) */}
      <DashboardOverlay lastInteraction={lastInteraction} />
      <ExperimentSelector />
      <NavigationHint />
    </div>
  );
}
