
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}

// --- COLOR MATH HELPERS ---

const hexToHsv = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0; 
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToHex = (h: number, s: number, v: number) => {
  let r, g, b;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s / 100);
  const q = v * (1 - f * s / 100);
  const t = v * (1 - (1 - f) * s / 100);
  v = v / 100; // Normalize back for calc but logic above used 0-100 range inputs, correcting:
  
  // Re-calc using 0-1 inputs for S and V locally
  const sNorm = s / 100;
  const vNorm = v; // v was divided by 100
  
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;

  let r1 = 0, g1 = 0, b1 = 0;
  if (0 <= h && h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (60 <= h && h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (120 <= h && h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (180 <= h && h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (240 <= h && h < 300) { r1 = x; g1 = 0; b1 = c; }
  else if (300 <= h && h < 360) { r1 = c; g1 = 0; b1 = x; }

  const rFinal = Math.round((r1 + m) * 255).toString(16).padStart(2, '0');
  const gFinal = Math.round((g1 + m) * 255).toString(16).padStart(2, '0');
  const bFinal = Math.round((b1 + m) * 255).toString(16).padStart(2, '0');

  return `#${rFinal}${gFinal}${bFinal}`;
};

export default function ColorPicker({ color, onChange, label }: Props) {
  // Initialize HSV state from props
  const [hsv, setHsv] = useState(hexToHsv(color));
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingBox, setIsDraggingBox] = useState(false);

  const wheelRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Update internal state when prop changes externally (e.g. presets)
  useEffect(() => {
    setHsv(hexToHsv(color));
  }, [color]);

  // --- HUE WHEEL LOGIC ---
  const handleHueMove = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 to align with CSS conic gradient top start
    if (angle < 0) angle += 360;
    
    const newHsv = { ...hsv, h: angle };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  }, [hsv, onChange]);

  // --- SATURATION/VALUE BOX LOGIC ---
  const handleBoxMove = useCallback((clientX: number, clientY: number) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Clamp
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;

    const newHsv = { ...hsv, s, v };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  }, [hsv, onChange]);

  // --- GLOBAL EVENT LISTENERS FOR DRAGGING ---
  useEffect(() => {
    const handleUp = () => {
      setIsDraggingHue(false);
      setIsDraggingBox(false);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      if (isDraggingHue) {
        e.preventDefault(); // Prevent scroll on mobile
        handleHueMove(clientX, clientY);
      }
      if (isDraggingBox) {
        e.preventDefault();
        handleBoxMove(clientX, clientY);
      }
    };

    if (isDraggingHue || isDraggingBox) {
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('touchmove', handleMove, { passive: false });
    }

    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [isDraggingHue, isDraggingBox, handleHueMove, handleBoxMove]);

  // --- STYLES CALCULATIONS ---
  // Handle position on ring
  const ringRadius = 50; // percentage
  const handleAngleRad = (hsv.h - 90) * (Math.PI / 180);
  // We push the handle out to the edge of the container
  // radius is roughly 50% - padding
  const handleX = 50 + 42 * Math.cos(handleAngleRad); 
  const handleY = 50 + 42 * Math.sin(handleAngleRad);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <p className="text-xs font-black text-green-600/70 uppercase tracking-wide">{label}</p>
      
      <div 
        className="relative w-40 h-40 md:w-48 md:h-48"
        onMouseDown={() => { /* Prevent default drag behavior */ }}
      >
        {/* 1. HUE RING */}
        <div 
          ref={wheelRef}
          className="absolute inset-0 rounded-full cursor-crosshair shadow-lg"
          style={{
            background: `conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)`,
            // Mask to create donut
            mask: 'radial-gradient(transparent 58%, black 59%)',
            WebkitMask: 'radial-gradient(transparent 58%, black 59%)'
          }}
          onMouseDown={(e) => { setIsDraggingHue(true); handleHueMove(e.clientX, e.clientY); }}
          onTouchStart={(e) => { setIsDraggingHue(true); handleHueMove(e.touches[0].clientX, e.touches[0].clientY); }}
        />

        {/* Hue Handle */}
        <div 
          className="absolute w-5 h-5 rounded-full border-2 border-white bg-transparent shadow-[0_0_5px_rgba(0,0,0,0.5)] pointer-events-none transition-transform duration-75"
          style={{
            left: `${handleX}%`,
            top: `${handleY}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: hsvToHex(hsv.h, 100, 100)
          }}
        />

        {/* 2. SATURATION/VALUE BOX (Center) */}
        <div 
          ref={boxRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl overflow-hidden cursor-crosshair shadow-inner border border-gray-200"
          style={{ backgroundColor: hsvToHex(hsv.h, 100, 100) }}
          onMouseDown={(e) => { setIsDraggingBox(true); handleBoxMove(e.clientX, e.clientY); }}
          onTouchStart={(e) => { setIsDraggingBox(true); handleBoxMove(e.touches[0].clientX, e.touches[0].clientY); }}
        >
           {/* White Gradient (Left to Right) */}
           <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
           {/* Black Gradient (Bottom to Top) */}
           <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

           {/* SB Handle */}
           <div 
             className="absolute w-4 h-4 rounded-full border-2 border-white shadow-sm pointer-events-none"
             style={{
               left: `${hsv.s}%`,
               top: `${100 - hsv.v}%`,
               transform: 'translate(-50%, -50%)',
               backgroundColor: color
             }}
           />
        </div>
      </div>

      {/* Hex Output */}
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm mt-1">
         <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
         <span className="text-xs font-mono font-bold text-gray-600 uppercase">{color}</span>
      </div>
    </div>
  );
}
