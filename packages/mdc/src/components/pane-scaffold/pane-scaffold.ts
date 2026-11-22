/**
 * @version 2026.11.21
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { repeat } from 'lit/directives/repeat.js'
import { styleMap } from 'lit/directives/style-map.js'
import { cancelTrackedAnimations } from '../../utils/motion'
import {
    animatePaneBounds, animatePaneDeparture, backGestureProgress, capturePaneMotion, clampExpansionWidth, expandWithDecayAndSpring, expansionWidth,
    findBackDestination, findExpansionReleaseAnchor, resolveCustomFlingTrajectory, resolveExpansionSpring, resolveFlingDecay,
    initialDestination, interpolatePaneBounds, paneExpansionLayoutKey, paneRectanglesFromTracks, PaneRoles, preferredWeights, pruneHistory,
    PendingExpansionKeyPrefix, SharedExpansionKeyPrefix,
    levitationAlignment, nextLevitationSize, parsePaneSnapshot, partitionTracks, resizeAdjacent, resolveDirective, resolveExpansionAnchors,
    resolveLevitationResize, resolvePaneLayout, resolvePaneMargins, resolvePanePartitions, resolveWidths, sameDestination, validateExpansion,
    panePresenceOffset, resolvePaneOrder, resolvePanePresenceMotions,
    springDisplacementAt, transposePaneBounds, type LevitationSize, type PaneFlingDecay, type PaneLayout, type PaneMotionBounds, type PanePresenceMotion,
    type PaneRange, type PaneRectangle,
} from './internal'
import {
    PaneExpansionAnchorType, PaneScaffoldBackNavigationBehavior, PaneScaffoldPattern, PaneScaffoldRole,
    type IMDCPaneScaffold, type IPaneAnimation, type IPaneExpansionAnchor, type IPaneExpansionFlingInput, type IPaneTransition,
    type IPaneScaffoldChangeDetail, type IPaneScaffoldDestination, type IPaneScaffoldDirective, type IPaneScaffoldLayoutChangeDetail,
    type IPaneScaffoldLevitationResize,
    type IPaneScaffoldBackPreview, type IPaneScaffoldReflowedPane, type IPaneScaffoldSavedState, type IPaneScaffoldValue,
    type IPaneScaffoldScene, type IPaneScaffoldTransition, type PaneScaffoldSavedExpansion,
} from './pane-scaffold.interface'
import { PaneScaffoldStyles } from './pane-scaffold.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-pane-scaffold': MDCPaneScaffold
    }
}

interface HistoryEntry {
    destination: IPaneScaffoldDestination
    focus?: HTMLElement
}

type PanePreviewTarget = { index: number; behavior: PaneScaffoldBackNavigationBehavior } | { value: IPaneScaffoldValue }

interface SplitterDrag {
    handle: HTMLElement
    pointerId: number
    index: number
    lastX: number
    offset: number
    direction: number
    widths: readonly number[]
    layout: string
    moved: boolean
    resized: boolean
    samples: SplitterSample[]
}

interface SplitterSample {
    offset: number
    time: number
}

type FloatingResize = ReturnType<ReturnType<typeof resolveLevitationResize>> & { key: string }

interface FloatingDrag {
    resize: FloatingResize
    handle: HTMLElement
    pointerId: number
    start: number
    direction: number
    previous?: LevitationSize
    moved: boolean
}

const Roles = Object.values(PaneScaffoldRole)
const Focusable = 'a[href],button,input,select,textarea,summary,[tabindex],[contenteditable=true]'
const VelocitySampleWindow = 100
const VelocityPause = 40
const FloatingSizeSpring = { dampingRatio: 1, stiffness: 1500 }

/** Responsive list-detail and supporting-pane layouts with independent pane history. */
@customElement('mdc-pane-scaffold')
export class MDCPaneScaffold extends LitElement implements IMDCPaneScaffold {
    public static override styles = PaneScaffoldStyles

    @property({ reflect: true })
    public pattern: PaneScaffoldPattern = PaneScaffoldPattern.ListDetail

    @property({ attribute: 'back-navigation-behavior', reflect: true })
    public backNavigationBehavior: PaneScaffoldBackNavigationBehavior =
        PaneScaffoldBackNavigationBehavior.PopUntilScaffoldValueChange

    @property({ type: Boolean, attribute: 'ignore-destination-history', reflect: true })
    public ignoreDestinationHistory = false

    @property({ type: Boolean, reflect: true })
    public resizable = false

    @property({ type: Boolean, attribute: 'disable-auto-focus', reflect: true })
    public disableAutoFocus = false

    @property({ type: Boolean, attribute: 'animate-panes', reflect: true })
    public animatePanes = false

    @property({ attribute: false })
    public layoutDirective?: IPaneScaffoldDirective

    @property({ attribute: false })
    public set scaffoldValue(value: IPaneScaffoldValue | undefined) {
        if (value !== undefined) this.controlledLayout(value)
        this.controlledValue = value
    }

    public get scaffoldValue(): IPaneScaffoldValue | undefined {
        return this.controlledValue
    }

    @property({ attribute: false })
    public adaptStrategies: IMDCPaneScaffold['adaptStrategies'] = {}

    @property({ attribute: false })
    public expansionAnchors: readonly IPaneExpansionAnchor[] = []

    @property({ attribute: 'initial-expansion-anchor' })
    public initialExpansionAnchor?: string | null

    @property({ attribute: 'expansion-state-key' })
    public expansionStateKey?: string | null

    public expansionSpring: IMDCPaneScaffold['expansionSpring'] = {}
    public expansionFling?: IMDCPaneScaffold['expansionFling']
    public consumeDragDelta?: IMDCPaneScaffold['consumeDragDelta']

    @property({ attribute: false })
    public paneAnimations: IMDCPaneScaffold['paneAnimations'] = {}

    private synchronisedPattern = this.pattern
    private history: HistoryEntry[] = [{ destination: initialDestination(this.pattern) }]
    private present = new Set<PaneScaffoldRole>()
    private visible: PaneScaffoldRole[] = []
    private reflowed?: IPaneScaffoldReflowedPane
    private levitated?: ReturnType<ReturnType<typeof resolvePaneLayout>>['levitated']
    private partitions?: ReturnType<ReturnType<typeof resolvePanePartitions>>
    private blockPartitions?: PaneRange[]
    private reportedVisible: readonly PaneScaffoldRole[] = []
    private reportedInteractable: readonly PaneScaffoldRole[] = []
    private reportedReflowed?: PaneScaffoldRole
    private reportedLevitated?: PaneScaffoldRole
    private width = 0
    private height = 0
    private widths: number[] = []
    private proportions = new Map<string, number[]>()
    private paneExpansions = new Map<string, PaneScaffoldSavedExpansion>()
    private expansionMotion?: {
        play: () => Animation | undefined
        resolve: () => void
        animation?: Animation
    }
    private sharedFling?: { cancel: () => void; finish: () => void }
    private pendingFocus?: HistoryEntry
    private focusBeforeReorder?: HTMLElement
    private focusAfterCollapse = false
    private drag?: SplitterDrag
    private floatingDrag?: FloatingDrag
    private floatingSizes = new Map<string, LevitationSize>()
    private floatingSizeMotion?: { key: string; value: number; frame: number }
    private pendingHistoryChange?: 'restore' | 'scene' | 'controlled'
    private scene?: IPaneScaffoldScene
    private controlledValue?: IPaneScaffoldValue
    private readonly runningPaneAnimations = new Set<Animation>()
    private readonly renderedPaneAnimations = new Map<PaneScaffoldRole, IPaneAnimation>()
    private readonly exitingPaneTransitions = new Map<PaneScaffoldRole, IPaneTransition>()
    private priorPaneBounds?: Map<PaneScaffoldRole, PaneMotionBounds>
    private readonly exitingPaneBounds = new Map<PaneScaffoldRole, PaneMotionBounds>()
    private panePresenceMotions = new Map<PaneScaffoldRole, PanePresenceMotion>()
    private presenceOrigin?: ReadonlyMap<PaneScaffoldRole, PaneMotionBounds>
    private paneMeasureChanged = false
    private backPreviewChanged = false
    private reportedBackPreview = false
    private preview?: {
        progress: number
        target: PanePreviewTarget
        from: Map<PaneScaffoldRole, PaneMotionBounds>
    }
    private snapControlledLayout = false
    private previewAnimation?: { cancel: () => void; finish: () => void }
    private observer?: ResizeObserver
    private reducedMotion?: MediaQueryList
    private readonly onMotionPreferenceChange = (): void => {
        if (this.reducedMotion?.matches) {
            this.stopFloatingSizeMotion()
            this.previewAnimation?.finish()
            if (this.sharedFling) this.sharedFling.finish()
            else this.stopExpansionMotion()
        }
        this.requestUpdate()
    }

    public get currentDestination(): IPaneScaffoldDestination {
        return { ...(this.scaffoldValue?.destination ?? this.history.at(-1)!.destination) }
    }

    public get currentScaffoldValue(): IPaneScaffoldValue {
        return this.scaffoldValueAt(this.history.length - 1)
    }

    public isPaneInteractable(pane: PaneScaffoldRole): boolean {
        const floating = this.renderedLevitatedPane
        if (floating?.pane === pane) return true
        if (this.layoutUnavailable || floating?.strategy.scrim) return false
        const index = this.visible.indexOf(pane)
        return this.reflowed?.pane === pane || (index >= 0 && !this.isCollapsed(index))
    }

    public peekPreviousScaffoldValue(behavior = this.backNavigationBehavior): IPaneScaffoldValue {
        const index = this.getBackDestination(behavior)
        return index < 0 ? this.currentScaffoldValue : this.scaffoldValueAt(index)
    }

    public get backPreview(): IPaneScaffoldBackPreview | undefined {
        const preview = this.preview
        if (preview && 'index' in preview.target) return { progress: preview.progress, target: this.scaffoldValueAt(preview.target.index) }
    }

    public get scaffoldTransition(): IPaneScaffoldTransition | undefined {
        const preview = this.preview
        if (preview && 'value' in preview.target) return { progress: preview.progress, target: preview.target.value }
    }

    public seekScaffoldValue(progress: number, target: IPaneScaffoldValue): void {
        if (!this.scaffoldValue) throw new Error('Seeking requires an application-controlled scaffold value')
        if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Scaffold transition progress must be between 0 and 1')
        this.controlledLayout(target)
        this.previewAnimation?.cancel()
        if (progress === 0) this.clearPanePreview()
        else if (this.preview && 'value' in this.preview.target) {
            this.preview.target = { value: target }
            this.preview.progress = progress
        } else this.startPanePreview(progress, { value: target })
        this.requestUpdate()
    }

    public snapToScaffoldValue(target: IPaneScaffoldValue): void {
        this.scaffoldValue = target
        this.snapControlledLayout = true
        this.clearPanePreview()
        this.requestUpdate()
    }

