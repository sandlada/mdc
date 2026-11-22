/**
 * @version 2026.11.21
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export const PaneScaffoldPattern = { ListDetail: 'list-detail', SupportingPane: 'supporting-pane' } as const
export type PaneScaffoldPattern = (typeof PaneScaffoldPattern)[keyof typeof PaneScaffoldPattern]

export const PaneScaffoldRole = { List: 'list', Detail: 'detail', Main: 'main', Supporting: 'supporting', Extra: 'extra' } as const
export type PaneScaffoldRole = (typeof PaneScaffoldRole)[keyof typeof PaneScaffoldRole]

export const PaneScaffoldBackNavigationBehavior = {
    PopLatest: 'pop-latest',
    PopUntilScaffoldValueChange: 'pop-until-scaffold-value-change',
    PopUntilCurrentDestinationChange: 'pop-until-current-destination-change',
    PopUntilContentChange: 'pop-until-content-change',
} as const
export type PaneScaffoldBackNavigationBehavior =
    (typeof PaneScaffoldBackNavigationBehavior)[keyof typeof PaneScaffoldBackNavigationBehavior]

export const PaneExpansionAnchorType = {
    Proportion: 'proportion',
    OffsetFromStart: 'offset-from-start',
    OffsetFromEnd: 'offset-from-end',
} as const
export type PaneExpansionAnchorType = (typeof PaneExpansionAnchorType)[keyof typeof PaneExpansionAnchorType]

export interface IPaneExpansionAnchor {
    readonly id: string
    readonly type: PaneExpansionAnchorType
    readonly value: number
}

export interface IPaneScaffoldDestination {
    readonly pane: PaneScaffoldRole
    readonly contentKey: string | undefined
}

export interface IPaneScaffoldChangeDetail {
    readonly destination: IPaneScaffoldDestination
    readonly reason: 'navigate' | 'back' | 'pattern-change' | 'pane-removed' | 'restore' | 'scene' | 'controlled'
}

export interface IPaneScaffoldLayoutChangeDetail {
    readonly visiblePanes: readonly PaneScaffoldRole[]
    readonly interactablePanes: readonly PaneScaffoldRole[]
    readonly reflowedPane?: IPaneScaffoldReflowedPane
    readonly levitatedPane?: PaneScaffoldRole
}

export interface IPaneScaffoldReflowedPane {
    readonly pane: PaneScaffoldRole
    readonly reflowUnder: PaneScaffoldRole
}

export interface IPaneScaffoldValue {
    readonly destination: IPaneScaffoldDestination
    readonly expandedPanes: readonly PaneScaffoldRole[]
    readonly reflowedPane?: IPaneScaffoldReflowedPane
    readonly levitatedPane?: PaneScaffoldRole
}

export interface IPaneScaffoldTransition {
    readonly progress: number
    readonly target: IPaneScaffoldValue
}

export type IPaneScaffoldBackPreview = IPaneScaffoldTransition

export interface IPaneScaffoldExpansionPosition {
    readonly type: PaneExpansionAnchorType
    readonly value: number
}

export type PaneScaffoldSavedExpansion =
    | { readonly anchor: string; readonly requested?: IPaneScaffoldExpansionPosition }
    | IPaneScaffoldExpansionPosition

export interface IPaneScaffoldSavedFloatingSize {
    readonly mode: 'partial' | 'expanded' | 'collapsed'
    readonly partial?: number
}

/** Serializable pane navigation and user sizing. Keys identify pane combinations or docking edges. */
export interface IPaneScaffoldSavedState {
    readonly version: 1
    readonly pattern: PaneScaffoldPattern
    readonly history: readonly { readonly pane: PaneScaffoldRole; readonly contentKey?: string }[]
    readonly proportions: readonly (readonly [string, readonly number[]])[]
    readonly expansions: readonly (readonly [string, PaneScaffoldSavedExpansion])[]
    readonly floatingSizes: readonly (readonly [string, IPaneScaffoldSavedFloatingSize])[]
}

export type PaneScaffoldAdaptStrategy = { readonly type: 'hide' } | {
    readonly type: 'reflow'
    readonly reflowUnder: PaneScaffoldRole
} | IPaneScaffoldLevitateStrategy

export interface IPaneScaffoldLevitateStrategy {
    readonly type: 'levitate'
    readonly alignment?: 'center' | `block-${'start' | 'center' | 'end'}-inline-${'start' | 'center' | 'end'}`
    readonly scrim?: boolean
    readonly label?: string
    readonly resize?: IPaneScaffoldLevitationResize
    readonly onlyIfSinglePane?: boolean
}

export const PaneScaffoldDockedEdge = {
    BlockStart: 'block-start',
    BlockEnd: 'block-end',
    InlineStart: 'inline-start',
    InlineEnd: 'inline-end',
} as const
export type PaneScaffoldDockedEdge = (typeof PaneScaffoldDockedEdge)[keyof typeof PaneScaffoldDockedEdge]

