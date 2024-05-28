import { useRef, useEffect, DependencyList } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

export interface Callback {
    (ele: Element): void;
}

export default function useResizeObserver<T extends Element>(
    callback: Callback,
    deps: DependencyList
) {
    const eleRef = useRef<T>(null);
    useEffect(() => {
        const { current } = eleRef;
        if (!current) {
            return;
        }
        const observer = new ResizeObserver(function() {
            callback(current);
        });

        observer.observe(current);

        return () => {
            observer.disconnect();
        };
    }, deps);

    return { eleRef };
}
