import { describe, it, expect } from 'vitest'
import { styles } from './elevation.style'

describe('elevation.style.ts export test', () => {
    it('generates valid CSSResult for elevation', () => {
        expect(styles[0].cssText).toContain('--mdc-elevation')
        console.log('--- COMPILED ELEVATION STYLES ---')
        console.log(styles[1].cssText)
        console.log('---------------------------------')
    })
})
