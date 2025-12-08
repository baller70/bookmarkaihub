"use client"

import { useState, useCallback } from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface FallbackImageProps extends Omit<ImageProps, 'onError'> {
  fallbackText?: string
  fallbackClassName?: string
  containerClassName?: string
}

/**
 * Image component with built-in error handling and fallback
 * Shows a letter-based fallback when the image fails to load
 */
export function FallbackImage({
  src,
  alt,
  fallbackText,
  fallbackClassName,
  containerClassName,
  className,
  fill,
  width,
  height,
  ...props
}: FallbackImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Get fallback letter from alt text or fallbackText
  const fallbackLetter = (fallbackText || alt || "?").charAt(0).toUpperCase()

  // If there's an error or no src, show fallback
  if (hasError || !src) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold uppercase",
          fallbackClassName || className
        )}
        style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
      >
        {fallbackLetter}
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div 
          className={cn(
            "flex items-center justify-center bg-gray-100 animate-pulse",
            containerClassName
          )}
          style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn(className, isLoading && "opacity-0")}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  )
}

export default FallbackImage

