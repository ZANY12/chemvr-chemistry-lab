import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ApparatusMenuProps {
  apparatusName: string;
  onGrab: () => void;
  onPour: () => void;
  onDrag: () => void;
  onRelease: () => void;
  onClose: () => void;
  isGrabbed: boolean;
  isDragging: boolean;
}

export function ApparatusMenu({ 
  apparatusName, 
  onGrab, 
  onPour, 
  onDrag,
  onRelease, 
  onClose,
  isGrabbed,
  isDragging
}: ApparatusMenuProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <Card className="bg-slate-900/95 border-cyan-500/50 p-6 min-w-[300px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-cyan-400">
                {apparatusName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={onDrag}
                className={`w-full ${
                  isDragging
                    ? 'bg-yellow-700 hover:bg-yellow-800'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isDragging ? '🔒 Stop Dragging' : '🖐️ Start Drag'}
              </Button>
              
              <Button
                onClick={onPour}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                💧 Pour
              </Button>
              
              <Button
                onClick={onRelease}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                ✋ Release
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
