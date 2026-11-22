# Pane Scaffold

Use `<mdc-pane-scaffold>` on its own or in the content slot of `mdc-scaffold`. It measures its own content box. Below 840px it shows one pane, from 840px it shows up to two, and from 1200px it shows up to three. Set a block size on the scaffold if you want each pane to scroll independently.

```ts
import '@sandlada/mdc/components/pane-scaffold/index'
```

```html
<mdc-pane-scaffold id="inbox">
    <nav slot="list" aria-label="Inbox">…</nav>
    <article slot="detail">…</article>
    <aside slot="extra">…</aside>
</mdc-pane-scaffold>
```

| Pattern | Slots in inline order |
| --- | --- |
| `list-detail` (default) | `list`, `detail`, `extra` |
| `supporting-pane` | `main`, `supporting`, `extra` |

Place pane elements directly inside the scaffold. Only populated panes participate in layout. Slotted elements stay mounted across resizes, so their local state stays with them.

| API | Behavior |
| --- | --- |
| `navigateTo(pane, contentKey?)` | Opens a populated pane for the current pattern. Accepts an optional string identifying the content. A request matching the current destination leaves history unchanged. |
| `back-navigation-behavior` | Selects how to find a previous destination. The default is `pop-until-scaffold-value-change`. |
| `ignore-destination-history` | Chooses the expanded panes using only the current destination and default pane priorities. |
| `resizable` | Shows draggable, keyboard-operable handles in the 24px between panes. |
| `disable-auto-focus` | Leaves focus management to the application. |
| `animate-panes` | Animates entering and exiting panes, changes to retained pane bounds, and floating handle size cycles. Respects the system's reduced-motion preference. |
| `layoutDirective` | JavaScript property for overriding horizontal partitions, spacing, preferred widths, and automatic focus. |
| `goBack(behavior?)` | Returns to the matching previous destination. Enable your back control when `canGoBack` or `canNavigateBack(behavior)` is true. Calling without a matching entry throws. |
| `canPreviewBack(behavior?)` | Checks whether the back target can be previewed inside the scaffold. A scene may allow `goBack()` while handing the preview for an unrelated scene to the application router. |
| `currentDestination` | Snapshot containing the current `pane` and `contentKey`. |
| `currentScaffoldValue` | Snapshot of the current destination and its adapted pane roles. |
| `peekPreviousScaffoldValue(behavior?)` | Computes the adapted layout and destination for a back action without changing history, content, or focus. Returns the current value when no previous destination matches. |
| `seekBack(progress, behavior?)` | Previews back navigation at a fraction from 0 to 1. Set 0 to clear immediately and call `goBack()` to commit using the previewed strategy. |
| `seekBackGesture(progress, behavior?)` | Maps raw gesture progress from 0 to 1 through the AndroidX predictive back curve. With one, two, or three expanded panes, the preview reaches up to 10%, 15%, or 20% of the layout transition, respectively. |
| `cancelBackPreview(duration?)` | Animates an active back preview to zero without changing the destination. The default is 250ms for the full progress range, scaled to the current fraction. Reduced motion clears it immediately. The returned promise settles after completion or interruption by another navigation, layout change, or seek. |
| `commitBackPreview(duration?)` | Continues an active back preview from its current progress to the destination. The default is 250ms for the full progress range, scaled to the remaining fraction. With reduced motion, the return commits immediately. In scene mode, completion dispatches the usual `pane-scene-back-request` for the application router. |
| `backPreview` | Snapshot containing `progress` and the `target` scaffold value, or `undefined` when a preview is inactive. |
| `saveState()` / `restoreState(snapshot)` | Captures or restores JSON-compatible navigation and sizing state. |
| `pane-change` | Bubbles across shadow boundaries with `{ destination, reason }`. Reasons are `navigate`, `back`, `pattern-change`, `pane-removed`, `restore`, and `scene`. Listen for this event to update content for the destination key. |
| `pane-back-preview-change` | Bubbles across shadow boundaries after rendering with the `backPreview` snapshot as its detail. The detail is `null` when an active preview ends, including on commit, cancellation, or resize. |
| `pane-layout-change` | Bubbles across shadow boundaries after rendering with `{ visiblePanes, interactablePanes, reflowedPane, levitatedPane }`. It also fires when a scrim changes which visible panes are interactive. A reflowed pane follows its anchor and a floating pane comes last. |
| `isPaneInteractable(pane)` | Checks if the scaffold currently allows interaction in the pane. Hidden, collapsed, preview-only, and scrim-blocked panes return `false`. |

