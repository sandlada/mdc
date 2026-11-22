import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const DevAppRoot = fileURLToPath(new URL('.', import.meta.url))
const SrcRoot = fileURLToPath(new URL('../mdc/src', import.meta.url))
const MdcComponentsRoot = join(SrcRoot, 'components')

const VirtualManifestId = 'virtual:mdc-manifest'
const ResolvedManifestId = `\0${VirtualManifestId}`

const VirtualDemoLoadersId = 'virtual:mdc-demo-loaders'
const ResolvedDemoLoadersId = `\0${VirtualDemoLoadersId}`

const VirtualDemosPrefix = 'virtual:mdc-demos/'
const ResolvedDemosPrefix = `\0${VirtualDemosPrefix}`

interface ManifestEntry {
    name: string
    label: string
    href: string
    subtitle: string
    demoFiles: string
    custom: boolean
}

function titleCase(name: string): string {
    return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function readAttr(attrs: string, name: string): string | undefined {
    const match = new RegExp(`${name}="([^"]*)"`, 'i').exec(attrs)
    return match?.[1]
}

function collectManifest(devAppRoot: string): ManifestEntry[] {
    const compsDir = join(devAppRoot, 'components')
    if (!existsSync(compsDir)) return []

    const entries: ManifestEntry[] = []
    for (const folder of readdirSync(compsDir).sort()) {
        const htmlPath = join(compsDir, folder, 'index.html')
        if (!existsSync(htmlPath)) continue
        const html = readFileSync(htmlPath, 'utf8')
        const pageMatch = /<\s*mdc-docs-page\b([^>]*)>([\s\S]*?)<\s*\/\s*mdc-docs-page\s*>/i.exec(html)
        const attrs = pageMatch?.[1] ?? ''
        const inner = pageMatch?.[2]?.trim() ?? ''
        const name = readAttr(attrs, 'component') ?? folder
        const label = readAttr(attrs, 'title') ?? titleCase(folder)
        const subtitle = readAttr(attrs, 'subtitle') ?? ''
        const demoFiles = readAttr(attrs, 'demo-files') ?? ''
        const hasExtraTags = /<\s*style\b/i.test(html) || /<\s*script\b(?![^>]*\bsrc\s*=\s*"\/shared\/)/i.test(html)
        const custom = pageMatch === null || inner.length > 0 || hasExtraTags
        entries.push({
            name,
            label,
            href: `/components/${name}/`,
            subtitle,
            demoFiles,
            custom,
        })
    }
    return entries
}

function collectComponentDemos(componentsRoot: string, component: string): {
    demos: Record<string, string>
    tags: string[]
} {
    const demoDir = join(componentsRoot, component, 'demo')
    const demos: Record<string, string> = {}
    const tagSet = new Set<string>()
    if (!existsSync(demoDir)) {
        return { demos, tags: [] }
    }

    const tagRe = /<\/?(mdc-[a-z0-9-]+)\b/gi
    for (const file of readdirSync(demoDir).sort()) {
        if (!file.endsWith('.demo.html')) continue
        const content = readFileSync(join(demoDir, file), 'utf8')
        demos[file] = content
        tagRe.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = tagRe.exec(content)) !== null) {
            tagSet.add(match[1].toLowerCase())
        }
    }
    return { demos, tags: [...tagSet].sort() }
}

