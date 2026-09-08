/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export interface VariantTrigger {
    readonly name?: string
    readonly selector: string
}

/**
 * Registry holding mappings from variant names to concrete mount selector strings.
 *
 * 对称于 `StateTriggerRegistry`，但值是完整挂载选择器（例如 `.container.fill`、
 * `:host(.tonal)`、`:host([variant="outlined"])`），而非状态式的 modifier 片段。
 * 无内置默认、无启发式回退：未映射的变体名 `resolve` 返回 `undefined`
 *（编译层严格丢弃 [D]）。
 */
export class VariantTriggerRegistry {
    private readonly selectors: Map<string, string>

    public constructor(
        initial?: Record<string, string | VariantTrigger> | (Record<string, string | VariantTrigger> | VariantTrigger)[]
    ) {
        this.selectors = new Map<string, string>()
        if (initial) {
            this.registerAll(initial)
        }
    }

    /**
     * Registers a single variant mount selector or trigger object.
     */
    public register(nameOrMapping: string | VariantTrigger | Record<string, string | VariantTrigger>, selector?: string): this {
        if (typeof nameOrMapping === 'string') {
            this.selectors.set(nameOrMapping, (selector ?? '').trim())
        } else if (nameOrMapping && typeof nameOrMapping === 'object') {
            if ('name' in nameOrMapping && typeof (nameOrMapping as VariantTrigger).name === 'string') {
                const trigger = nameOrMapping as VariantTrigger
                this.selectors.set(trigger.name!, trigger.selector.trim())
            } else {
                this.registerAll(nameOrMapping as Record<string, string | VariantTrigger>)
            }
        }
        return this
    }

    /**
     * Registers a batch of variant triggers or selector strings.
     */
    public registerAll(
        triggers: Record<string, string | VariantTrigger> | (Record<string, string | VariantTrigger> | VariantTrigger)[]
    ): this {
        if (!triggers) {
            return this
        }

        if (Array.isArray(triggers)) {
            for (const item of triggers) {
                if (!item) {
                    continue
                }
                if ('name' in item && typeof (item as VariantTrigger).name === 'string') {
                    this.register(item as VariantTrigger)
                } else if (typeof item === 'object') {
                    this.registerAll(item as Record<string, string | VariantTrigger>)
                }
            }
            return this
        }

        for (const [variantName, triggerOrSelector] of Object.entries(triggers)) {
            if (triggerOrSelector === null || triggerOrSelector === undefined) {
                continue
            }

            if (typeof triggerOrSelector === 'string') {
                this.selectors.set(variantName, triggerOrSelector.trim())
            } else if (typeof triggerOrSelector === 'object') {
                const sel = 'selector' in triggerOrSelector ? triggerOrSelector.selector : ''
                this.selectors.set(variantName, sel.trim())
                if ('name' in triggerOrSelector && triggerOrSelector.name && triggerOrSelector.name !== variantName) {
                    this.selectors.set(triggerOrSelector.name, sel.trim())
                }
            }
        }

        return this
    }

    /**
     * Retrieves a registered mount selector by variant name.
     */
    public get(name: string): string | undefined {
        return this.selectors.get(name)
    }

    /**
     * Alias for `get(name)`.
     */
    public getTrigger(name: string): string | undefined {
        return this.get(name)
    }

    /**
     * Checks if a mount selector exists for the given variant name.
     */
    public has(name: string): boolean {
        return this.selectors.has(name)
    }

    /**
     * Resolves a variant name to its mount selector. Unmapped names resolve to `undefined`.
     */
    public resolve(name: string): string | undefined {
        return this.selectors.get(name)
    }

    /**
     * Alias for `resolve(name)`.
     */
    public resolveTrigger(name: string): string | undefined {
        return this.resolve(name)
    }

    /**
     * Clones the current registry into a new independent instance.
     */
    public clone(): VariantTriggerRegistry {
        const cloned = new VariantTriggerRegistry()
        for (const [key, val] of this.selectors.entries()) {
            cloned.selectors.set(key, val)
        }
        return cloned
    }
}
