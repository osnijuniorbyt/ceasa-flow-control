
import { useState, useRef, ReactNode } from "react";

interface SwipeHandlerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function SwipeHandler({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 50 
}: SwipeHandlerProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchEndY(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !touchStartY || !touchEndY) return;
    
    const distanceX = touchStart - touchEnd;
    const distanceY = Math.abs(touchStartY - touchEndY);
    
    // Só processa swipe horizontal se:
    // 1. O movimento horizontal for maior que o vertical (não é scroll vertical)
    // 2. O toque começou perto da borda esquerda (primeiros 50px)
    const isHorizontalSwipe = Math.abs(distanceX) > distanceY * 1.5;
    const startedFromEdge = touchStart < 50;
    
    if (!isHorizontalSwipe || !startedFromEdge) return;
    
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight && startedFromEdge) {
      onSwipeRight();
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="flex-1 touch-pan-x"
    >
      {children}
    </div>
  );
}
