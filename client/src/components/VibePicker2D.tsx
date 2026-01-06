import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { getVibeQuadrant, QUADRANT_LABELS } from "@/lib/questions";

interface VibePicker2DProps {
  onValueChange: (depth: number, heart: number) => void;
  initialDepth?: number;
  initialHeart?: number;
}

export default function VibePicker2D({ 
  onValueChange, 
  initialDepth = 0, 
  initialHeart = 0 
}: VibePicker2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialDepth, y: initialHeart });
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Sync with props when not dragging
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: initialDepth, y: initialHeart });
    }
  }, [initialDepth, initialHeart, isDragging]);

  const quadrant = getVibeQuadrant(position.x, position.y);
  const quadrantInfo = QUADRANT_LABELS[quadrant];

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 200 - 100;
    const y = -(((clientY - rect.top) / rect.height) * 200 - 100);
    
    const clampedX = Math.max(-100, Math.min(100, x));
    const clampedY = Math.max(-100, Math.min(100, y));
    
    setPosition({ x: clampedX, y: clampedY });
  }, []);

  const commitValue = useCallback(() => {
    const finalX = Math.round(positionRef.current.x);
    const finalY = Math.round(positionRef.current.y);
    onValueChange(finalX, finalY);
  }, [onValueChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handleClick = (e: React.MouseEvent) => {
    updatePosition(e.clientX, e.clientY);
    setTimeout(() => {
      setIsDragging(false);
      commitValue();
    }, 0);
  };

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    commitValue();
  }, [commitValue]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    commitValue();
  }, [commitValue]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [updatePosition]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const pointX = ((position.x + 100) / 200) * 100;
  const pointY = ((-position.y + 100) / 200) * 100;

  return (
    <div className="space-y-4">
      <div className="relative select-none" data-testid="vibe-picker-2d">
        <div className="text-center text-sm text-muted-foreground mb-2 font-medium">
          HEART (Emotional)
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground font-medium w-12 text-right">
            LIGHT
          </div>
          
          <div 
            ref={containerRef}
            className="relative flex-1 aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/20 cursor-crosshair touch-none"
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-0 w-[1px] bg-white/30 left-1/2" />
            <div className="absolute inset-0 h-[1px] bg-white/30 top-1/2" />
            
            <div className="absolute top-3 left-3 text-xs text-muted-foreground/70 font-medium">
              Playful<br/>&amp; Warm
            </div>
            <div className="absolute top-3 right-3 text-xs text-muted-foreground/70 font-medium text-right">
              Deep<br/>&amp; Intimate
            </div>
            <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/70 font-medium">
              Playful<br/>&amp; Curious
            </div>
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/70 font-medium text-right">
              Deep<br/>&amp; Philosophical
            </div>

            <motion.div
              className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-white shadow-lg shadow-white/30 border-2 border-white/50"
              style={{ 
                left: `${pointX}%`, 
                top: `${pointY}%`,
              }}
              animate={{
                scale: isDragging ? 1.2 : 1,
                boxShadow: isDragging 
                  ? "0 0 20px rgba(255,255,255,0.5)" 
                  : "0 4px 6px rgba(255,255,255,0.3)"
              }}
              transition={{ duration: 0.15 }}
              data-testid="vibe-picker-point"
            />
          </div>
          
          <div className="text-sm text-muted-foreground font-medium w-12">
            DEEP
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-2 font-medium">
          HEAD (Intellectual)
        </div>
      </div>

      <motion.div 
        key={quadrant}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <div 
          className="inline-block px-5 py-2 rounded-full font-semibold text-sm bg-white/10 text-white border border-white/20"
          data-testid="text-quadrant-label"
        >
          {quadrantInfo.name}
        </div>
        <p className="text-xs text-muted-foreground">
          {quadrantInfo.description}
        </p>
      </motion.div>
    </div>
  );
}
