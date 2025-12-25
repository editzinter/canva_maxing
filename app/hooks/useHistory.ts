import { useState, useCallback } from 'react';

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

export function useHistory<T>(initialState: T) {
    const [state, setState] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: []
    });

    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    const undo = useCallback(() => {
        setState(currentState => {
            if (currentState.past.length === 0) return currentState;

            const previous = currentState.past[currentState.past.length - 1];
            const newPast = currentState.past.slice(0, currentState.past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [currentState.present, ...currentState.future]
            };
        });
    }, []);

    const redo = useCallback(() => {
        setState(currentState => {
            if (currentState.future.length === 0) return currentState;

            const next = currentState.future[0];
            const newFuture = currentState.future.slice(1);

            return {
                past: [...currentState.past, currentState.present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    const set = useCallback((newPresent: T | ((current: T) => T)) => {
        setState(currentState => {
            const resolvedPresent = typeof newPresent === 'function'
                ? (newPresent as (c: T) => T)(currentState.present)
                : newPresent;

            // Optional: Deep equality check to prevent identical states? 
            // For now, assume if 'set' is called, it's a change worth recording.

            return {
                past: [...currentState.past, currentState.present],
                present: resolvedPresent,
                future: [] // Clear future on new action
            };
        });
    }, []);

    // A 'replace' method if we want to update state WITHOUT adding to history (e.g. while dragging?)
    // This is crucial for smooth dragging if we update x/y continuously.
    // If we only update on onDragEnd, then 'set' is fine.

    return {
        state: state.present,
        set,
        undo,
        redo,
        canUndo,
        canRedo,
        historyCheck: { past: state.past.length, future: state.future.length }
    };
}