function collectDemoLoadersModule(componentsRoot: string): string {
    const demoFiles: Record<string, string[]> = {}
    const loaderEntries: string[] = []

    if (existsSync(componentsRoot)) {
        for (const folder of readdirSync(componentsRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
            if (!folder.isDirectory()) continue
            const demoDir = join(componentsRoot, folder.name, 'demo')
            if (!existsSync(demoDir)) continue
            const files = readdirSync(demoDir).filter((f) => f.endsWith('.demo.html')).sort()
            if (files.length === 0) continue
            demoFiles[folder.name] = files
            loaderEntries.push(`  ${JSON.stringify(folder.name)}: () => import(${JSON.stringify(`${VirtualDemosPrefix}${folder.name}`)})`)
        }
    }

    return [
        `export const DemoFiles = ${JSON.stringify(demoFiles)}`,
        `export const DemoLoaders = {\n${loaderEntries.join(',\n')}\n}`,
    ].join('\n')
}

function invalidateVirtual(server: ViteDevServer, id: string): void {
    const mod = server.moduleGraph.getModuleById(id)
    if (mod !== undefined) {
        server.moduleGraph.invalidateModule(mod)
    }
}

function mdcDevAppPlugin(devAppRoot: string, componentsRoot: string): Plugin {
    return {
        name: 'sandlada-mdc-dev-app',
        resolveId(id) {
            if (id === VirtualManifestId) return ResolvedManifestId
            if (id === VirtualDemoLoadersId) return ResolvedDemoLoadersId
            if (id.startsWith(VirtualDemosPrefix)) return `\0${id}`
            return null
        },
        load(id) {
            if (id === ResolvedManifestId) {
                return `export const Components = ${JSON.stringify(collectManifest(devAppRoot))}`
            }
            if (id === ResolvedDemoLoadersId) {
                return collectDemoLoadersModule(componentsRoot)
            }
            if (id.startsWith(ResolvedDemosPrefix)) {
                const component = id.slice(ResolvedDemosPrefix.length)
                const { demos, tags } = collectComponentDemos(componentsRoot, component)
                return `export const demos = ${JSON.stringify(demos)}\nexport const tags = ${JSON.stringify(tags)}`
            }
            return null
        },
        configureServer(server) {
            server.watcher.add([join(devAppRoot, 'components'), componentsRoot])

            const onFsEvent = (event: 'add' | 'change' | 'unlink', filePath: string) => {
                const normalized = filePath.replace(/\\/g, '/')
                const relFromDemos = relative(componentsRoot, filePath).replace(/\\/g, '/')

                if (normalized.endsWith('.demo.html')) {
                    const comp = relFromDemos.split('/')[0]
                    if (comp) {
                        invalidateVirtual(server, `${ResolvedDemosPrefix}${comp}`)
                        if (event !== 'change') {
                            invalidateVirtual(server, ResolvedDemoLoadersId)
                        }
                        server.ws.send({ type: 'full-reload' })
                    }
                    return
                }

                if (normalized.includes('/packages/dev-app/components/') && normalized.endsWith('/index.html')) {
                    invalidateVirtual(server, ResolvedManifestId)
                    server.ws.send({ type: 'full-reload' })
                }
            }

            server.watcher.on('add', (p) => onFsEvent('add', p))
            server.watcher.on('change', (p) => onFsEvent('change', p))
            server.watcher.on('unlink', (p) => onFsEvent('unlink', p))
        },
    }
}

// Collect every components/*/index.html + the root index.html for Vite MPA mode.
function collectHtmlInputs(devAppRoot: string): Record<string, string> {
    const inputs: Record<string, string> = {
        main: join(devAppRoot, 'index.html'),
        'form-qa': join(devAppRoot, 'form-qa.html'),
    }
    const compsDir = join(devAppRoot, 'components')
    for (const name of readdirSync(compsDir)) {
        const file = join(compsDir, name, 'index.html')
        if (existsSync(file)) {
            inputs[`components/${name}/index`] = file
        }
    }
    return inputs
}

export default defineConfig(({ command }) => ({
    plugins: [mdcDevAppPlugin(DevAppRoot, MdcComponentsRoot)],
    resolve: {
        alias: [
            { find: '@sandlada/mdc/all', replacement: `${SrcRoot}/all.ts` },
            { find: '@sandlada/mdc/definitions', replacement: `${SrcRoot}/definitions.ts` },
            { find: '@sandlada/mdc/utils/context-provider', replacement: `${SrcRoot}/utils/context-provider/index.ts` },
            { find: '@sandlada/mdc/utils', replacement: `${SrcRoot}/utils.ts` },
            { find: /^@sandlada\/mdc\/(.*)/, replacement: `${SrcRoot}/$1` },
        ],
    },
    optimizeDeps: {
        include: [
            'lit',
            'lit/decorators.js',
            'lit/directives/unsafe-html.js',
            '@lit/context',
            'rxjs',
            '@sandlada/mdk',
            '@sandlada/breakpoint',
        ],
    },
    server: {
        watch: {
            ignored: [
                '**/*.spec.ts',
                '**/*.dom.spec.ts',
                '**/dist/**',
                '**/coverage/**',
            ],
        },
    },
    build: command === 'build' ? {
        rollupOptions: {
            input: collectHtmlInputs(DevAppRoot),
        },
    } : undefined,
}))
