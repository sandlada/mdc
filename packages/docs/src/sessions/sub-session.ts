/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { select, subscribe, update } from '@sandlada/document-context'
import type { ISession } from '@sandlada/document-context'

/**
 * A scoped view over one slice of a root session's aggregate state.
 *
 * A physical element can host exactly one session (`mount()` returns the first
 * one), so sub-sessions are not independent `ISession`s. The root session owns
 * the aggregate state and each sub-session is a typed accessor bound to one
 * slice, exposed through `inject('<name>:session')`.
 */
export interface ISubSession<S> {
    /** Current immutable snapshot of the slice. */
    readonly value: S
    /** Snapshot projection scoped to the slice. */
    select<R>(selector: (state: S) => R): R
    /** Scoped transition. Merges a partial slice (or the updater's result). */
    update(updater: Partial<S> | ((state: S) => Partial<S>)): boolean
    /** Reactive subscription; emits the current slice immediately. */
    subscribe(listener: (state: S) => void): () => void
}

/**
 * Slice accessors describing how a sub-session reads and writes the aggregate
 * state owned by the root session.
 */
export interface SliceBinding<M extends Record<PropertyKey, any>, S> {
    read(state: M): S
    write(state: M, next: Partial<S>): Partial<M>
}

/**
 * Build a sub-session handle for one slice of `session`'s aggregate state.
 *
 * All reads/writes go through the parent session's own `select`/`update`/
 * `subscribe`, so reactivity, disposal and freeze semantics stay identical to a
 * plain session.
 */
export function createSubSession<M extends Record<PropertyKey, any>, S>(
    session: ISession<M, any>,
    binding: SliceBinding<M, S>,
): ISubSession<S> {
    const snapshot = () => binding.read(select<M, M>((state) => state)(session))

    return {
        get value() {
            return snapshot()
        },
        select: (selector) => selector(snapshot()),
        update: (updater) =>
            update<M>((state) => binding.write(state, typeof updater === 'function' ? updater(binding.read(state)) : updater))(session),
        subscribe: (listener) => subscribe<M>((state) => listener(binding.read(state)))(session),
    }
}
