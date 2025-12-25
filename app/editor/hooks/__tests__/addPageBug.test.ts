import { renderHook, act } from '@testing-library/react'
import { useDocument } from '../useDocument'
import { describe, it, expect, vi } from 'vitest'

describe('useDocument - Adding Pages', () => {
    it('generates a valid, conflict-free ID for new pages', () => {
        const { result } = renderHook(() => useDocument([]))
        
        act(() => {
            result.current.addPage()
        })
        
        const newPageId = result.current.pages[0].id
        expect(newPageId).toMatch(/^page_\d+$/)
        expect(newPageId).not.toContain(' ')
    })

    it('sets the new page as active immediately', () => {
        const { result } = renderHook(() => useDocument([]))
        
        act(() => {
            result.current.addPage()
        })
        
        expect(result.current.activePageId).toBe(result.current.pages[0].id)
    })
})