export interface IPaneScaffoldLevitationResize {
    readonly dockedEdge: PaneScaffoldDockedEdge
    readonly minSize?: number
    readonly maxSize?: number
    readonly label?: string
}

/** Physical bounds in CSS pixels relative to the scaffold content box. */
export interface IPaneScaffoldExcludedBounds {
    readonly left: number
    readonly top: number
    readonly right: number
    readonly bottom: number
}

export const PaneHingePolicy = {
    AvoidSeparating: 'avoid-separating',
    AvoidOccluding: 'avoid-occluding',
    AlwaysAvoid: 'always-avoid',
    NeverAvoid: 'never-avoid',
} as const
export type PaneHingePolicy = (typeof PaneHingePolicy)[keyof typeof PaneHingePolicy]

export interface IPaneScaffoldHinge {
    readonly bounds: IPaneScaffoldExcludedBounds
    readonly separating: boolean
    readonly occluding: boolean
}

export interface IPaneScaffoldPosture {
    readonly isTabletop?: boolean
    readonly verticalHinges?: readonly IPaneScaffoldHinge[]
    readonly horizontalHinges?: readonly IPaneScaffoldHinge[]
}

export interface IPaneScaffoldWindowInfo {
    readonly width: number
    readonly height: number
    readonly posture?: IPaneScaffoldPosture
}

export interface IPaneScaffoldDirectiveOptions {
    readonly twoPanesOnMediumWidth?: boolean
    readonly verticalHingePolicy?: PaneHingePolicy
    readonly horizontalHingePolicy?: PaneHingePolicy
}

/** Minimum distances from the logical edges of the scaffold content box, in CSS pixels. */
export interface IPaneScaffoldMargins {
    readonly inlineStart?: number
    readonly inlineEnd?: number
    readonly blockStart?: number
    readonly blockEnd?: number
}

/** A CSS pixel length or a proportion of the entire scaffold along the corresponding axis. */
export type PaneScaffoldPreferredSize = number | { readonly proportion: number }

/** Programmatic overrides for container-derived layout. Lengths are CSS pixels. */
export interface IPaneScaffoldDirective {
    readonly paneOrder?: readonly PaneScaffoldRole[]
    readonly maxHorizontalPartitions?: 1 | 2 | 3
    readonly horizontalPartitionSpacerSize?: number
    readonly minimumPaneWidth?: number
    readonly defaultPanePreferredWidth?: number
    readonly preferredWidths?: Readonly<Partial<Record<PaneScaffoldRole, PaneScaffoldPreferredSize>>>
    readonly maxVerticalPartitions?: 1 | 2
    readonly verticalPartitionSpacerSize?: number
    readonly defaultPanePreferredHeight?: number
    readonly preferredHeights?: Readonly<Partial<Record<PaneScaffoldRole, PaneScaffoldPreferredSize>>>
    readonly excludedBounds?: readonly IPaneScaffoldExcludedBounds[]
    readonly horizontalExcludedBounds?: readonly IPaneScaffoldExcludedBounds[]
    readonly paneMargins?: Readonly<Partial<Record<PaneScaffoldRole, IPaneScaffoldMargins>>>
    readonly paneInsets?: Readonly<Partial<Record<PaneScaffoldRole, IPaneScaffoldMargins>>>
    readonly shouldAutoFocusCurrentDestination?: boolean
}

export interface IPaneExpansionSpring {
    readonly dampingRatio?: number
    readonly stiffness?: number
}

export interface IPaneExpansionMotion {
    readonly position: number
    readonly velocity: number
}

export interface IPaneExpansionFlingInput extends IPaneExpansionMotion {
    readonly maxWidth: number
    readonly startPosition: number
    readonly minPosition: number
    readonly maxPosition: number
}

export interface IPaneExpansionTrajectory {
    readonly duration: number
    readonly positionAt: (milliseconds: number) => number
}

export interface IPaneExpansionFlingResult extends IPaneExpansionMotion {
    readonly trajectory?: IPaneExpansionTrajectory
}

export interface IPaneAnimationTiming {
    readonly duration: number
    readonly easing?: string
}

export interface IPaneTransition extends IPaneAnimationTiming {
    readonly keyframes: readonly Keyframe[]
}

export interface IPaneAnimation {
    readonly enter?: IPaneTransition | false
    readonly exit?: IPaneTransition | false
    readonly bounds?: IPaneAnimationTiming | false
}

export interface IPaneSceneEntry {
    readonly key: string
    readonly pane?: {
        readonly pattern: PaneScaffoldPattern
        readonly sceneKey: string
        readonly role: PaneScaffoldRole
        readonly hasDetailPlaceholder?: boolean
        readonly preferredWidth?: PaneScaffoldPreferredSize
        readonly preferredHeight?: PaneScaffoldPreferredSize
        readonly animation?: IPaneAnimation
    }
}