The scaffold keeps pane history per instance. The application controls content, URL, and browser history. Switching patterns resets pane history. Removing a pane prunes its destinations from history.

The layout fills available space with the current pane, followed by the most recently visited panes. The default order fills remaining space. In a two-pane inbox, opening attachments directly from the list shows list and extra. Opening attachments after visiting detail shows detail and extra.

Use `pop-latest` for the immediately preceding entry, `pop-until-current-destination-change` to return to another active pane, or `pop-until-content-change` to stop at a different content key or visible pane combination. For an inbox that should return from message B to message A even when the layout does not change, set `back-navigation-behavior="pop-until-content-change"`.

Applications can feed raw gesture progress into `seekBackGesture()` or drive the layout transition directly with `seekBack()`. Preview-only panes stay inert and the current destination and focus remain active until commit. A resize or layout change cancels the preview. With reduced motion, the preview target is still queryable and the visible layout changes on commit. For a content-only back destination, listen for `pane-back-preview-change` and use the target's `destination.contentKey` to show a separate preview without replacing the active content. Clear the preview when the event detail is `null`. The inbox demo shows this with two messages in the same detail pane.

### Pane transitions

Set `animate-panes` to use pane transitions. The `paneAnimations` property accepts per-role overrides.

```ts
inbox.paneAnimations = {
    detail: {
        enter: { keyframes: [{ opacity: 0, translate: '16px' }, { opacity: 1, translate: '0px' }], duration: 220 },
        exit: { keyframes: [{ opacity: 1 }, { opacity: 0 }], duration: 140 },
        bounds: { duration: 280, easing: 'ease-in-out' },
    },
}
```

Use `enter` and `exit` for Web Animations keyframes and `bounds` for the timing of position and size changes while the pane remains visible. Omit a phase to inherit its default or set it to `false` to disable it. Reduced motion skips these animations. Predictive back uses its own progress-driven preview.

By default, horizontal panes slide through the open side of the layout. An incoming pane waits briefly if an outgoing pane is using the same side. A pane between two retained panes expands or contracts in place. The motion follows the inline direction, including in RTL.

### Application-controlled layout

Assign `scaffoldValue` to render an explicit arrangement and let the application own navigation.

```ts
inbox.scaffoldValue = {
    destination: { pane: 'detail', contentKey: 'message-42' },
    expandedPanes: ['list', 'detail'],
    levitatedPane: 'extra',
}
```

The value selects the pane roles, and `layoutDirective` still controls sizing, order, and excluded regions. Use `reflowedPane` to place a pane below an expanded pane, or `levitatedPane` to place it above the layout. The levitated pane uses its configured `adaptStrategies` options. Missing slots are omitted from the layout.

Update the value to navigate. Destination changes emit `pane-change` with reason `controlled`. Escape and scrim activation on a levitated pane emit `pane-dismiss-request` with `{ pane }` for the application to handle. Assign `undefined` to resume the scaffold's own layout calculation. Keep the controlled value with the application's state when saving a snapshot.

After the initial value has rendered, call `seekScaffoldValue(progress, target)` to preview another arrangement. Progress runs from 0 to 1 and is readable with the target through `scaffoldTransition`. A progress of 0 cancels the preview. During a seek, the current destination retains focus and preview-only panes stay inert. Reduced motion keeps the transition state available while skipping the visual preview.

Call `snapToScaffoldValue(target)` to apply the target immediately. Call `animateToScaffoldValue(target, duration)` to continue from the current progress for the same target object, or animate from the current layout. It uses a linear timeline of 250ms by default and commits the target after the animation. The returned promise settles after commit or interruption. Container resizing cancels an in-progress transition.

### Application-owned navigation scenes

