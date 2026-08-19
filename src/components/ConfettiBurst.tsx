const PIECES: { tx: string; ty: string; color: string; delay: string }[] = [
  { tx: "-60px", ty: "-70px", color: "bg-teal-500", delay: "0ms" },
  { tx: "50px", ty: "-80px", color: "bg-violet-500", delay: "40ms" },
  { tx: "-80px", ty: "10px", color: "bg-amber-400", delay: "80ms" },
  { tx: "80px", ty: "0px", color: "bg-teal-400", delay: "60ms" },
  { tx: "-30px", ty: "80px", color: "bg-violet-400", delay: "120ms" },
  { tx: "40px", ty: "75px", color: "bg-amber-500", delay: "20ms" },
  { tx: "0px", ty: "-95px", color: "bg-teal-600", delay: "100ms" },
  { tx: "-95px", ty: "-20px", color: "bg-violet-600", delay: "140ms" },
];

/**
 * Reduced-motion users never see this: the animation class only exists
 * inside globals.css's `prefers-reduced-motion: no-preference` block, so
 * without it the pieces just render as a static, invisible-under-the-icon
 * cluster of dots — no separate JS check needed.
 */
export function ConfettiBurst() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {PIECES.map((piece, i) => (
        <span
          key={i}
          className={`animate-confetti-burst absolute h-2.5 w-2.5 rounded-full ${piece.color}`}
          style={
            {
              "--tx": piece.tx,
              "--ty": piece.ty,
              animationDelay: piece.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