export interface IPaneSceneOptions {
    readonly width: number
    readonly height: number
    readonly layoutDirective?: IPaneScaffoldDirective
    readonly adaptStrategies?: Readonly<Partial<Record<PaneScaffoldRole, PaneScaffoldAdaptStrategy>>>
    readonly shouldHandleSinglePaneLayout?: boolean
    readonly hasDetailPlaceholder?: boolean
    readonly backNavigationBehavior?: PaneScaffoldBackNavigationBehavior
}

export interface IPaneScaffoldScene<T extends IPaneSceneEntry = IPaneSceneEntry> {
    readonly key: string
    readonly pattern: PaneScaffoldPattern
    readonly history: readonly IPaneScaffoldDestination[]
    readonly paneEntries: Readonly<Partial<Record<PaneScaffoldRole, T>>>
    readonly detailPlaceholder: boolean
    readonly hasDetailPlaceholder: boolean
    readonly value: IPaneScaffoldValue
    readonly directive: IPaneScaffoldDirective
    readonly adaptStrategies: NonNullable<IPaneSceneOptions['adaptStrategies']>
    readonly backNavigationBehavior: PaneScaffoldBackNavigationBehavior
    readonly previousEntries: readonly T[]
    readonly previousSceneIndex?: number
    readonly previousDirective?: IPaneScaffoldDirective
    readonly previousHasDetailPlaceholder?: boolean
}

export interface IMDCPaneScaffoldAttributes {
    pattern: PaneScaffoldPattern
    backNavigationBehavior: PaneScaffoldBackNavigationBehavior
    ignoreDestinationHistory: boolean
    resizable: boolean
    disableAutoFocus: boolean
    animatePanes: boolean
    initialExpansionAnchor?: string | null
    expansionStateKey?: string | null
}

export interface IMDCPaneScaffoldEvents {
    'pane-change': CustomEvent<IPaneScaffoldChangeDetail>
    'pane-back-preview-change': CustomEvent<IPaneScaffoldBackPreview | null>
    'pane-layout-change': CustomEvent<IPaneScaffoldLayoutChangeDetail>
    'pane-scene-back-request': CustomEvent<{ readonly previousEntries: readonly IPaneSceneEntry[] }>
    'pane-dismiss-request': CustomEvent<{ readonly pane: PaneScaffoldRole }>
}

export interface IMDCPaneScaffold extends LitElement, IMDCPaneScaffoldAttributes {
    layoutDirective?: IPaneScaffoldDirective
    scaffoldValue?: IPaneScaffoldValue
    adaptStrategies: Readonly<Partial<Record<PaneScaffoldRole, PaneScaffoldAdaptStrategy>>>
    expansionAnchors: readonly IPaneExpansionAnchor[]
    expansionSpring: IPaneExpansionSpring
    expansionFling?: (release: IPaneExpansionFlingInput) => IPaneExpansionFlingResult
    consumeDragDelta?: (delta: number) => number
    paneAnimations: Readonly<Partial<Record<PaneScaffoldRole, IPaneAnimation>>>
    readonly currentExpansionAnchor: string | undefined
    isPaneExpansionUnspecified(): boolean
    dragFloatingPaneBy(delta: number): void
    dragPaneExpansionBy(delta: number): void
    settlePaneExpansion(velocity?: number): void
    snapToExpansionAnchor(id: string): void
    animateToExpansionAnchor(id: string, initialVelocity?: number): Promise<void>
    setFirstPaneWidth(width: number): void
    setFirstPaneProportion(proportion: number): void
    clearPaneExpansion(): void
    readonly canGoBack: boolean
    readonly currentDestination: IPaneScaffoldDestination
    readonly currentScaffoldValue: IPaneScaffoldValue
    isPaneInteractable(pane: PaneScaffoldRole): boolean
    peekPreviousScaffoldValue(behavior?: PaneScaffoldBackNavigationBehavior): IPaneScaffoldValue
    readonly backPreview: IPaneScaffoldBackPreview | undefined
    readonly scaffoldTransition: IPaneScaffoldTransition | undefined
    seekScaffoldValue(progress: number, target: IPaneScaffoldValue): void
    snapToScaffoldValue(target: IPaneScaffoldValue): void
    animateToScaffoldValue(target: IPaneScaffoldValue, duration?: number): Promise<void>
    saveState(): IPaneScaffoldSavedState
    restoreState(snapshot: unknown): void
    applyScene(scene: IPaneScaffoldScene): void
    seekBack(progress: number, behavior?: PaneScaffoldBackNavigationBehavior): void
    seekBackGesture(progress: number, behavior?: PaneScaffoldBackNavigationBehavior): void
    cancelBackPreview(duration?: number): Promise<void>
    commitBackPreview(duration?: number): Promise<void>
    navigateTo(pane: PaneScaffoldRole, contentKey?: string): void
    canNavigateBack(behavior?: PaneScaffoldBackNavigationBehavior): boolean
    canPreviewBack(behavior?: PaneScaffoldBackNavigationBehavior): boolean
    goBack(behavior?: PaneScaffoldBackNavigationBehavior): void
}
