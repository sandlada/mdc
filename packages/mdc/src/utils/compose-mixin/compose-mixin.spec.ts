/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import type { MixinBase } from '../behaviors/mixin'
import { composeMixin } from './compose-mixin'

describe('composeMixin', () => {
    it('composes multiple mixins in order onto a base class', () => {
        class Base {
            baseProp = 'base'
        }

        const mixinA = <T extends MixinBase>(base: T) => {
            abstract class MixedA extends base {
                propA = 'A'
            }
            return MixedA
        }

        const mixinB = <T extends MixinBase>(base: T) => {
            abstract class MixedB extends base {
                propB = 'B'
            }
            return MixedB
        }

        const Composed = composeMixin(mixinA, mixinB)(Base)
        const instance = new Composed() as Base & { propA: string; propB: string }

        expect(instance.baseProp).toBe('base')
        expect(instance.propA).toBe('A')
        expect(instance.propB).toBe('B')
        expect(instance instanceof Base).toBe(true)
    })
})
