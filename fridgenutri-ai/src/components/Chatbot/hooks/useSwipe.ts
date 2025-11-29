// src/components/Chatbot/hooks/useSwipe.ts
import { useEffect } from 'react';

type SwipeConfig = {
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    threshold?: number; // minimum px to trigger swipe
};

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeConfig) {
    useEffect(() => {
        let startX: number | null = null;

        const preventDefault = (e: Event) => e.preventDefault();

        const handleStart = (x: number) => {
            startX = x;
        };

        const handleEnd = (x: number) => {
            if (startX === null) return;

            const deltaX = x - startX;
            const absDeltaX = Math.abs(deltaX);

            if (absDeltaX >= threshold) {
                if (deltaX > 0) {
                    onSwipeLeft();   // dragged left → next day
                } else {
                    onSwipeRight();  // dragged right → previous day
                }
            }

            startX = null;
        };

        // Mouse
        const onMouseDown = (e: MouseEvent) => {
            // Ignore right/middle clicks and if already dragging
            if (e.button !== 0) return;
            handleStart(e.clientX);
        };

        const onMouseUp = (e: MouseEvent) => {
            handleEnd(e.clientX);
        };

        // Touch
        const onTouchStart = (e: TouchEvent) => {
            handleStart(e.touches[0].clientX);
        };

        const onTouchEnd = (e: TouchEvent) => {
            handleEnd(e.changedTouches[0].clientX);
        };

        // Prevent text selection & image drag globally while swiping
        const onSelectStart = (e: Event) => e.preventDefault();
        const onDragStart = (e: DragEvent) => e.preventDefault();

        // Apply listeners
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });

        // Block selection & dragging
        document.addEventListener('selectstart', onSelectStart);
        document.addEventListener('dragstart', onDragStart);

        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('selectstart', onSelectStart);
            document.removeEventListener('dragstart', onDragStart);
        };
    }, [onSwipeLeft, onSwipeRight, threshold]);
}