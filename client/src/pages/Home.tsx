import React, { useState } from "react";
import { Scene } from "@/components/Scene";
import { DashboardOverlay } from "@/components/DashboardOverlay";
import { ExperimentSelector } from "@/components/ExperimentSelector";
import { NavigationHint } from "@/components/NavigationHint";

export default function Home() {
  const [lastInteraction, setLastInteraction] = useState<string | null>(null);

  const handleInteraction = (item: string) => {
    setLastInteraction(item);
    // Auto-clear after 3s
    setTimeout(() => setLastInteraction(null), 3000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Scene Layer */}
      <Scene onInteract={handleInteraction} />
      
      {/* UI Overlay Layer (HTML) */}
      <DashboardOverlay lastInteraction={lastInteraction} />
      <ExperimentSelector />
      <NavigationHint />
    </div>
  );
}