Use `resolvePaneScaffoldScene` with a router's ordered stack when the application owns navigation. Give each pane entry a string route `key` and `pane` metadata with a `pattern`, `sceneKey`, and `role`. The resolver groups compatible entries for the active scene, selects the newest entry for each pane, and computes which stack entries to retain on back. Entry-level `preferredWidth` and `preferredHeight` override sizing for that pane. Set `pane.hasDetailPlaceholder` on a list route to reserve or omit the detail pane when no detail entry exists. The resolver option `hasDetailPlaceholder` supplies the default for list routes without an override. Use `scene.detailPlaceholder` to render placeholder content in the detail slot.

```ts
import { resolvePaneScaffoldScene } from '@sandlada/mdc/components/pane-scaffold/index'

function renderRoutes(entries, width, height) {
    const scene = resolvePaneScaffoldScene({ width, height, hasDetailPlaceholder: true })(entries)
    if (!scene) return renderSingleRoute(entries.at(-1))
    renderPaneSlots(scene.paneEntries, scene.detailPlaceholder)
    scaffold.applyScene(scene)
}

scaffold.addEventListener('pane-scene-back-request', event => {
    router.replaceStack(event.detail.previousEntries)
})
```

Re-run the resolver when the route stack or container size changes. It yields to the application's single-route renderer by default. Set `shouldHandleSinglePaneLayout: true` to keep the scaffold in single-pane mode. In scene mode, push routes through the application router. `goBack()` requests a stack change and the next `applyScene()` updates the panes. A return to an unrelated scene is handled by the router and has no in-scaffold preview.

By default, a list-detail scene returns to the previous pane combination. A supporting-pane scene returns to the previous active pane even when the visible pane combination stays the same. Pass `backNavigationBehavior` to override the default in either scene pattern.

The inbox demo uses a route stack and a detail placeholder. Opening an attachment adds the extra pane to the scene. Returning removes its route, so the attachment pane no longer occupies a column. Resizing can reapply the same scene destination while preserving focus in a still-visible pane.

An in-scene return preview uses the target routes' preferred pane dimensions. The active route and its dimensions remain in effect until the router applies the target scene.

Set `entry.pane.animation` to override individual animation phases for a route. An entering or retained pane uses the incoming entry's options. A pane leaving the layout uses the outgoing entry's exit options.

### Saving and restoring

Save the result of `saveState()` when replacing the scaffold or preserving the current session. Configure slots, anchors, and adaptation strategies on the replacement. Then pass the saved object or its parsed JSON to `restoreState()`. The snapshot stores the pattern, destination history, divider proportions and anchors, and floating pane sizes. It describes UI state, so use the restored content key to load the application's data.

```ts
const saved = JSON.stringify(inbox.saveState())
replacement.restoreState(JSON.parse(saved))
```

Restoration validates the snapshot before applying it. The first update removes destinations for missing slots and emits one `pane-change` event with reason `restore`. A pending gesture is transient.

With `resizable` enabled, drag a separator or focus it and use the left and right arrows to adjust adjacent panes in 16px steps. Home and End reach the two limits. The divider uses a 240px per-pane minimum when space permits. Resizing the scaffold restores the last proportions for each pane combination during the instance’s lifetime. Use `::part(pane)`, `::part(pane-detail)` (or the part for the corresponding role), and `::part(splitter)` to style the scaffold's internal surfaces.

Use `<span slot="list-divider">⋮</span>` to replace the default grip on the divider after the list. Divider slots use the preceding pane's role, such as `detail-divider` or `main-divider`. A resizable floating pane accepts a slot such as `extra-floating-handle`. Slot content supplies the visual only. The component's separator provides focus, the accessible name, keyboard behavior, and pointer capture. When the slot is empty, the default grip is available as `::part(resize-grip)`.

### Layout directive

Assign a new `layoutDirective` object to override container-derived defaults. Lengths are in CSS pixels.

```ts
inbox.layoutDirective = {
    maxHorizontalPartitions: 2,
    horizontalPartitionSpacerSize: 32,
    preferredWidths: { list: 280 },
}
```

Set `paneOrder` to override the logical inline order of the active pattern, for example `['detail', 'list', 'extra']`. Include each role exactly once, even if its slot is empty. The order controls positioning, keyboard traversal, and which pane a divider leads. Navigation priority stays tied to the roles and their history. Divider sizing is remembered for each ordered pane combination.

