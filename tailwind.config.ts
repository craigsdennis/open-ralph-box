import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neural-black': '#0a0a0a',
        'command-bg': '#111111',
        'panel-surface': '#151515',
        'elevated-surface': '#1a1a1a',
        'cf-orange': '#FF6B35',
        'cf-orange-glow': 'rgba(255, 107, 53, 0.15)',
        'electric-blue': '#00D4FF',
        'terminal-green': '#00FF9F',
        'grid-line': 'rgba(255, 107, 53, 0.08)',
        'circuit-line': 'rgba(255, 107, 53, 0.12)',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
} satisfies Config;
