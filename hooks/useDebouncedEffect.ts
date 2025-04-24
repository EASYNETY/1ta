// hooks/useDebouncedEffect.ts
import { useEffect, DependencyList } from 'react';

export function useDebouncedEffect(
    effect: () => void,
    deps: DependencyList,
    delay: number
) {
    useEffect(() => {
        const handler = setTimeout(() => effect(), delay);

        // Cleanup function to clear the timeout if deps change or component unmounts
        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...(deps || []), delay]); // Include delay in deps array to reset timeout if delay changes
}