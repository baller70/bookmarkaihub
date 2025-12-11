'use client'

import { useState, useEffect } from 'react'
import { Command, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OracleChat } from './oracle-chat'

interface OracleTriggerProps {
  className?: string
}

// Animated Blob/Orb Component - Siri-like design
function AnimatedBlob({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="relative w-24 h-24">
      {/* Outer glow */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-xl transition-all duration-700",
        isHovered 
          ? "bg-gradient-to-r from-purple-500/60 via-pink-500/60 to-blue-500/60 scale-150" 
          : "bg-gradient-to-r from-purple-500/40 via-indigo-500/40 to-blue-500/40 scale-100"
      )} />
      
      {/* Middle glow layer */}
      <div className={cn(
        "absolute inset-1 rounded-full blur-md transition-all duration-500",
        isHovered
          ? "bg-gradient-to-tr from-pink-500/50 via-purple-500/50 to-cyan-500/50"
          : "bg-gradient-to-tr from-indigo-500/40 via-purple-500/40 to-pink-500/40"
      )} />
      
      {/* Core blob */}
      <div className={cn(
        "absolute inset-2 rounded-full transition-all duration-300 shadow-lg",
        "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600",
        isHovered ? "animate-blob-fast" : "animate-blob"
      )}>
        {/* Inner shine */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30" />
      </div>
      
      {/* Floating particles */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/70 animate-float"
              style={{
                left: `${15 + i * 20}%`,
                top: `${20 + (i % 2) * 50}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + i * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Online indicator */}
      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-900 z-10">
        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
      </div>
    </div>
  )
}

export function OracleTrigger({ className }: OracleTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Global keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Floating Blob Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed bottom-8 right-8 z-50 group",
          "flex flex-col items-center gap-2",
          "transition-all duration-300",
          isHovered && "scale-105",
          className
        )}
      >
        {/* Label above the blob - always visible */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 dark:bg-white/90 backdrop-blur-sm">
          <span className="text-xs font-semibold text-white dark:text-gray-900 uppercase tracking-wide">
            Ask Oracle
          </span>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/20 dark:bg-black/10 text-[10px] text-white/80 dark:text-gray-700">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
        
        {/* The Blob */}
        <AnimatedBlob isHovered={isHovered} />
      </button>

      {/* Oracle Chat Panel */}
      <OracleChat isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
          }
          75% {
            border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%;
          }
        }
        
        @keyframes blob-fast {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: scale(1.05);
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
            transform: scale(0.98);
          }
          75% {
            border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%;
            transform: scale(1.03);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.7;
          }
          25% {
            transform: translateY(-15px) translateX(8px);
            opacity: 1;
          }
          50% {
            transform: translateY(-8px) translateX(-8px);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-20px) translateX(4px);
            opacity: 0.9;
          }
        }
        
        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }
        
        .animate-blob-fast {
          animation: blob-fast 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

// Compact trigger for sidebar - also with mini blob
export function OracleTriggerCompact({ className }: OracleTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full",
          "bg-purple-50 dark:bg-purple-900/20",
          "hover:bg-purple-100 dark:hover:bg-purple-900/40",
          "transition-all duration-200",
          className
        )}
      >
        {/* Mini blob */}
        <div className="relative w-8 h-8 flex-shrink-0">
          <div className={cn(
            "absolute inset-0 rounded-full blur-sm transition-all duration-300",
            isHovered 
              ? "bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-blue-500/50" 
              : "bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-blue-500/30"
          )} />
          <div className={cn(
            "absolute inset-1 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center transition-all duration-300",
            isHovered ? "animate-blob-fast" : ""
          )}>
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-purple-50 dark:border-purple-900" />
        </div>
        
        <span className="flex-1 text-sm font-medium text-purple-700 dark:text-purple-400 text-left">
          Ask Oracle
        </span>
        
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-200/50 dark:bg-purple-800/50 text-[10px] text-purple-600 dark:text-purple-300">
          <Command className="h-2.5 w-2.5" />
          <span>K</span>
        </div>
      </button>

      <OracleChat isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50% { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
          75% { border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%; }
        }
        @keyframes blob-fast {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1); }
          50% { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; transform: scale(1.05); }
        }
        .animate-blob { animation: blob 8s ease-in-out infinite; }
        .animate-blob-fast { animation: blob-fast 1.5s ease-in-out infinite; }
      `}</style>
    </>
  )
}

// Search bar trigger with blob
export function OracleSearchTrigger({ className }: OracleTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl w-full max-w-md mx-auto",
          "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700",
          "hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md",
          "transition-all group",
          className
        )}
      >
        {/* Mini blob */}
        <div className="relative w-8 h-8 flex-shrink-0">
          <div className={cn(
            "absolute inset-0 rounded-full blur-sm transition-all duration-300",
            isHovered 
              ? "bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-blue-500/50" 
              : "bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-blue-500/30"
          )} />
          <div className={cn(
            "absolute inset-1 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center",
            isHovered ? "animate-blob-fast" : ""
          )}>
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
        
        <span className="flex-1 text-left text-sm text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300">
          Ask The Oracle anything...
        </span>
        
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-xs text-gray-500 dark:text-slate-400">
          <Command className="h-3 w-3" />
          <span>K</span>
        </div>
      </button>

      <OracleChat isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <style jsx global>{`
        @keyframes blob-fast {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1); }
          50% { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; transform: scale(1.05); }
        }
        .animate-blob-fast { animation: blob-fast 1.5s ease-in-out infinite; }
      `}</style>
    </>
  )
}