Panes prefer 360px by default, or 412px when the container reaches 1200px. Set `defaultPanePreferredWidth` for all panes or `preferredWidths` for specific roles. The latter accepts pixel values or objects such as `{ proportion: 0.35 }`. A proportion is measured against the whole scaffold before it allocates spacers or exclusions. The highest-priority visible pane receives leftover space. If the preferred widths exceed the available space, the scaffold scales them down. Set `shouldAutoFocusCurrentDestination: false` to manage focus in your application.

`paneMargins` sets minimum distances from the scaffold's logical edges for each pane. Use `paneInsets` to supply additional distances, for example safe-area values provided by the application. The larger value wins at each edge. The scaffold applies the distances to the final pane bounds while its partition spacers still control the gaps between panes.

```ts
inbox.layoutDirective = {
    paneMargins: { list: { inlineStart: 16, blockStart: 12 } },
    paneInsets: { list: { inlineStart: 32 } },
}
```

### Excluded bounds

Use `layoutDirective.excludedBounds` for vertical hinges or other vertical dividers. Supply rectangles in physical CSS pixels relative to the scaffold content box, including `left`, `top`, `right`, and `bottom`. An intersecting rectangle divides the inline layout at its horizontal edges. In RTL, use `dir="rtl"` on the scaffold or an ancestor to reverse pane order while keeping the exclusion at its physical position.

Use `calculatePaneScaffoldDirective(windowInfo, options)` to derive the Material partition limits from width, height, and fold posture. The `twoPanesOnMediumWidth` option enables the denser two-pane layout at 600–839px. `verticalHingePolicy` and `horizontalHingePolicy` accept `avoid-separating` (the default), `avoid-occluding`, `always-avoid`, and `never-avoid`. The tabletop flag enables two vertical partitions for reflow.

The calculated directive sets `minimumPaneWidth: 0` to match Material's proportional sizing when preferred widths exceed the available space. This also applies within a partition next to an exclusion. With a hand-written directive, the default minimum is 240px for ordinary measurement and divider adjustment. Set `minimumPaneWidth` to override either default.

In Chrome, pass `window.viewport.segments` and the scaffold's viewport-relative content bounds to `panePostureFromViewportSegments`. The adapter treats a zero-width seam as separating and a nonzero gap as occluding. Stacked segments identify tabletop geometry. A single segment yields no fold. Recompute the directive when the viewport segments or scaffold bounds change.

The directive uses `horizontalExcludedBounds` for horizontal hinges. Reflowed panes use two available bands in top-to-bottom order, using the two tallest bands when more are present. With one available band, reflow stays inside it. Side-by-side and floating panes use the tallest available band.

```js
const bounds = inbox.getBoundingClientRect() // The scaffold has no border or padding.
const posture = panePostureFromViewportSegments(bounds)(window.viewport.segments)
inbox.layoutDirective = calculatePaneScaffoldDirective({ width: bounds.width, height: bounds.height, posture })
```

The scaffold distributes panes among the usable sections and places any extra panes in the widest section. Excluded sections use fixed boundaries. Clearing the exclusions restores the divider and any previous pane expansion.

When three panes share two physical regions, the larger region receives two panes. Equal regions place the pair on the physical right. When there are more regions than panes, allocation starts at the physical left. RTL reverses the pane order within the same physical allocation.

### Vertical reflow

An eligible single-column container allows a second row at 900px of block size. The supporting-pane pattern uses that row to reflow the supporting pane below the main pane by default. Use `adaptStrategies` to configure another reflow relationship or set `{ type: 'hide' }` to disable it for a role. Set `maxVerticalPartitions: 2` to allow a second row in shorter containers.

```ts
editor.adaptStrategies = { supporting: { type: 'reflow', reflowUnder: 'main' } }
editor.layoutDirective = {
    maxHorizontalPartitions: 1,
    maxVerticalPartitions: 2,
    preferredHeights: { supporting: 260 },
}
```

Set a block size on the scaffold. The reflowed pane occupies up to half the available height, below the anchor and a 24px spacer. Use `verticalPartitionSpacerSize` and `defaultPanePreferredHeight` to override the defaults. `preferredHeights` also accepts proportions, measured against the entire scaffold height. Both panes are independently scrollable.

