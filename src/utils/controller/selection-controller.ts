import type { ReactiveController, ReactiveControllerHost } from 'lit'

export type TSelectableElement = HTMLElement & {
    checked: boolean
    disabled?: boolean
}

export type TSelectionController = {

}

export class SelectionController implements TSelectionController, ReactiveController {

    private readonly host: TSelectableElement & ReactiveControllerHost
    private root: ParentNode | null = null

    public multiple: boolean = false

    constructor(
        host: TSelectableElement & ReactiveControllerHost,
        options?: Partial<{
            multiple: boolean
        }>
    ) {
        this.host = host
        
        if(options) {
            for(const [key, value] of Object.entries(options)) {
                // @ts-ignore
                this[key] = value
            }
        }
    }

    hostConnected(): void {
        this.root = this.host.getRootNode() as ParentNode
        this.host.addEventListener('keydown', this.handleKeyDown)
        this.host.addEventListener('focus', this.handleFocus)

        // When a new element connects, if it's checked, it might need to
        // enforce selection rules (e.g., unchecking others in single-select mode).
        if (this.host.checked) {
            this.handleCheckedChange()
        }

        // Defer tab index update until the component has rendered,
        // ensuring all sibling controls are available.
        requestAnimationFrame(() => {
            this.updateTabIndices()
        });
    }

    public hostDisconnected() {
        this.host.removeEventListener('keydown', this.handleKeyDown)
        this.host.removeEventListener('focus', this.handleFocus)
        this.root = null

        // When an element disconnects, we might need to update the tab index
        // of the remaining group members.
        requestAnimationFrame(() => {
            this.updateTabIndices()
        });
    }

    public get controls(): Array<TSelectableElement> {
        const name = this.host.getAttribute('name')
        if(!name || !this.root || !this.host.isConnected) return [this.host]
        const nodes = this.root.querySelectorAll<TSelectableElement>(`[name="${name}"]`)
        return Array.from(nodes)
    }

    private updateTabIndices() {
        const controls = this.controls
        const firstChecked = controls.find(control => control.checked)

        // Determine which control should be the single tab stop.
        // Priority:
        // 1. The currently focused element within the group (if any).
        // 2. The first checked element (if any).
        // 3. The first non-disabled element in the group.
        const activeControl = this.root?.activeElement
        const focusableControl = controls.includes(activeControl as TSelectableElement)
            ? activeControl as TSelectableElement
            : (firstChecked ?? controls.find(c => !c?.disabled))

        // Set the focusable control's tabindex to 0 and all others to -1.
        for (const control of controls) {
            control.tabIndex = (control === focusableControl) ? 0 : -1
        }
    }

    public readonly handleCheckedChange = () => {
        if(!this.host.checked) return
        if(!this.multiple) {
            for(const element of this.controls) {
                if(element !== this.host) {
                    element.checked = false
                }
            }
        }
    }

    public readonly handleFocus = () => {
        this.updateTabIndices()
    }

    public readonly handleKeyDown = (e: KeyboardEvent) => {
        const { key } = e
        const keyExp = {
            isArrowKey: key.startsWith('Arrow'),
            isHomeEnd: key === 'Home' || key === 'End',
            isActivationKey: key === ' ',
            isVertical: key === 'ArrowDown' || key === 'ArrowUp',
            isForward: key === 'ArrowDown' || key === 'ArrowRight',
        }

        if(!Object.values(keyExp).includes(true)) return

        const controls = this.controls.filter(e => !e?.disabled)

        e.preventDefault()

        if(keyExp.isActivationKey) {
            this.host.checked = !this.host.checked
            this.handleCheckedChange()
            return
        }

        const currentIndex = controls.indexOf(this.host)
        let nextIndex = currentIndex
        if(keyExp.isArrowKey) {
            if (keyExp.isForward) {
                nextIndex = (currentIndex + 1) % controls.length;
            } else {
                nextIndex = (currentIndex - 1 + controls.length) % controls.length;
            }
        } else if(keyExp.isHomeEnd) {
            nextIndex = (key === 'Home') ? 0 : controls.length - 1
        }
        
        const nextControl = controls[nextIndex]
        if (nextControl) {
            this.focus(nextControl)
            this.select(nextControl)
            this.updateTabIndices()
        }
    }

    public readonly focus = (control: TSelectableElement) => {
        control.focus()
    }

    public readonly select = (control: TSelectableElement) => {
        if (!this.multiple) {
            if (!control.checked) {
                control.checked = true
                // The host component should fire its own change/input events.
                // Then call controller.handleCheckedChange() which is this.uncheckSiblings() essentially.
                this.handleCheckedChange()
            }
        }
    }

}
