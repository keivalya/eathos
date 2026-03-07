export default function EathosLogo({ size = 48, color = 'currentColor', bgColor, className = '' }) {
  const showBg = !!bgColor;
  const iconSize = size * 0.65;
  const radius = size * 0.3;

  return (
    <div
      className={`eathos-logo ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: showBg ? bgColor : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        width={showBg ? iconSize : size}
        height={showBg ? iconSize : size}
      >
        <path d="M24 44 L24 10" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M24 15 C24 15 17 13 16 10 C17 8 20 9 24 13Z" fill={color} />
        <path d="M24 21 C24 21 16 19 15 16 C16 14 19 15 24 19Z" fill={color} opacity="0.85" />
        <path d="M24 28 C24 28 15 26 14 23 C15.5 21 18.5 22 24 26Z" fill={color} opacity="0.7" />
        <path d="M24 35 C24 35 15 33 14 30 C15.5 28 18.5 29 24 33Z" fill={color} opacity="0.5" />
        <path d="M24 15 C24 15 31 13 32 10 C31 8 28 9 24 13Z" fill={color} />
        <path d="M24 21 C24 21 32 19 33 16 C32 14 29 15 24 19Z" fill={color} opacity="0.85" />
        <path d="M24 28 C24 28 33 26 34 23 C32.5 21 29.5 22 24 26Z" fill={color} opacity="0.7" />
        <path d="M24 35 C24 35 33 33 34 30 C32.5 28 29.5 29 24 33Z" fill={color} opacity="0.5" />
        <path d="M24 10 C24 10 20 7 21 4 C23 3 25.5 5 24 9Z" fill={color} opacity="0.6" />
        <path d="M24 10 C24 10 28 7 27 4 C25 3 22.5 5 24 9Z" fill={color} opacity="0.6" />
      </svg>
    </div>
  );
}