    public animateToScaffoldValue(target: IPaneScaffoldValue, duration = 250): Promise<void> {
        if (!this.scaffoldValue) throw new Error('Animating requires an application-controlled scaffold value')
        if (!Number.isFinite(duration) || duration < 0) throw new Error('Scaffold transition duration must be finite and nonnegative')
        this.controlledLayout(target)
        const start = this.scaffoldTransition?.target === target ? this.scaffoldTransition.progress : 0
        if (start === 1 || duration === 0 || this.reducedMotion?.matches) {
            this.snapToScaffoldValue(target)
            return this.updateComplete.then(() => undefined)
        }
        if (start === 0) this.startPanePreview(0, { value: target })
        this.requestUpdate()
        return this.animatePreviewProgress(start, 1, duration, () => this.snapToScaffoldValue(target))
    }

    private animatePreviewProgress(start: number, target: number, duration: number, commit: () => void): Promise<void> {
        this.previewAnimation?.cancel()
        return new Promise((resolve, reject) => {
            let frame = 0
            let firstTime: number | undefined
            const animation = {
                cancel: () => {
                    cancelAnimationFrame(frame)
                    this.previewAnimation = undefined
                    resolve()
                },
                finish: () => {
                    cancelAnimationFrame(frame)
                    this.previewAnimation = undefined
                    try {
                        commit()
                        void this.updateComplete.then(() => resolve(), reject)
                    } catch (error) {
                        reject(error)
                    }
                },
            }
            const step = (time: number): void => {
                if (this.previewAnimation !== animation || !this.preview) return
                firstTime ??= time
                const elapsed = (time - firstTime) / duration
                if (elapsed >= Math.abs(target - start)) {
                    animation.finish()
                    return
                }
                const progress = start + elapsed * Math.sign(target - start)
                if (progress !== this.preview.progress) {
                    this.preview.progress = progress
                    if ('index' in this.preview.target) this.backPreviewChanged = true
                    this.requestUpdate()
                }
                frame = requestAnimationFrame(step)
            }
            this.previewAnimation = animation
            frame = requestAnimationFrame(step)
        })
    }

    private get previewBackBehavior(): PaneScaffoldBackNavigationBehavior {
        const target = this.preview?.target
        return target && 'behavior' in target ? target.behavior : this.backNavigationBehavior
    }

    public saveState(): IPaneScaffoldSavedState {
        const floatingSizes = new Map(this.floatingSizes)
        const drag = this.floatingDrag
        if (drag?.moved) {
            if (drag.previous) floatingSizes.set(drag.resize.key, drag.previous)
            else floatingSizes.delete(drag.resize.key)
        }
        return {
            version: 1,
            pattern: this.synchronisedPattern,
            history: this.history.map(entry => ({ ...entry.destination })),
            proportions: [...this.proportions].map(([key, value]) => [key, [...value]]),
            expansions: [...this.paneExpansions].map(([key, value]) => [
                key, 'anchor' in value && value.requested ? { ...value, requested: { ...value.requested } } : { ...value },
            ]),
            floatingSizes: [...floatingSizes].map(([key, value]) => [key, { ...value }]),
        }
    }

    public restoreState(snapshot: unknown): void {
        const saved = parsePaneSnapshot(snapshot)
        const hadFocus = this.focusedPane() !== undefined
        this.stopDrag()
        this.stopFloatingDrag()
        this.stopFloatingSizeMotion()
        this.clearPanePreview()
        this.stopExpansionMotion()
        this.scaffoldValue = undefined
        this.pattern = saved.pattern
        this.scene = undefined
        this.synchronisedPattern = saved.pattern
        this.history = saved.history.map(destination => ({ destination }))
        this.proportions = saved.proportions
        this.paneExpansions = saved.expansions
        this.floatingSizes = saved.floatingSizes
        this.pendingFocus = hadFocus ? this.history.at(-1) : undefined
        this.pendingHistoryChange = 'restore'
        this.requestUpdate()
    }

    public applyScene(scene: IPaneScaffoldScene): void {
        if (!scene.history.length) throw new Error('Pane scene must have a destination')
        const sameScene = this.scene?.key === scene.key && this.scene.pattern === scene.pattern
        const nextDestination = scene.history.at(-1)!
        const destinationChanged = !sameScene || !sameDestination(this.currentDestination)(nextDestination)
        const preview = this.backPreview
        if (preview?.progress === 1 && sameScene && sameDestination(preview.target.destination)(nextDestination)) {
            this.snapControlledLayout = true
        }
        const oldEntries = sameScene ? this.history : []
        const hadFocus = this.focusedPane() !== undefined
        this.stopDrag()
        this.stopFloatingDrag()
        this.stopFloatingSizeMotion()
        this.clearPanePreview()
        this.scaffoldValue = undefined
        this.scene = scene
        this.pattern = this.synchronisedPattern = scene.pattern
        this.layoutDirective = scene.directive
        this.adaptStrategies = scene.adaptStrategies
        this.backNavigationBehavior = scene.backNavigationBehavior
        this.ignoreDestinationHistory = false
        this.history = scene.history.map((destination, index) => {
            const previous = oldEntries[index]
            return previous && sameDestination(previous.destination)(destination) ? previous : { destination: { ...destination } }
        })
        if (destinationChanged) {
            this.pendingFocus = hadFocus ? this.history.at(-1) : undefined
            this.pendingHistoryChange = 'scene'
        }
        this.requestUpdate()
    }

    public seekBack(progress: number, behavior = this.previewBackBehavior): void {
        if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Back preview progress must be between 0 and 1')
        if (progress === 0) {
            this.clearPanePreview()
        } else {
            const index = this.getBackDestination(behavior)
            if (index < 0) throw new Error('No destination matches the pane back navigation behavior')
            this.previewAnimation?.cancel()
            if (this.preview && 'behavior' in this.preview.target && this.preview.target.behavior === behavior) {
                if (this.preview.progress === progress) return
                this.preview.progress = progress
                this.backPreviewChanged = true
            } else this.startPanePreview(progress, { behavior, index })
        }
        this.requestUpdate()
    }

    public seekBackGesture(progress: number, behavior?: PaneScaffoldBackNavigationBehavior): void {
        this.seekBack(backGestureProgress(this.currentScaffoldValue.expandedPanes.length)(progress), behavior)
    }

    public cancelBackPreview(duration = 250): Promise<void> {
        if (!Number.isFinite(duration) || duration < 0) throw new Error('Back preview duration must be finite and nonnegative')
        const preview = this.preview
        if (!preview || !('index' in preview.target)) return Promise.resolve()
        const clear = () => {
            this.clearPanePreview()
            this.requestUpdate()
        }
        if (duration === 0 || this.reducedMotion?.matches) {
            clear()
            return this.updateComplete.then(() => undefined)
        }
        return this.animatePreviewProgress(preview.progress, 0, duration, clear)
    }

    public commitBackPreview(duration = 250): Promise<void> {
        if (!Number.isFinite(duration) || duration < 0) throw new Error('Back preview duration must be finite and nonnegative')
        const preview = this.preview
        if (!preview || !('index' in preview.target)) throw new Error('No active back preview to commit')
        const { behavior } = preview.target
        const commit = () => {
            preview.progress = 1
            this.backPreviewChanged = true
            this.goBack(behavior)
            this.requestUpdate()
        }
        if (preview.progress === 1 || duration === 0 || this.reducedMotion?.matches) {
            commit()
            return this.updateComplete.then(() => undefined)
        }
        return this.animatePreviewProgress(preview.progress, 1, duration, commit)
    }

    private startPanePreview(progress: number, target: PanePreviewTarget): void {
        if ('index' in target || (this.preview && 'index' in this.preview.target)) this.backPreviewChanged = true
        this.stopDrag()
        this.stopFloatingDrag()
        this.stopFloatingSizeMotion()
        cancelTrackedAnimations(this.runningPaneAnimations)
        this.stopExpansionMotion()
        this.exitingPaneBounds.clear()
        this.exitingPaneTransitions.clear()
        this.preview = {
            progress, target,
            from: this.shadowRoot ? capturePaneMotion(this.shadowRoot, Roles) : new Map(),
        }
    }

    private clearPanePreview(): void {
        this.previewAnimation?.cancel()
        if (this.preview && 'index' in this.preview.target) this.backPreviewChanged = true
        this.preview = undefined
    }

    public get canGoBack(): boolean {
        return this.canNavigateBack()
    }

    public get currentExpansionAnchor(): string | undefined {
        if (this.visible.length !== 2 || this.partitions) return undefined
        const expansion = this.expansionFor(this.expansionKey(this.visible))
        if (expansion && 'anchor' in expansion) return expansion.anchor
    }

    public isPaneExpansionUnspecified(): boolean {
        const key = this.expansionRequestKey()
        if (this.visible.length !== 2) return !this.paneExpansions.has(key) && !this.proportions.has(key)
        return !this.expansionFor(key) && !this.proportions.has(key) && !this.drag?.resized && !this.sharedFling
    }

    public dragFloatingPaneBy(delta: number): void {
        if (!Number.isFinite(delta)) throw new Error('Floating pane drag delta must be finite')
        const levitated = this.levitated
        const config = levitated?.strategy.resize
        if (!delta || !levitated || !config || this.blockPartitions?.length === 0) return
        const resize = this.getFloatingResize(levitated.pane, config)
        if (resize.min === resize.max) return
        this.stopFloatingDrag()
        this.setFloatingSize(resize, resize.value + delta * this.floatingDirection(resize))
    }

    public dragPaneExpansionBy(delta: number): void {
        if (!Number.isFinite(delta)) throw new Error('Pane expansion drag delta must be finite')
        this.requireAdjustablePaneExpansion()
        if (delta === 0) return
        const remaining = this.remainingDragDelta(delta)
        if (remaining === 0) return
        const grid = this.shadowRoot!.querySelector<HTMLElement>('.grid')!
        const widths = this.dragStartWidths(grid)
        const [first, second] = widths
        if ((first === 0 && remaining < 0) || (second === 0 && remaining > 0)) return
        this.stopDrag()
        this.applyWidths(resizeAdjacent(0, first + remaining, this.minimumPaneWidth)(widths))
    }

    public settlePaneExpansion(velocity = 0): void {
        if (!Number.isFinite(velocity)) throw new Error('Pane expansion release velocity must be finite')
        this.requireAdjustablePaneExpansion()
        this.stopDrag()
        this.settleExpansion(this.widths[0], velocity)
    }

    public snapToExpansionAnchor(id: string): void {
        void this.animateToExpansionAnchor(id)
    }

    public animateToExpansionAnchor(id: string, initialVelocity = 0): Promise<void> {
        const anchor = this.getExpansionAnchors().find(candidate => candidate.id === id)
        if (!anchor) throw new Error(`Unknown pane expansion anchor: ${id}`)
        return this.animateExpansion(anchor, initialVelocity)
    }