### Floating panes

A `levitate` strategy displays its pane above the layout when it is the current destination. It consumes no partition. Set a block size on the scaffold and use the directive's preferred width and height to size the floating pane. Alignment uses logical edges and defaults to center.

Set `onlyIfSinglePane: true` to float the current destination only when the directive specifies one horizontal partition. A directive with multiple horizontal partitions keeps ordinary pane allocation, even if the container is too narrow to fit its configured columns and spacers. The current content key stays the same.

```ts
inbox.adaptStrategies = {
    extra: { type: 'levitate', alignment: 'block-end-inline-end', scrim: true, label: 'Attachments' },
}
```

With `scrim: true`, the other panes and dividers become inert. The floating pane uses dialog semantics and the supplied label. With a valid back destination, clicking the scrim or pressing Escape returns to it. Style the floating surface and scrim with `::part(levitated-pane)` and `::part(pane-scrim)`.

To replace the default scrim for a particular pane, provide a visual in its `<role>-scrim` slot, for example `<div slot="extra-scrim" class="attachment-shade"></div>`. The slot stretches its visual across the scaffold. The visual is inert and excluded from the accessibility tree. The scaffold still owns click dismissal and fades the scrim during back previews. Removing the visual restores the default scrim immediately.

Add `resize: { dockedEdge: 'inline-end', minSize: 260, maxSize: 640 }` to make the floating pane resizable. Docking along an inline edge changes width. Docking along a block edge changes height. The handle appears opposite the docked edge and the scaffold bounds limit its travel. Click or press Enter or Space to cycle between the preferred or last dragged size, the maximum, and the minimum. Use the arrow keys to resize incrementally, or Home and End to select the limits. The handle supports a localized `resize.label` and the `levitated-resize-handle` part.

Applications can call `dragFloatingPaneBy(delta)` for a custom input device or gesture. Positive CSS pixel deltas move the handle right or down. The docked edge and writing direction determine whether that increases or decreases the pane size. This uses the same resize bounds and remembered size as the built-in handle. A programmatic drag takes over from any active pointer drag. Calls have no effect unless a resizable floating pane has an adjustable range.

Dragging to a limit enters that size state. At the maximum, the next click or Enter switches to the minimum. At the minimum, the next activation restores the last dragged size, which may itself be a limit.

With `animate-panes`, clicks and keyboard activation animate between these sizes with a spring. The docked edge stays fixed. Starting a new drag takes over from the visible size, and reduced motion applies the target size immediately.

### Pane expansion

In two-pane layouts, configure snap points with `expansionAnchors`. Offsets are measured in CSS pixels from the logical start or end of the pane area. Proportions of 0 and 1 collapse the first and second pane respectively. The remaining pane fills the container and the divider stays at the edge. Interior positions respect the minimum pane width.

```ts
inbox.expansionAnchors = [
    { id: 'list', type: 'offset-from-start', value: 300 },
    { id: 'equal', type: 'proportion', value: 0.5 },
    { id: 'detail', type: 'offset-from-end', value: 300 },
]
inbox.snapToExpansionAnchor('equal')
```

Set `initialExpansionAnchor` to a configured anchor ID to use that split on the first adjustable two-pane layout. A saved split takes precedence. `clearPaneExpansion()` resets the active split to this initial configuration.

Dragging or settling at an anchor takes priority over a width or proportion set by the application. The requested position remains in `saveState()`. If the active anchor is removed, the layout falls back to the configured initial anchor, the requested position, or the preferred widths, in that order. `isPaneExpansionUnspecified()` checks whether the active split has any applied sizing state, including manual drag and anchor adjustments.

A two-pane split follows the pair of pane roles across changes to `paneOrder`. A configured first-pane width or anchor still applies from logical inline start. When restoring an older snapshot with separate splits for both orders of the same pair, the default-order entry takes precedence.

By default each pattern and visible pane combination remembers its own split. Set `expansionStateKey` (or the `expansion-state-key` attribute) to share a split across two-pane combinations. Changing the key loads a separate split and switching back recovers the previous one. Configure the active key on the replacement scaffold before restoring a JSON snapshot. The snapshot carries the widths and anchors for all used keys.

