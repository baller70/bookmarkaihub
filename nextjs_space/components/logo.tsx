"use client"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

// Main Logo: "BookmarkAI" + [bookmark icon as H] + "ub"
export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { width: 160, height: 32, fontSize: 24, iconScale: 0.55 },
    md: { width: 180, height: 38, fontSize: 28, iconScale: 0.65 },
    lg: { width: 240, height: 50, fontSize: 36, iconScale: 0.8 },
  }

  const { width, height, fontSize, iconScale } = sizes[size]

  return (
    <div className={`flex items-center ${className}`} style={{ height }}>
      {/* BookmarkAI text */}
      <span 
        style={{ 
          fontSize: `${fontSize}px`, 
          fontWeight: 700, 
          color: '#3d4f5f',
          letterSpacing: '-0.5px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        className="dark:text-gray-100"
      >
        BookmarkAI
      </span>
      
      {/* Bookmark Icon (replacing the H) */}
      <svg
        width={height * iconScale}
        height={height}
        viewBox="0 0 40 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: '0 -2px' }}
      >
        {/* Left blue curve */}
        <path
          d="M6 4 C6 4, 4 24, 6 42 C6.5 46, 9 47, 12 44 L18 34"
          stroke="#7eb8da"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Right blue curve */}
        <path
          d="M34 4 C34 4, 36 24, 34 42 C33.5 46, 31 47, 28 44 L22 34"
          stroke="#7eb8da"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Center golden bookmark */}
        <path
          d="M12 2 L12 40 L20 31 L28 40 L28 2 Z"
          fill="#d4a84b"
        />
      </svg>
      
      {/* ub text */}
      <span 
        style={{ 
          fontSize: `${fontSize}px`, 
          fontWeight: 700, 
          color: '#3d4f5f',
          letterSpacing: '-0.5px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        className="dark:text-gray-100"
      >
        ub
      </span>
    </div>
  )
}

// Compact version for sidebar
export function LogoCompact({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`} style={{ height: 32 }}>
      {/* BookmarkAI text */}
      <span 
        style={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          color: '#3d4f5f',
          letterSpacing: '-0.3px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        className="dark:text-gray-100"
      >
        BookmarkAI
      </span>
      
      {/* Bookmark Icon (the H) */}
      <svg
        width={20}
        height={28}
        viewBox="0 0 40 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: '0 -1px' }}
      >
        {/* Left blue curve */}
        <path
          d="M6 4 C6 4, 4 24, 6 42 C6.5 46, 9 47, 12 44 L18 34"
          stroke="#7eb8da"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Right blue curve */}
        <path
          d="M34 4 C34 4, 36 24, 34 42 C33.5 46, 31 47, 28 44 L22 34"
          stroke="#7eb8da"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Center golden bookmark */}
        <path
          d="M12 2 L12 40 L20 31 L28 40 L28 2 Z"
          fill="#d4a84b"
        />
      </svg>
      
      {/* ub text */}
      <span 
        style={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          color: '#3d4f5f',
          letterSpacing: '-0.3px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        className="dark:text-gray-100"
      >
        ub
      </span>
    </div>
  )
}

// Dark mode version
export function LogoDark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`} style={{ height: 32 }}>
      {/* BookmarkAI text */}
      <span 
        style={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          color: '#e2e8f0',
          letterSpacing: '-0.3px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        BookmarkAI
      </span>
      
      {/* Bookmark Icon (the H) */}
      <svg
        width={20}
        height={28}
        viewBox="0 0 40 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: '0 -1px' }}
      >
        {/* Left blue curve */}
        <path
          d="M6 4 C6 4, 4 24, 6 42 C6.5 46, 9 47, 12 44 L18 34"
          stroke="#93c5fd"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Right blue curve */}
        <path
          d="M34 4 C34 4, 36 24, 34 42 C33.5 46, 31 47, 28 44 L22 34"
          stroke="#93c5fd"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Center golden bookmark */}
        <path
          d="M12 2 L12 40 L20 31 L28 40 L28 2 Z"
          fill="#eab308"
        />
      </svg>
      
      {/* ub text */}
      <span 
        style={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          color: '#e2e8f0',
          letterSpacing: '-0.3px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        ub
      </span>
    </div>
  )
}

// Icon only version for favicon/small spaces
export function LogoIcon({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left blue ribbon */}
      <path
        d="M8 4 C8 4, 6 26, 8 44 C8.5 48, 11 49, 14 46 L20 34"
        stroke="#7eb8da"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right blue ribbon */}
      <path
        d="M40 4 C40 4, 42 26, 40 44 C39.5 48, 37 49, 34 46 L28 34"
        stroke="#7eb8da"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Center golden bookmark */}
      <path
        d="M14 2 L14 44 L24 34 L34 44 L34 2 Z"
        fill="#d4a84b"
      />
    </svg>
  )
}