    private animateExpansion(anchor: { id: string; width: number }, initialVelocity: number, decay?: PaneFlingDecay): Promise<void> {
        if (!Number.isFinite(initialVelocity)) throw new Error('Pane expansion velocity must be finite')
        const spring = resolveExpansionSpring(this.expansionSpring)
        const grid = this.shadowRoot?.querySelector<HTMLElement>('.grid')
        if (!grid) throw new Error('Pane expansion requires a rendered layout')
        const from = this.renderedExpansionTracks(grid)
        const to = this.expansionTracks([anchor.width, this.availablePaneWidth - anchor.width])
        const shouldAnimate = !this.reducedMotion?.matches && (decay?.duration || from.some((value, index) => value !== to[index]))
        const keyframes = shouldAnimate ? expandWithDecayAndSpring(initialVelocity, spring, decay)(from, to) : undefined
        this.setPaneExpansion({ anchor: anchor.id })
        return new Promise(resolve => {
            this.expansionMotion = {
                resolve,
                play: () => keyframes && !this.reducedMotion?.matches
                    ? grid.animate(keyframes.frames, { duration: keyframes.duration }) : undefined,
            }
        })
    }

    public setFirstPaneWidth(width: number): void {
        this.setPaneExpansion({ type: PaneExpansionAnchorType.OffsetFromStart, value: width })
    }

    public setFirstPaneProportion(proportion: number): void {
        this.setPaneExpansion({ type: PaneExpansionAnchorType.Proportion, value: proportion })
    }

    public clearPaneExpansion(): void {
        this.stopDrag()
        this.clearPanePreview()
        this.stopExpansionMotion()
        const key = this.expansionRequestKey()
        this.paneExpansions.delete(key)
        this.proportions.delete(key)
        if (this.visible.length === 3 && this.expansionStateKey == null) this.proportions.delete(this.expansionKey(this.visible))
        this.requestUpdate()
    }

    public canNavigateBack(behavior = this.backNavigationBehavior): boolean {
        if (this.scaffoldValue) return false
        if (this.scene) return this.scene.backNavigationBehavior === behavior && this.scene.previousEntries.length > 0
        return this.getBackDestination(behavior) >= 0
    }