```ts
inbox.initialExpansionAnchor = 'equal'
inbox.expansionStateKey = 'mail:reading'
```

In a two-pane layout with anchors, a fast release continues in the drag direction and slows along AndroidX's fling curve, using CSS pixels in place of dp. The divider then moves to an anchor with a spring. Release slowly or pause before releasing to settle near the release point. Reduced motion keeps the same anchor selection and applies the width immediately. Click, press Enter, or press Space on the focused divider to cycle through the anchors. Home and End use the corresponding collapse anchor when configured. Use the arrow keys to reopen a collapsed pane. `currentExpansionAnchor` exposes the selected ID. Call `setFirstPaneWidth(px)` or `setFirstPaneProportion(ratio)` to position the divider directly.

Call either size setter before measurement or while the scaffold is narrow to prepare a split. With `expansionStateKey`, it updates that shared split. Otherwise the request applies to the active pair, or waits for the pattern's next adjustable two-pane layout when there is no pair yet. Pending requests survive `saveState()` and can be cleared with `clearPaneExpansion()` before the layout expands.

Set `expansionSpring` to customize the anchor spring. It defaults to a damping ratio of `0.8` and stiffness of `380`. Call `animateToExpansionAnchor(id, initialVelocity)` to await a move. The promise resolves when the animation finishes or is interrupted by another interaction. Positive velocity moves toward inline end in both LTR and RTL, in CSS pixels per second.

Custom drag sources can call `dragPaneExpansionBy(delta)` to resize the active two-pane split. The delta is measured in CSS pixels toward inline end, and the scaffold applies the same `consumeDragDelta` hook, minimum widths, and saved proportions as the native pointer handle. At release, call `settlePaneExpansion(velocity)` to run the same fling and anchor selection. The default velocity is zero. Both methods require an adjustable two-pane layout.

```ts
inbox.expansionSpring = { dampingRatio: 1, stiffness: 300 }
inbox.expansionFling = ({ position }) => ({ position, velocity: 0 })
await inbox.animateToExpansionAnchor('equal', 250)
```

The optional `expansionFling` callback replaces the default decay. The example above disables momentum for pointer releases while keeping spring animation. In the callback, `position` is the release offset and `startPosition` is the rendered first-pane width. `maxWidth` is the available width of both panes, and `minPosition` and `maxPosition` are the limits of the decay.

Return a `trajectory` to animate the decay before the spring. Its `positionAt(ms)` supplies the first-pane width at an elapsed time, in CSS pixels. The scaffold samples the curve between the rendered start and the returned final `position`, clamps intermediate widths to the limits, and uses the returned `velocity` when selecting the anchor and starting the spring.

```ts
inbox.expansionFling = ({ startPosition, velocity, minPosition, maxPosition }) => {
    const duration = 240
    const distance = velocity * duration / 2000
    const position = Math.min(maxPosition, Math.max(minPosition, startPosition + distance))
    return {
        position,
        velocity: 0,
        trajectory: {
            duration,
            positionAt: ms => startPosition + (position - startPosition) * (1 - (1 - ms / duration) ** 2),
        },
    }
}
```

Use `consumeDragDelta` to share pointer and inertial movement with surrounding UI. It receives each signed movement in CSS pixels before the pane changes size. Return the remaining movement for the pane. Positive deltas enlarge the pane before the divider in both LTR and RTL, and the remaining pointer deltas determine its release velocity. Returning zero for the entire drag keeps the pane width and the current anchor.

```ts
inbox.consumeDragDelta = delta => {
    const previousWidth = railWidth
    railWidth = Math.min(112, Math.max(80, previousWidth + delta))
    railContainer.style.inlineSize = `${railWidth}px`
    return delta - (railWidth - previousWidth)
}
```

During an animated release, the default decay switches to the spring when the pane can no longer use the full increment. A custom `expansionFling` trajectory can keep distributing its increments for its specified duration. The spring selects an anchor from the width actually reached and the remaining velocity. Reduced motion applies the target directly, without calling the consumer on animation frames. Keyboard resizing and programmatic anchor moves use their own inputs.
