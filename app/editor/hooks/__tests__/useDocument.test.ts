import { renderHook, act } from '@testing-library/react'
import { useDocument } from '../useDocument'
import { describe, it, expect } from 'vitest'

describe('useDocument', () => {
    it('initializes with provided pages', () => {
        const initialPages = [{ id: 'page-1', backgroundColor: '#000', layout: 'classic' }]
        const { result } = renderHook(() => useDocument(initialPages))
        
        expect(result.current.pages).toHaveLength(1)
        expect(result.current.activePageId).toBe('page-1')
    })

    it('adds a page correctly', () => {
        const { result } = renderHook(() => useDocument([]))
        
        act(() => {
            result.current.addPage()
        })
        
        expect(result.current.pages).toHaveLength(1)
        expect(result.current.pages[0].id).toMatch(/^page_/)
        expect(result.current.activePageId).toBe(result.current.pages[0].id)
    })

    it('deletes a page and updates activePageId if necessary', () => {
        const initialPages = [
            { id: 'p1', backgroundColor: '#000', layout: 'classic' },
            { id: 'p2', backgroundColor: '#000', layout: 'classic' }
        ]
        const { result } = renderHook(() => useDocument(initialPages))
        
        act(() => {
            result.current.setActivePageId('p2')
        })
        expect(result.current.activePageId).toBe('p2')

        act(() => {
            result.current.deletePage('p2')
        })
        
        expect(result.current.pages).toHaveLength(1)
        expect(result.current.pages[0].id).toBe('p1')
        expect(result.current.activePageId).toBe('p1')
    })
})
