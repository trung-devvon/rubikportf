// lib/gsap.ts — GSAP initialization & plugin registration
// Import this ONCE at the app entry point (App.tsx or main.tsx)

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

// Register all plugins we'll use in this project
gsap.registerPlugin(ScrollTrigger, Flip)

// Global GSAP defaults
gsap.defaults({
  ease: 'power3.inOut',
  duration: 0.85,
})

// Export for use throughout the app
export { gsap, ScrollTrigger, Flip }