    public canPreviewBack(behavior = this.previewBackBehavior): boolean {
        return this.getBackDestination(behavior) >= 0
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.reducedMotion = this.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)')
        this.reducedMotion?.addEventListener('change', this.onMotionPreferenceChange)
        this.observer = new ResizeObserver(entries => {
            const { inlineSize: width, blockSize: height } = entries[0].contentBoxSize[0]
            if (width === this.width && height === this.height) return
            this.stopDrag()
            this.stopFloatingDrag()
            this.stopFloatingSizeMotion()
            this.clearPanePreview()
            this.stopExpansionMotion()
            this.width = width
            this.height = height
            this.paneMeasureChanged = true
            this.requestUpdate()
        })
        this.observer.observe(this)
        this.requestUpdate()
    }

    public override disconnectedCallback(): void {
        this.stopDrag()
        this.stopExpansionMotion()
        this.stopFloatingDrag()
        this.stopFloatingSizeMotion()
        this.clearPanePreview()
        cancelTrackedAnimations(this.runningPaneAnimations)
        this.exitingPaneBounds.clear()
        this.exitingPaneTransitions.clear()
        this.observer?.disconnect()
        this.reducedMotion?.removeEventListener('change', this.onMotionPreferenceChange)
        this.reducedMotion = undefined
        super.disconnectedCallback()
    }

    public navigateTo(pane: PaneScaffoldRole, contentKey?: string): void {
        if (this.scaffoldValue) throw new Error('Update the application-controlled scaffold value to navigate')
        if (this.scene) throw new Error('Update the application navigation stack and apply its pane scene')
        this.reconcile()
        if (!this.present.has(pane)) throw new Error(`Unavailable pane: ${pane}`)
        if (contentKey !== undefined && typeof contentKey !== 'string') throw new Error('Pane content key must be a string')
        const destination = { pane, contentKey }
        if (sameDestination(this.currentDestination)(destination)) return
        this.rememberFocus()
        const entry = { destination }
        this.history = [...this.history, entry]
        this.destinationChanged('navigate', entry)
    }

    public goBack(behavior = this.previewBackBehavior): void {
        if (this.scaffoldValue) throw new Error('Update the application-controlled scaffold value to navigate back')
        if (this.scene) {
            if (!this.canNavigateBack(behavior)) throw new Error('No matching previous entries for the pane scene')
            this.previewAnimation?.cancel()
            this.dispatchEvent(new CustomEvent('pane-scene-back-request', {
                detail: { previousEntries: [...this.scene.previousEntries] }, bubbles: true, composed: true,
            }))
            return
        }
        this.reconcile()
        const index = this.getBackDestination(behavior)
        if (index < 0) throw new Error('No destination matches the pane back navigation behavior')
        const preview = this.preview
        if (preview?.progress === 1 && 'index' in preview.target && preview.target.index === index) this.snapControlledLayout = true
        this.history = this.history.slice(0, index + 1)
        this.destinationChanged('back', this.history.at(-1)!)
    }

    private getBackDestination(behavior: PaneScaffoldBackNavigationBehavior): number {
        if (this.scaffoldValue) return -1
        if (this.scene) return this.scene.backNavigationBehavior === behavior ? this.scene.previousSceneIndex ?? -1 : -1
        const destinations = this.history.map(entry => entry.destination)
        const layoutAt = (index: number) => {
            const { expanded, reflowed, levitated } = this.getPaneLayout(index)
            return `${expanded.join()}/${reflowed?.pane ?? ''}/${levitated?.pane ?? ''}`
        }
        return findBackDestination(behavior, layoutAt)(destinations)
    }

    private getPaneLayout(index = this.history.length - 1): PaneLayout {
        if (this.scaffoldValue) return this.controlledLayout(this.scaffoldValue)
        const start = this.ignoreDestinationHistory ? index : 0
        const roles = this.history.slice(start, index + 1).map(entry => entry.destination.pane)
        let present = this.present
        if (this.scene) {
            const candidates = new Set(roles)
            const hasDetailPlaceholder = index === this.scene.previousSceneIndex
                ? this.scene.previousHasDetailPlaceholder ?? this.scene.hasDetailPlaceholder : this.scene.hasDetailPlaceholder
            if (hasDetailPlaceholder && candidates.has('list')) candidates.add('detail')
            present = new Set([...this.present].filter(role => candidates.has(role)))
        }
        return resolvePaneLayout(
            this.synchronisedPattern, this.effectiveDirective, this.adaptStrategies, roles, this.layoutDirective?.paneOrder,
        )(present)
    }

    private scaffoldValueAt(index: number): IPaneScaffoldValue {
        const { expanded, reflowed, levitated } = this.getPaneLayout(index)
        return {
            destination: this.scaffoldValue ? this.currentDestination : { ...this.history[index].destination },
            expandedPanes: expanded,
            reflowedPane: reflowed,
            levitatedPane: levitated?.pane,
        }
    }

    protected override willUpdate(changed: PropertyValues<this>): void {
        this.reconcile()
        if (changed.has('scaffoldValue')) {
            this.clearPanePreview()
            const previous = changed.get('scaffoldValue')?.destination ?? this.history.at(-1)!.destination
            if (!this.pendingHistoryChange && !sameDestination(previous)(this.currentDestination)) {
                this.pendingHistoryChange = 'controlled'
                if (this.hasUpdated) this.pendingFocus = { destination: this.currentDestination }
            }
        }
        const initial = this.initialExpansionAnchor
        if (initial != null && !this.expansionAnchors.some(anchor => anchor.id === initial)) {
            throw new Error(`Unknown initial pane expansion anchor: ${initial}`)
        }
        if (this.expansionStateKey != null && (typeof this.expansionStateKey !== 'string' || !this.expansionStateKey.trim())) {
            throw new Error('Pane expansion state key must be a nonempty string')
        }
        const expansionChanged = changed.has('expansionAnchors') || changed.has('initialExpansionAnchor')
            || changed.has('expansionStateKey')
        if (changed.has('pattern') || changed.has('layoutDirective') || changed.has('adaptStrategies') || changed.has('ignoreDestinationHistory')
            || expansionChanged) this.clearPanePreview()
        if (changed.has('layoutDirective') || expansionChanged) {
            this.stopDrag()
            this.stopExpansionMotion()
        }
        if (changed.has('layoutDirective') || changed.has('adaptStrategies')) this.stopFloatingDrag()
        const { expanded: visible, reflowed, levitated } = this.getPaneLayout()
        const partitions = resolvePanePartitions(this.width, this.height, this.effectiveDirective.spacer)(this.layoutDirective?.excludedBounds ?? [])
        const blockPartitions = resolvePanePartitions(this.height, this.width, 0)(
            (this.layoutDirective?.horizontalExcludedBounds ?? []).map(transposePaneBounds),
        )
        const unavailable = partitions?.length === 0 || blockPartitions?.length === 0
        const nextPanes = unavailable ? [] : [...visible]
        if (reflowed && !unavailable) nextPanes.push(reflowed.pane)
        if (levitated && blockPartitions?.length !== 0) nextPanes.push(levitated.pane)
        const layoutChanged = visible.join() !== this.visible.join()
            || reflowed?.pane !== this.reflowed?.pane || levitated?.pane !== this.levitated?.pane
            || changed.has('layoutDirective') || unavailable !== this.layoutUnavailable
        if (layoutChanged || changed.has('adaptStrategies') || changed.has('animatePanes')
            || changed.has('scaffoldValue')) this.stopFloatingSizeMotion()
        this.preparePaneMotion(layoutChanged || this.paneMeasureChanged, nextPanes, unavailable ? [] : visible)
        this.paneMeasureChanged = false
        if (layoutChanged) {
            const focused = (this.getRootNode() as Document | ShadowRoot).activeElement
            const active = this.focusedShadowElement ?? focused
            const pane = this.focusedPane()
            this.focusBeforeReorder = active instanceof HTMLElement && ((pane && nextPanes.includes(pane)) || this.focusedShadowElement)
                ? active : undefined
        }
        if (visible.join() !== this.visible.join() || reflowed?.pane !== this.reflowed?.pane
            || levitated?.pane !== this.levitated?.pane || levitated?.strategy.scrim !== this.levitated?.strategy.scrim
            || changed.has('resizable') || Boolean(partitions) !== Boolean(this.partitions) || unavailable !== this.layoutUnavailable) {
            const focusedPane = this.focusedPane()
            const focusedSplitter = this.focusedShadowElement?.getAttribute('aria-controls')
            const focusedSplitterRemains = this.resizable && !unavailable && !partitions && !levitated?.strategy.scrim
                && visible.slice(0, -1).some(role => `pane-${role}` === focusedSplitter)
            if ((levitated?.strategy.scrim && focusedPane !== levitated.pane)
                || (focusedPane && !nextPanes.includes(focusedPane))
                || (focusedSplitter && !focusedSplitterRemains)) {
                this.pendingFocus ??= this.history.at(-1)!
            }
            this.stopDrag()
            this.stopFloatingDrag()
            this.stopExpansionMotion()
        }
        this.visible = visible
        this.reflowed = reflowed
        this.levitated = levitated
        this.partitions = partitions
        this.blockPartitions = blockPartitions
        if (this.drag?.resized || this.sharedFling) return
        if (visible.length === 2 && !partitions && !this.layoutUnavailable) {
            const key = this.expansionKey(visible)
            if (this.expansionStateKey == null) {
                const pendingKey = PendingExpansionKeyPrefix + this.pattern
                const pending = this.paneExpansions.get(pendingKey)
                if (pending) {
                    this.paneExpansions.delete(pendingKey)
                    this.proportions.delete(key)
                    this.paneExpansions.set(key, pending)
                }
            }
            const expansion = this.expansionFor(key)
            if (expansion) this.paneExpansions.set(key, expansion)
            else this.paneExpansions.delete(key)
        }
        this.widths = this.widthsFor(visible)
        this.focusAfterCollapse = this.visible.some((role, index) => this.isCollapsed(index) && this.focusedPane() === role)
    }

    private widthsFor(visible: readonly PaneScaffoldRole[], { spacer, preferred, minimumWidth, preferredWidths } = this.effectiveDirective): number[] {
        const width = Math.max(0, this.width - Math.max(0, visible.length - 1) * spacer)
        const minimum = Math.min(minimumWidth, width / Math.max(1, visible.length))
        const key = this.expansionKey(visible)
        const draggedProportions = this.proportions.get(key)
        const weights = draggedProportions ?? preferredWeights(this.pattern, width, preferred, preferredWidths)(visible)
        const widths = resolveWidths(width, minimum)(weights)
        const anchors = resolveExpansionAnchors(width, minimum)(this.expansionAnchors)
        const expansion = this.expansionFor(key)
        if (visible.length !== 2 || !expansion || this.partitions || draggedProportions) return widths
        const position = 'anchor' in expansion
            ? anchors.find(anchor => anchor.id === expansion.anchor)?.width
            : expansionWidth(width)(expansion.type, expansion.value)
        if (position === undefined) return widths
        const first = clampExpansionWidth(width, minimum)(position)
        return [first, width - first]
    }

    protected override updated(): void {
        this.animatePaneChanges()
        this.snapControlledLayout = false
        const motion = this.expansionMotion
        if (motion && !motion.animation) {
            const animation = motion.play()
            if (animation) {
                motion.animation = animation
                const finish = () => {
                    if (this.expansionMotion !== motion) return
                    this.expansionMotion = undefined
                    motion.resolve()
                }
                void animation.finished.then(finish, finish)
            } else this.stopExpansionMotion()
        }
        const entry = this.pendingFocus
        const focusAfterCollapse = this.focusAfterCollapse
        const focusBeforeReorder = this.focusBeforeReorder
        this.pendingFocus = undefined
        this.focusAfterCollapse = false
        this.focusBeforeReorder = undefined
        const shown = this.layoutUnavailable ? [] : this.visible.filter((_, index) => !this.isCollapsed(index))
        const reflowed = this.layoutUnavailable ? undefined : this.reflowed
        if (reflowed) shown.push(reflowed.pane)
        const levitated = this.renderedLevitatedPane?.pane
        if (levitated) shown.push(levitated)
        const interactable = shown.filter(pane => this.isPaneInteractable(pane))
        if ((entry || focusAfterCollapse) && shown.length && !this.disableAutoFocus && this.layoutDirective?.shouldAutoFocusCurrentDestination !== false) {
            const handle = focusAfterCollapse ? this.shadowRoot?.querySelector<HTMLElement>('[role=separator]') : undefined
            if (handle) handle.focus({ preventScroll: true })
            else {
                const role = levitated && this.levitated?.strategy.scrim ? levitated
                    : entry && shown.includes(entry.destination.pane) ? entry.destination.pane : shown[0]
                this.focusPane(role, entry?.focus)
            }
        } else if (focusBeforeReorder?.isConnected && !focusBeforeReorder.closest('[hidden], [inert]')) {
            focusBeforeReorder.focus({ preventScroll: true })
        }
        if (this.pendingHistoryChange) {
            const reason = this.pendingHistoryChange
            this.pendingHistoryChange = undefined
            this.dispatchDestinationChange(reason)
        }
        if (shown.join() !== this.reportedVisible.join() || this.reportedReflowed !== reflowed?.pane
            || this.reportedLevitated !== levitated || interactable.join() !== this.reportedInteractable.join()) {
            this.reportedVisible = shown
            this.reportedInteractable = interactable
            this.reportedReflowed = reflowed?.pane
            this.reportedLevitated = levitated
            this.dispatchEvent(new CustomEvent<IPaneScaffoldLayoutChangeDetail>('pane-layout-change', {
                detail: {
                    visiblePanes: [...shown], interactablePanes: [...interactable],
                    reflowedPane: reflowed && { ...reflowed }, levitatedPane: levitated,
                },
                bubbles: true,
                composed: true,
            }))
        }
        if (this.backPreviewChanged) {
            this.backPreviewChanged = false
            const preview = this.backPreview
            if (preview || this.reportedBackPreview) {
                this.reportedBackPreview = Boolean(preview)
                this.dispatchEvent(new CustomEvent<IPaneScaffoldBackPreview | null>('pane-back-preview-change', {
                    detail: preview ?? null, bubbles: true, composed: true,
                }))
            }
        }
    }

    protected getRenderClasses() {
        return {
            grid: true, reflowing: this.reflowed !== undefined, 'block-partitioned': Boolean(this.blockPartitions),
            excluded: Boolean(this.partitions), animated: this.animatePanes && this.hasUpdated && !this.snapControlledLayout,
            previewing: Boolean(this.preview),
        }
    }

    private preparePaneMotion(layoutChanged: boolean, nextPanes: readonly PaneScaffoldRole[], nextExpanded: readonly PaneScaffoldRole[]): void {
        if (!this.animatePanes || this.reducedMotion?.matches || this.preview || this.snapControlledLayout) {
            cancelTrackedAnimations(this.runningPaneAnimations)
            this.exitingPaneBounds.clear()
            this.exitingPaneTransitions.clear()
            this.panePresenceMotions.clear()
            this.presenceOrigin = undefined
            return
        }
        if (!layoutChanged || !this.shadowRoot || !this.hasUpdated) return
        this.priorPaneBounds = capturePaneMotion(this.shadowRoot, Roles)
        this.presenceOrigin = this.priorPaneBounds
        const previousExpanded = this.layoutUnavailable ? [] : this.visible.filter((role, index) => !this.isCollapsed(index))
        const previousFloating = this.levitated?.pane
        const previousReflowed = this.reflowed?.pane
        const previousHorizontal = previousExpanded.filter(role => nextExpanded.includes(role) || !nextPanes.includes(role))
        const nextHorizontal = nextExpanded.filter(role => role !== previousFloating && role !== previousReflowed)
        this.panePresenceMotions = resolvePanePresenceMotions(resolvePaneOrder(this.pattern, this.layoutDirective?.paneOrder))(
            previousHorizontal, nextHorizontal,
        )
        cancelTrackedAnimations(this.runningPaneAnimations)
        this.exitingPaneBounds.clear()
        this.exitingPaneTransitions.clear()
        for (const [role, bounds] of this.priorPaneBounds) {
            if (nextPanes.includes(role)) continue
            const transition = this.renderedPaneAnimations.get(role)?.exit
            if (transition === false) continue
            this.exitingPaneBounds.set(role, bounds)
            if (transition) this.exitingPaneTransitions.set(role, transition)
        }
    }

    private readonly finishPresenceMotion = (event: TransitionEvent): void => {
        if (event.propertyName !== 'translate' && event.propertyName !== 'clip-path') return
        const element = event.target
        if (!(element instanceof HTMLElement) || !element.matches('.pane[data-pane-motion]')) return
        const grid = event.currentTarget as HTMLElement
        if (grid.getAnimations({ subtree: true }).some(animation => animation instanceof CSSTransition
            && (animation.transitionProperty === 'translate' || animation.transitionProperty === 'clip-path')
            && (animation.effect as KeyframeEffect).target?.matches('.pane[data-moving-pane]:not([hidden])')
            && animation.playState === 'running')) return
        for (const [role, motion] of this.panePresenceMotions) if (motion.phase === 'enter') this.panePresenceMotions.delete(role)
        if (!this.panePresenceMotions.size) this.presenceOrigin = undefined
        this.requestUpdate()
    }

    private paneAnimation(role: PaneScaffoldRole): IPaneAnimation {
        return { ...this.paneAnimations[role], ...this.scene?.paneEntries[role]?.pane?.animation }
    }

    private animatePaneChanges(): void {
        const previous = this.priorPaneBounds
        this.priorPaneBounds = undefined
        for (const role of Roles) {
            const spec = this.paneAnimation(role)
            this.renderedPaneAnimations.set(role, spec)
            if (!previous) continue
            const pane = this.shadowRoot!.getElementById(`pane-${role}`)
            if (!pane) continue
            const exit = this.exitingPaneTransitions.get(role)
            const directionalExit = pane.hidden && pane.hasAttribute('data-moving-pane') && this.exitingPaneBounds.has(role)
            const from = previous.get(role)
            const transition = pane.hidden ? exit : from ? undefined : spec.enter
            const animation = transition
                ? pane.animate([...transition.keyframes], {
                    duration: transition.duration, easing: transition.easing, fill: exit ? 'forwards' : 'none',
                })
                : directionalExit ? animatePaneDeparture(pane.getAttribute('data-pane-motion') === 'center')(pane)
                    : !pane.hidden && from && spec.bounds !== false ? animatePaneBounds(from, spec.bounds)(pane) : undefined
            if (!animation) continue
            this.runningPaneAnimations.add(animation)
            void animation.finished.then(() => {
                if (!this.runningPaneAnimations.delete(animation) || (!exit && !directionalExit)) return
                this.exitingPaneTransitions.delete(role)
                this.exitingPaneBounds.delete(role)
                this.panePresenceMotions.delete(role)
                if (!this.panePresenceMotions.size) this.presenceOrigin = undefined
                this.requestUpdate()
                void this.updateComplete.then(() => animation.cancel())
            }, () => { this.runningPaneAnimations.delete(animation) })
        }
    }

    protected override render() {
        const { spacer } = this.effectiveDirective
        const floating = this.renderedLevitatedPane
        const scrim = floating?.strategy.scrim
        const floatingBand = this.blockPartitions && this.paneRows()[0]
        const firstPaneColumn = this.partitions ? 2 : 1
        const orderedRoles = new Set(this.visible)
        if (this.reflowed) orderedRoles.add(this.reflowed.pane)
        if (this.levitated) orderedRoles.add(this.levitated.pane)
        for (const role of Roles) orderedRoles.add(role)
        const tracks = this.widths.length === 2
            ? this.expansionTracks(this.widths).map(width => `${width}px`).join(' ')
            : this.widths.map(width => `${width}px`).join(` ${spacer}px `)
        const partitionColumns = this.partitions && this.panePartitionTracks(this.visible, false)
        const rtlColumns = this.partitions && this.panePartitionTracks(this.visible, true)
        const preview = this.preview && !this.reducedMotion?.matches ? this.preview : undefined
        const previewLayout = preview && ('index' in preview.target ? this.getPaneLayout(preview.target.index)
            : this.controlledLayout(preview.target.value))
        const previewBounds = preview && previewLayout && this.previewRectangles(preview.target, previewLayout)
        const previewScrim = Boolean(previewLayout?.levitated?.strategy.scrim)
        const scrimRole = (scrim ? this.levitated : previewScrim ? previewLayout?.levitated : undefined)?.pane
        const hasMargins = Boolean(this.layoutDirective?.paneMargins || this.layoutDirective?.paneInsets)
        const layout = { expanded: this.visible, reflowed: this.reflowed, levitated: this.levitated }
        const currentBounds = hasMargins ? this.paneRectangles(layout, false, this.widths) : undefined
        const rtlBounds = hasMargins && this.partitions ? this.paneRectangles(layout, true, this.widths) : undefined
        const rtl = this.panePresenceMotions.size > 0 && (this.partitions ? this.matches(':dir(rtl)') : this.direction < 0)
        const presenceOffset = this.presenceOrigin && this.panePresenceMotions.size
            ? panePresenceOffset(this.width, rtl, resolvePaneOrder(this.pattern, this.layoutDirective?.paneOrder), this.panePresenceMotions,
                this.presenceOrigin, this.paneRectangles(layout, rtl, this.widths))
            : undefined
        const formatColumns = (columns: number[]) => columns.length ? columns.map(width => `${width}px`).join(' ') : 'minmax(0, 1fr)'
        return html`
            <div class=${classMap(this.getRenderClasses())} @focusin=${this.rememberFocus} @keydown=${this.handleLevitationKeys}
                @transitionend=${this.finishPresenceMotion} style=${styleMap({
                '--_pane-tracks': partitionColumns ? formatColumns(partitionColumns)
                    : this.visible.length <= 1 ? 'minmax(0, 1fr)' : tracks,
                '--_pane-tracks-rtl': rtlColumns ? formatColumns(rtlColumns) : undefined,
                '--_pane-rows': this.reflowed || this.blockPartitions ? this.paneRowTracks : undefined,
            })}>
                ${scrimRole ? html`<div class="scrim" part="pane-scrim" aria-hidden="true"
                    style=${styleMap({
                        pointerEvents: !scrim ? 'none' : undefined,
                        opacity: preview && Boolean(scrim) !== previewScrim
                            ? String(scrim ? 1 - preview.progress : preview.progress) : undefined,
                    })}
                    @click=${scrim ? this.dismissLevitatedPane : nothing}>
                    <div class="scrim-visual" inert>
                        <slot name=${`${scrimRole}-scrim`}><span class="default-scrim"></span></slot>
                    </div>
                </div>` : nothing}
                ${repeat(orderedRoles, role => role, role => {
                    const index = this.visible.indexOf(role)
                    const reflowed = role === this.reflowed?.pane
                    const levitated = role === floating?.pane ? floating.strategy : undefined
                    const resize = levitated?.resize && this.getFloatingResize(role, levitated.resize)
                    const size = levitated && this.preferredPaneSize(role)
                    const leaving = this.exitingPaneBounds.get(role)
                    const hidden = !levitated && (this.layoutUnavailable || (index < 0 && !reflowed))
                    const customEnter = this.paneAnimation(role).enter !== undefined
                    const customExit = this.exitingPaneTransitions.has(role)
                    const presence = (hidden ? customExit : customEnter) ? undefined : this.panePresenceMotions.get(role)
                    const offset = presence && presenceOffset?.(role)
                    const target = previewBounds?.get(role)
                    const previewOnly = target && (hidden || this.isCollapsed(index)) ? target : undefined
                    const origin = preview?.from.get(role)
                    const previewTransform = preview && origin && !previewOnly
                        ? target ? interpolatePaneBounds(origin, target, preview.progress) : `scale(${1 - preview.progress * 0.1})`
                        : undefined
                    const previewOpacity = preview && (previewOnly || (!hidden && !target))
                        ? previewOnly ? preview.progress : 1 - preview.progress
                        : undefined
                    const bounds = currentBounds?.get(role)
                    const margins = bounds && this.marginsFor(role, false, bounds)
                    const floatingHeight = size ? (resize && !resize.inline ? resize.value : size.height) : 0
                    const rtlBox = rtlBounds?.get(role)
                    const rtlMargins = rtlBox && this.marginsFor(role, true, rtlBox)
                    return html`
                        <div class="pane" part="pane pane-${role}${levitated ? ' levitated-pane' : ''}" id="pane-${role}"
                            style=${styleMap({
                                gridColumn: !levitated && !previewOnly && (index >= 0 || reflowed)
                                    ? String(firstPaneColumn + (reflowed ? 0 : 2 * index)) : undefined,
                                gridRow: this.blockPartitions && !levitated && !previewOnly && !hidden
                                    ? (reflowed ? '4' : '2') : undefined,
                                insetBlockStart: levitated && floatingBand && !margins ? `${floatingBand.start}px` : undefined,
                                insetBlockEnd: levitated && floatingBand && !margins ? `${this.height - floatingBand.end}px` : undefined,
                                '--_levitated-inline-size': size ? `${resize?.inline ? resize.value : size.width}px` : undefined,
                                '--_levitated-block-size': size ? `${Math.min(floatingHeight, floatingBand ? floatingBand.end - floatingBand.start : this.height)}px` : undefined,
                                '--_exit-left': leaving ? `${leaving.left}px` : undefined,
                                '--_exit-top': leaving ? `${leaving.top}px` : undefined,
                                '--_exit-width': leaving ? `${leaving.width}px` : undefined,
                                '--_exit-height': leaving ? `${leaving.height}px` : undefined,
                                '--_preview-left': previewOnly ? `${previewOnly.left}px` : undefined,
                                '--_preview-top': previewOnly ? `${previewOnly.top}px` : undefined,
                                '--_preview-width': previewOnly ? `${previewOnly.width}px` : undefined,
                                '--_preview-height': previewOnly ? `${previewOnly.height}px` : undefined,
                                '--_preview-transform': previewTransform,
                                '--_pane-presence-translate': offset === undefined ? undefined : `${offset}px`,
                                '--_pane-margin-inline-start': margins ? `${margins.inlineStart}px` : undefined,
                                '--_pane-margin-inline-end': margins ? `${margins.inlineEnd}px` : undefined,
                                '--_pane-margin-block-start': margins ? `${margins.blockStart}px` : undefined,
                                '--_pane-margin-block-end': margins ? `${margins.blockEnd}px` : undefined,
                                '--_pane-margin-inline-start-rtl': rtlMargins ? `${rtlMargins.inlineStart}px` : undefined,
                                '--_pane-margin-inline-end-rtl': rtlMargins ? `${rtlMargins.inlineEnd}px` : undefined,
                                '--_levitated-inset-inline': margins && levitated ? `${margins.box.left}px` : undefined,
                                '--_levitated-inset-block': margins && levitated ? `${margins.box.top}px` : undefined,
                                '--_levitated-inset-width': margins && levitated ? `${margins.box.width}px` : undefined,
                                '--_levitated-inset-height': margins && levitated ? `${margins.box.height}px` : undefined,
                                opacity: previewOpacity === undefined ? undefined : String(previewOpacity),
                            })}
                            ?hidden=${hidden && !previewOnly} ?data-pane-exit=${Boolean(leaving)} ?data-preview-only=${Boolean(previewOnly)}
                            ?data-custom-enter=${customEnter} ?data-custom-exit=${customExit}
                            data-pane-motion=${presence?.direction ?? nothing} ?data-motion-delayed=${Boolean(presence?.delayed)}
                            ?data-moving-pane=${Boolean((!hidden || leaving) && (offset || presence?.direction === 'center'))}
                            ?data-preview-transform=${Boolean(previewTransform)}
                            ?data-preview-levitated=${previewLayout?.levitated?.pane === role}
                            ?data-pane-margins=${Boolean(margins)} ?data-pane-margins-rtl=${Boolean(rtlMargins)}
                            data-alignment=${levitated ? levitationAlignment(levitated) : nothing}
                            data-resize-edge=${resize?.dockedEdge ?? nothing}
                            role=${levitated ? (scrim ? 'dialog' : levitated.label ? 'region' : nothing) : nothing}
                            aria-modal=${levitated && scrim ? 'true' : nothing}
                            aria-label=${levitated?.label ?? (levitated && scrim ? role : nothing)}
                            ?data-reflowed=${reflowed} ?inert=${!this.isPaneInteractable(role)} tabindex="-1">
                            ${resize ? this.renderFloatingHandle(role, resize, levitated!.resize!) : nothing}
                            <slot name=${role} @slotchange=${this.handleSlotChange}></slot>
                        </div>
                        ${!this.layoutUnavailable && !this.partitions && index >= 0 && index < this.visible.length - 1
                            ? this.resizable ? this.renderSplitter(role, index)
                                : html`<div part="pane-spacer" style=${styleMap({ gridColumn: String(2 * index + 2) })}></div>`
                            : nothing}
                    `
                })}
            </div>
        `
    }

    private get layoutKey(): string {
        return `${this.pattern}:${this.visible.join(',')}`
    }

    private get layoutUnavailable(): boolean {
        return this.partitions?.length === 0 || this.blockPartitions?.length === 0
    }

    private get renderedLevitatedPane(): PaneLayout['levitated'] {
        return this.blockPartitions?.length === 0 ? undefined : this.levitated
    }

    private expansionKey(roles: readonly PaneScaffoldRole[]): string {
        return roles.length === 2 && this.expansionStateKey != null
            ? SharedExpansionKeyPrefix + this.expansionStateKey
            : paneExpansionLayoutKey(this.pattern)(roles)
    }

    private expansionRequestKey(): string {
        if (this.expansionStateKey != null) return SharedExpansionKeyPrefix + this.expansionStateKey
        return this.synchronisedPattern === this.pattern && this.visible.length === 2
            ? this.expansionKey(this.visible) : PendingExpansionKeyPrefix + this.pattern
    }

    private expansionFor(key: string): PaneScaffoldSavedExpansion | undefined {
        const stored = this.paneExpansions.get(key)
        if (stored && (!('anchor' in stored) || this.expansionAnchors.some(anchor => anchor.id === stored.anchor))) return stored
        const requested = stored && 'anchor' in stored ? stored.requested : undefined
        if (this.initialExpansionAnchor != null && !this.proportions.has(key)) {
            return requested ? { anchor: this.initialExpansionAnchor, requested } : { anchor: this.initialExpansionAnchor }
        }
        return requested
    }

    private isCollapsed(index: number): boolean {
        return !this.partitions && this.visible.length > 1 && this.widths[index] === 0
    }

    private get availablePaneWidth(): number {
        return this.width - Math.max(0, this.visible.length - 1) * this.effectiveDirective.spacer
    }

    private get minimumPaneWidth(): number {
        return Math.min(this.effectiveDirective.minimumWidth, this.availablePaneWidth / Math.max(1, this.visible.length))
    }

    private get effectiveDirective() {
        return resolveDirective(this.width, this.height)(this.layoutDirective)
    }

    private panePartitionTracks(
        roles: readonly PaneScaffoldRole[], rtl: boolean, { spacer, preferred, minimumWidth, preferredWidths } = this.effectiveDirective,
    ): number[] {
        const physicalRoles = rtl ? roles.toReversed() : roles
        const tracks = partitionTracks(this.width, spacer, preferred, minimumWidth, this.pattern, preferredWidths)(
            this.partitions!, physicalRoles,
        )
        return rtl ? tracks.reverse() : tracks
    }

    private previewRectangles(target: PanePreviewTarget, layout: PaneLayout): Map<PaneScaffoldRole, PaneRectangle> {
        const rtl = this.partitions ? this.matches(':dir(rtl)') : this.direction < 0
        const prior = 'index' in target && target.index === this.scene?.previousSceneIndex ? this.scene?.previousDirective : undefined
        const directive = prior ? resolveDirective(this.width, this.height)(prior) : this.effectiveDirective
        const bounds = this.paneRectangles(layout, rtl, this.widthsFor(layout.expanded, directive), directive)
        for (const [role, rect] of bounds) {
            const adjusted = this.marginsFor(role, rtl, rect)?.box
            if (adjusted) bounds.set(role, adjusted)
        }
        return bounds
    }

    private marginsFor(role: PaneScaffoldRole, rtl: boolean, rect: PaneRectangle) {
        const fixed = this.layoutDirective?.paneMargins?.[role]
        const insets = this.layoutDirective?.paneInsets?.[role]
        if (fixed || insets) return resolvePaneMargins(this.width, this.height, rtl, fixed, insets)(rect)
    }

    private paneRectangles(
        { expanded, reflowed, levitated }: PaneLayout, rtl: boolean, widths: readonly number[], directive = this.effectiveDirective,
    ): Map<PaneScaffoldRole, PaneRectangle> {
        const [primary, secondary] = this.paneRows(reflowed?.pane, directive)
        if (!primary) return new Map()
        const { spacer } = directive
        const collapsed = widths.length === 2 ? widths.findIndex(width => width === 0) : -1
        const columns = this.partitions ? this.panePartitionTracks(expanded, rtl, directive) : widths.flatMap((width, i) => [
            i === 0 || collapsed >= 0 ? 0 : spacer,
            width > 0 && collapsed >= 0 ? this.width : width,
        ])
        const bounds = paneRectanglesFromTracks(this.width, primary.end - primary.start, rtl)(columns, expanded)
        for (const [role, rect] of bounds) bounds.set(role, { ...rect, top: primary.start })
        if (reflowed && secondary) {
            const anchor = bounds.get(reflowed.reflowUnder)
            if (anchor) bounds.set(reflowed.pane, { ...anchor, top: secondary.start, height: secondary.end - secondary.start })
        }
        if (levitated) {
            const { pane, strategy } = levitated
            const preferred = this.preferredPaneSize(pane, directive)
            const resize = strategy.resize && this.getFloatingResize(pane, strategy.resize, preferred)
            const width = Math.min(this.width, resize?.inline ? resize.value : preferred.width)
            const floatingBand = this.paneRows()[0]
            const height = Math.min(floatingBand.end - floatingBand.start, resize && !resize.inline ? resize.value : preferred.height)
            const alignment = levitationAlignment(strategy)
            const inline = alignment.endsWith('inline-start') ? 0
                : alignment.endsWith('inline-end') ? this.width - width : (this.width - width) / 2
            const top = alignment.startsWith('block-start') ? floatingBand.start
                : alignment.startsWith('block-end') ? floatingBand.end - height : (floatingBand.start + floatingBand.end - height) / 2
            bounds.set(pane, { left: rtl ? this.width - width - inline : inline, top, width, height })
        }
        return bounds
    }

    private get paneRowTracks(): string {
        const [primary, secondary] = this.paneRows(this.reflowed?.pane)
        if (!primary) return '0px 0px 0px 0px 0px'
        const gap = secondary ? secondary.start - primary.end : 0
        const lower = secondary ? secondary.end - secondary.start : 0
        const active = [primary.end - primary.start, gap, lower]
        const tracks = this.blockPartitions ? [primary.start, ...active, this.height - (secondary?.end ?? primary.end)] : active
        return tracks.map(track => `${track}px`).join(' ')
    }

    private paneRows(
        pane?: PaneScaffoldRole, { verticalSpacer, preferredHeight, preferredHeights } = this.effectiveDirective,
    ): PaneRange[] {
        const selected = this.blockPartitions?.toSorted((a, b) => (b.end - b.start) - (a.end - a.start))
            .slice(0, pane ? 2 : 1).sort((a, b) => a.start - b.start) ?? [{ start: 0, end: this.height }]
        if (!pane || selected.length !== 1) return selected
        const [region] = selected
        const gap = Math.min(verticalSpacer, region.end - region.start)
        const available = region.end - region.start - gap
        const preferred = preferredHeights[pane] ?? preferredHeight
        const lower = Math.min(available / 2, preferred)
        return [{ start: region.start, end: region.end - gap - lower }, { start: region.end - lower, end: region.end }]
    }

    private preferredPaneSize(role: PaneScaffoldRole, { preferred, preferredHeight, preferredWidths, preferredHeights } = this.effectiveDirective) {
        return {
            width: preferredWidths[role] ?? preferred,
            height: preferredHeights[role] ?? preferredHeight,
        }
    }

    private getFloatingResize(role: PaneScaffoldRole, config: IPaneScaffoldLevitationResize, size = this.preferredPaneSize(role)): FloatingResize {
        const key = `${this.pattern}:${role}:${config.dockedEdge}`
        const band = this.paneRows()[0]
        const resize = resolveLevitationResize(this.width, band ? band.end - band.start : 0, size.width, size.height)(
            config, this.floatingSizes.get(key) ?? { mode: 'partial' },
        )
        const motion = this.floatingSizeMotion
        return { ...resize, key, value: motion?.key === key ? motion.value : resize.value }
    }

    private renderFloatingHandle(role: PaneScaffoldRole, resize: FloatingResize, config: IPaneScaffoldLevitationResize) {
        return html`<div class="floating-handle" part="levitated-resize-handle" role="separator" tabindex="0"
            aria-controls="pane-${role}" aria-label=${config.label ?? `Resize ${role} pane`}
            aria-orientation=${resize.inline ? 'vertical' : 'horizontal'}
            aria-valuemin=${Math.round(resize.min)} aria-valuemax=${Math.round(resize.max)} aria-valuenow=${Math.round(resize.value)}
            @keydown=${(event: KeyboardEvent) => this.resizeFloatingWithKey(resize, event)}
            @click=${(event: MouseEvent) => { if (event.detail === 0) this.cycleFloatingSize() }}
            @pointerdown=${(event: PointerEvent) => this.startFloatingDrag(resize, event)}
            @pointermove=${this.moveFloatingDrag} @pointerup=${this.finishFloatingDrag}
            @pointercancel=${this.finishFloatingDrag} @lostpointercapture=${this.finishFloatingDrag}>
            ${this.renderHandleVisual(`${role}-floating-handle`)}
        </div>`
    }

    private renderSplitter(role: PaneScaffoldRole, index: number) {
        const width = this.widths[index]
        const pairWidth = width + this.widths[index + 1]
        const anchors = this.visible.length === 2 ? this.getExpansionAnchors() : []
        const atStart = this.isCollapsed(index)
        const atEnd = this.isCollapsed(index + 1)
        const minimum = atStart || anchors.some(anchor => anchor.width === 0) ? 0 : this.minimumPaneWidth
        const maximum = atEnd || anchors.some(anchor => anchor.width === pairWidth) ? pairWidth : pairWidth - this.minimumPaneWidth
        return html`<div class="splitter" part="pane-spacer splitter" tabindex="0" role="separator" aria-orientation="vertical"
            style=${styleMap({ gridColumn: String(2 * index + 2) })}
            ?inert=${Boolean(this.levitated?.strategy.scrim)}
            data-collapsed=${atStart ? 'start' : atEnd ? 'end' : nothing}
            aria-controls="pane-${role}" aria-label=${`Resize ${role} pane`}
            aria-valuemin=${Math.round(minimum)} aria-valuemax=${Math.round(maximum)}
            aria-valuenow=${Math.round(width)} aria-valuetext=${`${Math.round(width)} pixels`}
            @keydown=${(event: KeyboardEvent) => this.resizeWithKey(index, event)}
            @click=${this.activateSplitter}
            @pointerdown=${(event: PointerEvent) => this.startDrag(index, event)}
            @pointermove=${this.moveDrag}
            @pointerup=${this.endDrag}
            @pointercancel=${this.endDrag}
            @lostpointercapture=${this.endDrag}>
            ${this.renderHandleVisual(`${role}-divider`)}
        </div>`
    }

    private renderHandleVisual(slot: string) {
        return html`<span class="handle-visual" inert aria-hidden="true">
            <slot name=${slot}><span class="default-grip" part="resize-grip"></span></slot>
        </span>`
    }

    private readonly handleSlotChange = (): void => {
        this.requestUpdate()
    }

    private reconcile(): void {
        if (!Object.values(PaneScaffoldPattern).includes(this.pattern)) throw new Error(`Invalid pane pattern: ${this.pattern}`)
        const previous = this.currentDestination
        const roles: readonly PaneScaffoldRole[] = PaneRoles[this.pattern]
        this.present = new Set(roles.filter(role => this.assignedPane(role).length > 0))

        if (this.synchronisedPattern !== this.pattern) {
            this.scene = undefined
            this.synchronisedPattern = this.pattern
            this.history = [{ destination: initialDestination(this.pattern) }]
            if (!this.scaffoldValue) this.destinationChanged('pattern-change')
            return
        }
        if (this.scaffoldValue || this.scene) return
        const valid = pruneHistory(this.present)(this.history)
        if (valid.length === this.history.length) return
        this.clearPanePreview()
        const first = roles.find(role => this.present.has(role))
        this.history = valid.length ? valid : [{
            destination: first ? { pane: first, contentKey: undefined } : initialDestination(this.pattern),
        }]
        if (this.pendingHistoryChange) {
            if (this.pendingFocus) this.pendingFocus = this.history.at(-1)
        } else if (!sameDestination(previous)(this.currentDestination)) {
            this.destinationChanged('pane-removed', this.history.at(-1))
        }
    }

    private controlledLayout(value: IPaneScaffoldValue): PaneLayout {
        const order = resolvePaneOrder(this.pattern, this.layoutDirective?.paneOrder)
        const { destination, expandedPanes, reflowedPane, levitatedPane } = value
        if (!destination || !order.includes(destination.pane)
            || (destination.contentKey !== undefined && typeof destination.contentKey !== 'string')
            || !Array.isArray(expandedPanes)) throw new Error('Invalid controlled pane scaffold value')
        const roles = [...expandedPanes]
        if (reflowedPane) roles.push(reflowedPane.pane)
        if (levitatedPane !== undefined) roles.push(levitatedPane)
        if (new Set(roles).size !== roles.length || !roles.every(role => order.includes(role))
            || (reflowedPane && !expandedPanes.includes(reflowedPane.reflowUnder))) {
            throw new Error('Invalid controlled pane arrangement')
        }
        const expanded = order.filter(role => expandedPanes.includes(role) && this.present.has(role))
        const reflowed = reflowedPane && expanded.includes(reflowedPane.reflowUnder) && this.present.has(reflowedPane.pane)
            ? { ...reflowedPane } : undefined
        const strategy = levitatedPane && this.adaptStrategies[levitatedPane]
        const levitated: PaneLayout['levitated'] = levitatedPane && this.present.has(levitatedPane)
            ? { pane: levitatedPane, strategy: strategy?.type === 'levitate' ? strategy : { type: 'levitate' } } : undefined
        return { expanded, reflowed, levitated }
    }

    private assignedPane(role: PaneScaffoldRole): Element[] {
        return [...this.children].filter(child => child.slot === role)
    }

    private destinationChanged(reason: IPaneScaffoldChangeDetail['reason'], entry?: HistoryEntry): void {
        this.pendingHistoryChange = undefined
        this.clearPanePreview()
        this.pendingFocus = entry
        this.requestUpdate()
        this.dispatchDestinationChange(reason)
    }

    private dispatchDestinationChange(reason: IPaneScaffoldChangeDetail['reason']): void {
        this.dispatchEvent(new CustomEvent<IPaneScaffoldChangeDetail>('pane-change', {
            detail: { destination: this.currentDestination, reason },
            bubbles: true,
            composed: true,
        }))
    }

    private focusedPane(): PaneScaffoldRole | undefined {
        const active = (this.getRootNode() as Document | ShadowRoot).activeElement
        const wrapper = this.focusedShadowElement?.closest('.pane')
        return Roles.find(role => wrapper?.id === `pane-${role}`
            || this.assignedPane(role).some(element => element.contains(active ?? null)))
    }

    private get focusedShadowElement(): Element | null | undefined {
        if ((this.getRootNode() as Document | ShadowRoot).activeElement === this) return this.shadowRoot?.activeElement
    }

    private rememberFocus(): void {
        if (this.scaffoldValue) return
        if (this.focusedPane() !== this.currentDestination.pane) return
        const active = (this.getRootNode() as Document | ShadowRoot).activeElement
        this.history.at(-1)!.focus = (active === this ? this.shadowRoot?.activeElement : active) as HTMLElement
    }

    private focusPane(role: PaneScaffoldRole, previous?: HTMLElement): void {
        const wrapper = this.shadowRoot!.getElementById(`pane-${role}`)!
        const assigned = this.assignedPane(role)
        const canRestore = previous && (previous === wrapper || assigned.some(element => element.contains(previous)))
        const targets = previous ? [...(canRestore ? [previous] : []), wrapper] : [...this.focusTargets(assigned), wrapper]
        for (const target of targets) {
            if (!(target instanceof HTMLElement) || target.matches(':disabled, input[type=hidden]') || target.closest('[hidden], [inert]')) continue
            target.focus({ preventScroll: true })
            if (this.focusedPane() === role) return
        }
    }

    private focusTargets(assigned: readonly Element[]): HTMLElement[] {
        return assigned.flatMap(element => [
            ...(element.matches(Focusable) ? [element] : []),
            ...element.querySelectorAll(Focusable),
        ]).filter((element): element is HTMLElement => element instanceof HTMLElement
            && !element.matches(':disabled, input[type=hidden]') && !element.closest('[hidden], [inert]'))
    }

    private readonly dismissLevitatedPane = (): void => {
        if (!this.levitated) return
        if (this.scaffoldValue) {
            this.dispatchEvent(new CustomEvent('pane-dismiss-request', {
                detail: { pane: this.levitated.pane }, bubbles: true, composed: true,
            }))
        } else if (this.canGoBack) this.goBack()
    }

    private readonly handleLevitationKeys = (event: KeyboardEvent): void => {
        const levitated = this.levitated
        if (!levitated || event.defaultPrevented) return
        if (event.key === 'Escape' && (this.scaffoldValue || this.canGoBack)) {
            event.preventDefault()
            this.dismissLevitatedPane()
        }
        if (event.key !== 'Tab' || !levitated.strategy.scrim) return
        const targets = this.focusTargets(this.assignedPane(levitated.pane))
            .filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0)
        const handle = this.shadowRoot?.querySelector<HTMLElement>('[part=levitated-resize-handle]')
        if (handle) {
            if (levitated.strategy.resize?.dockedEdge.endsWith('-end')) targets.unshift(handle)
            else targets.push(handle)
        }
        const rootActive = (this.getRootNode() as Document | ShadowRoot).activeElement
        const active = rootActive === this ? this.shadowRoot?.activeElement : rootActive
        const boundary = event.shiftKey ? targets[0] : targets.at(-1)
        if (active !== boundary && targets.some(target => target === active)) return
        event.preventDefault()
        const next = event.shiftKey ? targets.at(-1) : targets[0]
        const target = next ?? this.shadowRoot!.getElementById(`pane-${levitated.pane}`)
        target?.focus()
    }

    private floatingDirection(resize: FloatingResize): number {
        return (resize.dockedEdge.endsWith('-end') ? -1 : 1) * (resize.inline ? this.direction : 1)
    }

    private resizeFloatingWithKey(resize: FloatingResize, event: KeyboardEvent): void {
        const { key } = event
        const forward = resize.inline ? 'ArrowRight' : 'ArrowDown'
        const backward = resize.inline ? 'ArrowLeft' : 'ArrowUp'
        if (![forward, backward, 'Home', 'End', 'Enter', ' '].includes(key)) return
        event.preventDefault()
        if (key === forward || key === backward) {
            this.dragFloatingPaneBy(key === forward ? 16 : -16)
            return
        }
        this.stopFloatingDrag()
        if (key === 'Enter' || key === ' ') {
            this.cycleFloatingSize()
        } else {
            this.stopFloatingSizeMotion()
            this.floatingSizes.set(resize.key, { ...this.floatingSizes.get(resize.key), mode: key === 'Home' ? 'collapsed' : 'expanded' })
            this.requestUpdate()
        }
    }

    private startFloatingDrag(resize: FloatingResize, event: PointerEvent): void {
        if (this.floatingDrag || event.button !== 0 || !event.isPrimary) return
        const handle = event.currentTarget as HTMLElement
        handle.setPointerCapture(event.pointerId)
        this.floatingDrag = {
            resize, handle, pointerId: event.pointerId, start: resize.inline ? event.clientX : event.clientY,
            direction: this.floatingDirection(resize), previous: this.floatingSizes.get(resize.key), moved: false,
        }
    }

    private readonly moveFloatingDrag = (event: PointerEvent): void => {
        const drag = this.floatingDrag
        if (!drag || event.pointerId !== drag.pointerId) return
        const delta = (drag.resize.inline ? event.clientX : event.clientY) - drag.start
        if (!drag.moved && Math.abs(delta) < 3) return
        if (!drag.moved && this.floatingSizeMotion?.key === drag.resize.key) drag.resize.value = this.floatingSizeMotion.value
        drag.moved = true
        this.setFloatingSize(drag.resize, drag.resize.value + delta * drag.direction)
    }

    private readonly finishFloatingDrag = (event: PointerEvent): void => {
        const drag = this.floatingDrag
        if (!drag || event.pointerId !== drag.pointerId) return
        if (event.type === 'pointerup') this.moveFloatingDrag(event)
        this.stopFloatingDrag()
        if (event.type === 'pointerup') {
            if (!drag.moved) this.cycleFloatingSize()
        } else if (drag.moved) {
            if (drag.previous) this.floatingSizes.set(drag.resize.key, drag.previous)
            else this.floatingSizes.delete(drag.resize.key)
            this.requestUpdate()
        }
    }

    private stopFloatingDrag(): void {
        const drag = this.floatingDrag
        this.floatingDrag = undefined
        if (drag?.handle.hasPointerCapture(drag.pointerId)) drag.handle.releasePointerCapture(drag.pointerId)
    }

    private cycleFloatingSize(): void {
        const levitated = this.levitated
        const config = levitated?.strategy.resize
        if (!levitated || !config) return
        const { key, value: from } = this.getFloatingResize(levitated.pane, config)
        this.clearPanePreview()
        this.stopFloatingSizeMotion()
        this.floatingSizes.set(key, nextLevitationSize(this.floatingSizes.get(key) ?? { mode: 'partial' }))
        const { value: to } = this.getFloatingResize(levitated.pane, config)
        if (this.animatePanes && !this.reducedMotion?.matches && Math.abs(from - to) > 0.5) {
            const displacement = springDisplacementAt(from - to, 0, FloatingSizeSpring)
            const motion = { key, value: from, frame: 0 }
            let start: number | undefined
            const step = (timestamp: number) => {
                if (this.floatingSizeMotion !== motion) return
                start ??= timestamp
                const distance = displacement((timestamp - start) / 1000)
                if (Math.abs(distance) <= 0.5) this.floatingSizeMotion = undefined
                else {
                    motion.value = to + distance
                    motion.frame = requestAnimationFrame(step)
                }
                this.requestUpdate()
            }
            this.floatingSizeMotion = motion
            motion.frame = requestAnimationFrame(step)
        }
        this.requestUpdate()
    }

    private stopFloatingSizeMotion(): void {
        const motion = this.floatingSizeMotion
        if (motion) cancelAnimationFrame(motion.frame)
        this.floatingSizeMotion = undefined
    }

    private setFloatingSize(resize: FloatingResize, size: number): void {
        this.clearPanePreview()
        this.stopFloatingSizeMotion()
        const partial = Math.max(resize.min, Math.min(resize.max, size))
        const mode = partial === resize.min ? 'collapsed' : partial === resize.max ? 'expanded' : 'partial'
        this.floatingSizes.set(resize.key, { mode, partial })
        this.requestUpdate()
    }

    private get direction(): number {
        return getComputedStyle(this).direction === 'rtl' ? -1 : 1
    }

    private resizeWithKey(index: number, event: KeyboardEvent): void {
        const width = this.widths[index]
        if ((event.key === 'Enter' || event.key === ' ') && this.cycleExpansionAnchor()) {
            event.preventDefault()
            return
        }
        if (this.visible.length === 2 && (event.key === 'Home' || event.key === 'End')) {
            const endpoint = event.key === 'Home' ? 0 : this.availablePaneWidth
            const anchor = this.getExpansionAnchors().find(item => item.width === endpoint)
            if (anchor) {
                event.preventDefault()
                this.snapToExpansionAnchor(anchor.id)
                return
            }
        }
        const positions: Readonly<Record<string, number>> = {
            ArrowLeft: width - 16 * this.direction,
            ArrowRight: width + 16 * this.direction,
            Home: this.minimumPaneWidth,
            End: width + this.widths[index + 1] - this.minimumPaneWidth,
        }
        if (!Object.hasOwn(positions, event.key)) return
        event.preventDefault()
        const position = positions[event.key]
        if ((this.isCollapsed(index) && position <= width) || (this.isCollapsed(index + 1) && position >= width)) return
        this.stopDrag()
        this.applyWidths(resizeAdjacent(index, position, this.minimumPaneWidth)(this.widths))
    }

    private startDrag(index: number, event: PointerEvent): void {
        if (this.drag || event.button !== 0 || !event.isPrimary) return
        if (this.preview) this.seekBack(0)
        if (this.sharedFling) this.applyWidths(this.widths)
        const handle = event.currentTarget as HTMLElement
        handle.setPointerCapture(event.pointerId)
        const grid = handle.closest<HTMLElement>('.grid')!
        const widths = this.dragStartWidths(grid)
        this.drag = {
            handle, pointerId: event.pointerId, index, lastX: event.clientX, offset: widths[index],
            direction: this.direction, widths, layout: this.layoutKey, moved: false, resized: false,
            samples: [{ offset: widths[index], time: event.timeStamp }],
        }
    }

    private readonly moveDrag = (event: PointerEvent): void => {
        const drag = this.drag
        if (!drag || drag.pointerId !== event.pointerId || drag.layout !== this.layoutKey) return
        const delta = (event.clientX - drag.lastX) * drag.direction
        if (delta === 0) return
        const remaining = this.remainingDragDelta(delta)
        if (drag !== this.drag) return
        drag.lastX = event.clientX
        drag.offset += remaining
        drag.moved = true
        const latest = drag.samples.at(-1)!
        if (event.timeStamp >= latest.time) {
            drag.samples = drag.samples.filter(sample => event.timeStamp - sample.time <= VelocitySampleWindow)
            drag.samples.push({ offset: drag.offset, time: event.timeStamp })
        }
        if (remaining === 0) return
        drag.resized = true
        this.stopExpansionMotion()
        this.widths = resizeAdjacent(drag.index, drag.offset, this.minimumPaneWidth)(drag.widths)
        this.requestUpdate()
    }

    private readonly endDrag = (event: PointerEvent): void => {
        const drag = this.drag
        if (!drag || event.pointerId !== drag.pointerId) return
        if (event.type === 'pointerup') this.moveDrag(event)
        if (drag !== this.drag) return
        this.stopDrag()
        if (!drag.moved) {
            if (event.type === 'pointerup') this.cycleExpansionAnchor()
            return
        }
        if (!drag.resized) return
        if (event.type !== 'pointerup') {
            this.requestUpdate()
            return
        }
        const first = drag.samples[0]
        const latest = drag.samples.at(-1)!
        const duration = latest.time - first.time
        const velocity = duration > 0 && event.timeStamp - latest.time <= VelocityPause
            ? (latest.offset - first.offset) / duration * 1000
            : 0
        this.settleExpansion(drag.offset, velocity)
    }

    private settleExpansion(offset: number, velocity: number): void {
        const anchors = this.visible.length === 2 ? this.getExpansionAnchors() : []
        if (!anchors.length) {
            this.applyWidths(this.widths)
            return
        }
        const maxWidth = this.availablePaneWidth
        const position = Math.min(maxWidth, Math.max(0, offset))
        const min = anchors.some(anchor => anchor.width === 0) ? 0 : this.minimumPaneWidth
        const max = anchors.some(anchor => anchor.width === maxWidth) ? maxWidth : maxWidth - this.minimumPaneWidth
        const startPosition = this.widths[0]
        const release = { position, velocity, maxWidth, startPosition, minPosition: min, maxPosition: max }
        const custom = this.expansionFling?.(release)
        if (custom && ![custom.position, custom.velocity].every(Number.isFinite)) {
            throw new Error('Pane expansion fling requires finite position and velocity')
        }
        const decay = custom ? resolveCustomFlingTrajectory(release, custom)
            : Math.abs(position - startPosition) <= 0.5 ? resolveFlingDecay(startPosition, velocity, min, max) : undefined
        const fling = decay ?? custom ?? { position, velocity: 0 }
        if (this.consumeDragDelta && decay && decay.duration > 0 && !this.reducedMotion?.matches) {
            this.shareFling(release, decay, custom === undefined)
            return
        }
        const anchor = findExpansionReleaseAnchor(Math.min(maxWidth, Math.max(0, fling.position)), fling.velocity)(anchors)!
        void this.animateExpansion(anchor, fling.velocity, decay)
    }

    private remainingDragDelta(delta: number): number {
        const remaining = this.consumeDragDelta ? this.consumeDragDelta(delta) : delta
        if (!Number.isFinite(remaining)) throw new Error('Pane drag remainder must be finite')
        return remaining
    }

    private shareFling(release: IPaneExpansionFlingInput, decay: PaneFlingDecay, stopWhenConsumed: boolean): void {
        let frame = 0
        let startTime: number | undefined
        let previousTime = 0
        let previousPosition = release.startPosition
        let velocity = release.velocity
        const motion = {
            cancel: () => cancelAnimationFrame(frame),
            finish: () => {
                if (this.sharedFling !== motion) return
                motion.cancel()
                this.sharedFling = undefined
                const anchor = findExpansionReleaseAnchor(this.widths[0], velocity)(this.getExpansionAnchors())
                if (anchor) void this.animateExpansion(anchor, velocity)
                else this.applyWidths(this.widths)
            },
        }
        const step = (timestamp: number): void => {
            if (this.sharedFling !== motion) return
            startTime ??= timestamp
            const elapsed = Math.min(decay.duration, timestamp - startTime)
            try {
                const position = elapsed === decay.duration ? decay.position : decay.positionAt(elapsed)
                const delta = position - previousPosition
                const remaining = delta === 0 ? 0 : this.remainingDragDelta(delta)
                if (this.sharedFling !== motion) return
                const current = this.widths[0]
                const next = Math.min(release.maxPosition, Math.max(release.minPosition, current + remaining))
                if (next !== current) {
                    this.widths = [next, release.maxWidth - next]
                    this.requestUpdate()
                }
                if (elapsed > previousTime) velocity = delta * 1000 / (elapsed - previousTime)
                previousTime = elapsed
                previousPosition = position
                if (elapsed === decay.duration) {
                    velocity = decay.velocity
                    motion.finish()
                } else if (stopWhenConsumed && Math.abs(delta - (next - current)) > 0.5) {
                    motion.finish()
                } else {
                    frame = requestAnimationFrame(step)
                }
            } catch (error) {
                if (this.sharedFling === motion) {
                    this.stopExpansionMotion()
                    this.requestUpdate()
                }
                throw error
            }
        }
        this.sharedFling = motion
        frame = requestAnimationFrame(step)
    }

    private stopDrag(): void {
        const drag = this.drag
        this.drag = undefined
        if (drag?.handle.hasPointerCapture(drag.pointerId)) drag.handle.releasePointerCapture(drag.pointerId)
    }

    private applyWidths(widths: number[]): void {
        this.widths = widths
        this.clearPanePreview()
        this.stopExpansionMotion()
        const key = this.expansionKey(this.visible)
        const expansion = this.paneExpansions.get(key)
        if (expansion && 'anchor' in expansion) {
            if (expansion.requested) this.paneExpansions.set(key, expansion.requested)
            else this.paneExpansions.delete(key)
        }
        this.proportions.set(key, widths.map(width => width / this.availablePaneWidth))
        this.requestUpdate()
    }

    private getExpansionAnchors() {
        return resolveExpansionAnchors(this.availablePaneWidth, this.minimumPaneWidth)(this.expansionAnchors)
    }

    private readonly activateSplitter = (event: MouseEvent): void => {
        if (event.detail === 0) this.cycleExpansionAnchor()
    }

    private cycleExpansionAnchor(): boolean {
        if (this.visible.length !== 2) return false
        const anchors = this.getExpansionAnchors()
        const next = anchors.find(anchor => anchor.width > this.widths[0] + 0.5) ?? anchors[0]
        if (!next) return false
        this.snapToExpansionAnchor(next.id)
        return true
    }

    private setPaneExpansion(expansion: PaneScaffoldSavedExpansion): void {
        if ('type' in expansion) validateExpansion(expansion.type, expansion.value)
        else this.requireAdjustablePaneExpansion()
        this.stopDrag()
        this.clearPanePreview()
        this.stopExpansionMotion()
        const key = this.expansionRequestKey()
        this.proportions.delete(key)
        const previous = this.paneExpansions.get(key)
        const requested = previous && ('anchor' in previous ? previous.requested : previous)
        this.paneExpansions.set(key, 'anchor' in expansion && requested ? { ...expansion, requested } : expansion)
        this.requestUpdate()
    }

    private requireAdjustablePaneExpansion(): void {
        if (this.visible.length !== 2 || this.partitions || this.layoutUnavailable) {
            throw new Error('Pane expansion requires an adjustable two-pane layout')
        }
    }

    private expansionTracks(widths: readonly number[]): number[] {
        if (widths[0] === 0) return [0, 0, this.width]
        if (widths[1] === 0) return [this.width, 0, 0]
        return [widths[0], this.effectiveDirective.spacer, widths[1]]
    }

    private renderedExpansionTracks(grid: HTMLElement): number[] {
        return this.expansionMotion?.animation
            ? getComputedStyle(grid).gridTemplateColumns.split(' ').map(track => Number.parseFloat(track))
            : this.expansionTracks(this.widths)
    }

    private dragStartWidths(grid: HTMLElement): number[] {
        if (!this.expansionMotion?.animation) return this.widths
        const first = Math.min(this.availablePaneWidth, this.renderedExpansionTracks(grid)[0])
        return [first, this.availablePaneWidth - first]
    }

    private stopExpansionMotion(): void {
        this.sharedFling?.cancel()
        this.sharedFling = undefined
        const motion = this.expansionMotion
        if (!motion) return
        this.expansionMotion = undefined
        motion.animation?.cancel()
        motion.resolve()
    }
}
