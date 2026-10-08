import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'

const mdcSrc = fileURLToPath(new URL('../mdc/src', import.meta.url))
const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url))

/**
 * Watch the library source recursively so `import.meta.glob` consumers (the
 * component registry and the live demo snippets) pick up `add`/`unlink`
 * events for newly created or deleted `.demo.html` files without a restart.
 * Mirrors the dev-app showcase's `watchMdcSrc` plugin.
 */
function watchMdcSrc() {
    return {
        name: 'sandlada-mdc-watch-src',
        configureServer(server) {
            server.watcher.add(mdcSrc)
        },
    }
}

export default defineConfig({
    site: 'https://mdc.sandlada.com',
    integrations: [mdx({}), sitemap()],
    markdown: {
        shikiConfig: {
            themes: {
                light: "github-light",
                dark: "github-dark",
            },
            defaultColor: false,
        },
    },
    output: 'static',
    devToolbar: { enabled: false, },
    vite: {
        plugins: [watchMdcSrc(), tailwindcss()],
        resolve: {
            alias: [{ find: /^@sandlada\/mdc\/(.*)/, replacement: `${mdcSrc}/$1` }],
        },
        server: {
            fs: {
                allow: [workspaceRoot],
            },
        },
    },
})
