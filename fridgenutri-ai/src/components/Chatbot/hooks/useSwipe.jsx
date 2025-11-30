// src/components/Chatbot/hooks/useSwipe.jsx
import { useEffect } from 'react';

export function useSwipe(ref, { onSwipeLeft, onSwipeRight, threshold = 70 }) {
    useEffect(() => {
        if (!ref.current) return;

        let startX = null;

        const handleStart = (x) => {
            startX = x;
        };

        const handleEnd = (x) => {
            if (startX === null) return;
            const deltaX = x - startX;
            if (Math.abs(deltaX) >= threshold) {
                if (deltaX > 0) onSwipeLeft();
                else onSwipeRight();
            }
            startX = null;
        };

        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            handleStart(e.clientX);
        };

        const onMouseUp = (e) => handleEnd(e.clientX);

        const onTouchStart = (e) => {
            handleStart(e.touches[0].clientX);
        };

        const onTouchEnd = (e) => {
            handleEnd(e.changedTouches[0].clientX);
        };

        const prevent = (e) => e.preventDefault();

        const el = ref.current;

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('touchstart', onTouchStart, { passive: false });  // ← исправлено!
        el.addEventListener('touchend', onTouchEnd);
        el.addEventListener('selectstart', prevent);
        el.addEventListener('dragstart', prevent);

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchend', onTouchEnd);
            el.removeEventListener('selectstart', prevent);
            el.removeEventListener('dragstart', prevent);
        };
    }, [ref, onSwipeLeft, onSwipeRight, threshold]);
}