import { useEffect, useRef, useState, useCallback } from 'react';

const INTERACTIVE_SELECTORS = 'a, button, [data-magnetic], input, textarea, select, label, [role="button"]';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const rafRef = useRef<number>(0);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
    if (!isVisible) setIsVisible(true);

    // Check if hovering over interactive element
    const target = e.target as HTMLElement;
    const isInteractive = target.closest(INTERACTIVE_SELECTORS);
    setIsHovering(!!isInteractive);

    // Set CSS vars for volumetric lighting
    const xPct = (e.clientX / window.innerWidth) * 100;
    const yPct = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', `${xPct}%`);
    document.documentElement.style.setProperty('--mouse-y', `${yPct}%`);
  }, [isVisible]);

  // Smooth ring follower using requestAnimationFrame
  const animateRing = useCallback(() => {
    ringPos.current.x += (mouseRef.current.x - ringPos.current.x) * 0.08;
    ringPos.current.y += (mouseRef.current.y - ringPos.current.y) * 0.08;

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${mouseRef.current.x}px, ${mouseRef.current.y}px)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
    }

    rafRef.current = requestAnimationFrame(animateRing);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    rafRef.current = requestAnimationFrame(animateRing);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Handle click effect
    const handleMouseDown = () => {
      if (cursorRef.current) cursorRef.current.classList.add('is-clicking');
    };
    const handleMouseUp = () => {
      if (cursorRef.current) cursorRef.current.classList.remove('is-clicking');
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isTouchDevice, handleMouseMove, animateRing]);

  // Hover class sync
  useEffect(() => {
    if (!cursorRef.current || !ringRef.current) return;
    cursorRef.current.classList.toggle('is-hovering', isHovering);
    ringRef.current.classList.toggle('is-hovering', isHovering);
  }, [isHovering]);

  if (isTouchDevice) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{ opacity: isVisible ? 1 : 0 }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{ opacity: isVisible ? 1 : 0 }}
        aria-hidden="true"
      />
    </>
  );
}
