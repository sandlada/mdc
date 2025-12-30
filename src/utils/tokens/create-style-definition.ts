interface HasToCSSValue {
    toCSSValue: () => any
}
type ResolvedStyle<T> = {
    [K in keyof T]: T[K] extends HasToCSSValue
        ? ReturnType<T[K]['toCSSValue']>
        : T[K]
}
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {}

export function createStyleDefinition<const T extends Record<string, any>>(record: T): Prettify<ResolvedStyle<T>> {
    const result = { ...record } as any

    for(const [k, v] of Object.entries(record)) {
        if(typeof v?.toCSSValue === 'function') {
            result[k] = v.toCSSValue()
        }
    }

    return result as ResolvedStyle<T>
}
