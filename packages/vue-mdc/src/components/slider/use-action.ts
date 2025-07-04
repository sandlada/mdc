import { computed, ref, type Ref } from 'vue'

interface IAction {
    canFlip: boolean
    flipped: boolean
    target: HTMLInputElement
    fixed: HTMLInputElement
    values: Map<HTMLInputElement | undefined, number | undefined>
}

export function useAction(inputStart: Ref<null | undefined | HTMLInputElement>, inputEnd: Ref<null | undefined | HTMLInputElement>) {
    const _action = ref<null | IAction>(null)

    const action = computed<null | IAction>(() => _action.value)

    const startAction = (e: Event) => {
        const target = e.target as HTMLInputElement
        const fixed = target === inputStart.value ? inputEnd.value! : inputStart.value!
        _action.value = {
            canFlip: e.type === 'pointerdown',
            flipped: false,
            target,
            fixed,
            values: new Map([
                [target, target.valueAsNumber],
                [fixed, fixed?.valueAsNumber],
            ]),
        }
    }
    const finishAction = () => {
        _action.value = null
    }
    const needsClamping = () => {
        if (!_action.value) {
            return false
        }

        const { target, fixed } = _action.value
        const isStart = target === inputStart.value
        return isStart
            ? target.valueAsNumber > fixed.valueAsNumber
            : target.valueAsNumber < fixed.valueAsNumber
    }
    // if start/end start coincident and the first drag input would e.g. move
    // start > end, avoid clamping and "flip" to use the other input
    // as the action target.
    const isActionFlipped = () => {
        if (!_action.value) {
            return false
        }

        const { target, fixed, values } = _action.value
        if (_action.value.canFlip) {
            const coincident = values.get(target) === values.get(fixed)
            if (coincident && needsClamping()) {
                _action.value.canFlip = false
                _action.value.flipped = true
                _action.value.target = fixed
                _action.value.fixed = target
            }
        }
        return _action.value.flipped
    }

    // when flipped, apply the drag input to the flipped target and reset
    // the actual target.
    const flipAction = () => {
        if (!_action.value) {
            return false
        }

        const { target, fixed, values } = _action.value
        const changed = target.valueAsNumber !== fixed.valueAsNumber
        target.valueAsNumber = fixed.valueAsNumber
        fixed.valueAsNumber = values.get(fixed)!
        return changed
    }

    // clamp such that start does not move beyond end and visa versa.
    const clampAction = () => {
        if (!needsClamping() || !_action.value) {
            return false
        }
        const { target, fixed } = _action.value
        target.valueAsNumber = fixed.valueAsNumber
        return true
    }

    return {
        action,
        startAction,
        finishAction,
        isActionFlipped,
        flipAction,
        clampAction,
        needsClamping,
    }
}
