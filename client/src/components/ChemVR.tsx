import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Keyboard, MousePointer, Gamepad2 } from 'lucide-react';

export function NavigationHint() {
  const [show, setShow] = useState(true);
  const [isVR, setIsVR] = useState(false);

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => setShow(false), 10000);
    
    // Check if in VR mode
    const checkVR = () => {
      setIsVR(!!navigator.xr);
    };
    checkVR();

    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="fixed bottom-4 left-4 z-40 p-2 bg-slate-900/80 border border-cyan-500/30 rounded-lg hover:bg-slate-800/80 transition-colors pointer-events-auto"
        title="Show navigation controls"
      >
        <Keyboard className="w-5 h-5 text-cyan-400" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-40 bg-slate-900/90 border-cyan-500/30 backdrop-blur-sm max-w-sm pointer-events-auto">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Navigation Controls
          </h3>
          <button
            onClick={() => setShow(false)}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        {!isVR ? (
          <>
            {/* Desktop Controls */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MousePointer className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Mouse</p>
                  <p>Click to lock pointer, then look around</p>
                  <p className="text-slate-400 text-[10px]">Press ESC to unlock</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Movement</p>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <span className="bg-slate-800 px-2 py-0.5 rounded">W/↑ Forward</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded">S/↓ Back</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded">A/← Left</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded">D/→ Right</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded">Space Up</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded">Shift Down</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* VR Controls */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Gamepad2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">VR Controllers</p>
                  <p>Left stick: Move forward/backward/strafe</p>
                  <p>Right stick: Snap turn left/right</p>
                  <p className="text-slate-400 text-[10px] mt-1">Or use hand tracking to grab and interact</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="pt-2 border-t border-slate-700">
          <p className="text-[10px] text-slate-400">
            💡 Tip: Walk around the lab to access different equipment and stations
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
