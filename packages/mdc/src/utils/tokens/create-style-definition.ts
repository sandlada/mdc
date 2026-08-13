interface HasToCSSVariable {
    ToCSSVariable: () => any
}
type ResolvedStyle<T> = {
    [K in keyof T]: T[K] extends HasToCSSVariable
        ? ReturnType<T[K]['ToCSSVariable']>
        : T[K]
}
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {}

export function createStyleDefinition<const T extends Record<string, any>>(record: T): Prettify<ResolvedStyle<T>> {
    const result = { ...record } as any

    for(const [k, v] of Object.entries(record)) {
        if(typeof v?.ToCSSVariable === 'function') {
            result[k] = v.ToCSSVariable()
        }
    }

    return result as ResolvedStyle<T>
}
