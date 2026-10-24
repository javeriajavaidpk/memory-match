# MemoryMatch AI — Production Cognitive Arena

MemoryMatch AI is a production-grade, accessible, mobile-first frontend web application featuring real-time AI cognitive performance analysis and procedural level scaling. Built with Next.js 16, React 19, and Tailwind CSS.

- **Live Production URL**: https://memory-match-gamma-eight.vercel.app/
- **Repository**: https://github.com/javeriajavaidpk/memory-match

## Key Features
- **Procedural Infinite Levels**: Dynamically generates unique 16-card emoji matrices across infinite progressive levels.
- **Embedded AI Cognitive Coach**: Next.js API route (`/api/ai-coach`) that evaluates move efficiency, retrieval latency, and spatial memory recall.
- **Tactile Mobile UX**: Native device haptic feedback integration, fluid touch controls, and dark-mode styling.
- **WCAG 2.1 AA Accessibility**: Semantic keyboard navigability, high-contrast states, and dynamic `aria-label` screen-reader states.
- **Resilience Engine**: Safe fallback boundaries ensure zero UI freezes even under network disruption.

## Tech Stack
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Library**: React 19
- **Styling**: Tailwind CSS
- **Deployment**: Vercel CI/CD

## Local Setup & Installation
```bash
# Clone the repository
git clone [https://github.com/javeriajavaidpk/memory-match.git](https://github.com/javeriajavaidpk/memory-match.git)
cd memory-card-game

# Install dependencies
npm install

# Run development server
npm run dev