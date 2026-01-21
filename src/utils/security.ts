/**
 * Security utilities for VibeOps applications
 *
 * This file is a placeholder for security-related utilities.
 * Add your security helpers here as needed.
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if a URL is safe (https only)
 */
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}
