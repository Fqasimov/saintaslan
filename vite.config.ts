import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Starts downloading the intro (Remotion player and the logo film) in parallel with
 * the main bundle, instead of after it: the curtain is up either way, and this is
 * the difference between the film starting at once and starting a beat late.
 */
function preloadIntro(): Plugin {
  return {
    name: 'preload-intro',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const intro = Object.values(ctx.bundle ?? {}).find(
          (c) => c.type === 'chunk' && c.facadeModuleId?.endsWith('components/Intro.tsx'),
        )
        if (!intro || intro.type !== 'chunk') return html
        const files = [intro.fileName, ...intro.imports]
        const tags = files.map((f) => `<link rel="modulepreload" crossorigin href="./${f}">`).join('\n    ')
        return html.replace('</head>', `    ${tags}\n  </head>`)
      },
    },
  }
}

// Relative base so dist/ can be served from any path or static host.
export default defineConfig({
  base: './',
  plugins: [react(), preloadIntro()],
})
