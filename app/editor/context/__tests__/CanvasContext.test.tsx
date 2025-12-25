import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { CanvasProvider, useCanvas } from '../CanvasContext'
import { Canvas } from 'fabric'
import { describe, it, expect, vi } from 'vitest'

function TestComponent() {
    const { registerCanvas, activeCanvasId, activeCanvas } = useCanvas()
    return (
        <div>
            <div data-testid="active-id">{activeCanvasId}</div>
            <button onClick={() => registerCanvas('test-page', new Canvas())}>
                Register
            </button>
        </div>
    )
}

describe('CanvasProvider', () => {
    it('registers a canvas and sets it as active if it is the first one', () => {
        render(
            <CanvasProvider>
                <TestComponent />
            </CanvasProvider>
        )

        expect(screen.getByTestId('active-id')).toHaveTextContent('')

        act(() => {
            screen.getByText('Register').click()
        })

        expect(screen.getByTestId('active-id')).toHaveTextContent('test-page')
    })
})
