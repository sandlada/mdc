import { watch, type Ref, type WatchCallback, type WatchHandle, type WatchOptions } from 'vue'

type TObserveProp = {
    id: string
    property: Ref<boolean | string | number>
    callback: WatchCallback
    options?: WatchOptions
}

export function useObserveProps(propMap: Array<TObserveProp>) {

    let map: Map<
        string,
        {
            property: Ref<boolean | string | number>,
            callback: WatchCallback,
            options: WatchOptions | undefined,
            watchHandle: WatchHandle
        }
    > = new Map()

    const observe = (prop: TObserveProp) => {
        if (map.has(prop.id)) {
            return
        }

        const watchHandle = watch(
            prop.property,
            prop.callback,
            { ...prop.options }
        )

        map.set(
            prop.id,
            {
                callback: prop.callback,
                options: prop.options,
                property: prop.property,
                watchHandle: watchHandle,
            }
        )
    }

    const unobserve = (propId: string) => {
        if (map.has(propId)) {
            return
        }
        const target = map.get(propId)!
        target.watchHandle.stop()
    }

    const unobseveAll = () => {
        if (map.size === 0) {
            return
        }

        map.forEach((value) => {
            value.watchHandle.stop()
        })

        map.clear()
    }

    /**
     * Init
     */
    propMap.forEach((value) => {
        observe(value)
    })

    return ({
        observe,
        unobserve,
        unobseveAll,
    })
}
