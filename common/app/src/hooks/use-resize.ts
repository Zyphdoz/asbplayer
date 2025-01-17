import { useCallback, useEffect, useState } from 'react';

interface Props {
    initialWidth: number;
    minWidth: number;
    maxWidth: number;
    onResizeStart?: () => void;
    onResizeEnd?: () => void;
}

// https://stackoverflow.com/questions/49469834/recommended-way-to-have-drawer-resizable
export const useResize = ({ initialWidth, minWidth, maxWidth, onResizeStart, onResizeEnd }: Props) => {
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(initialWidth);
    const [lastMouseDownClientX, setLastMouseDownClientX] = useState<number>(0);

    const enableResize = useCallback(() => {
        setIsResizing(true);
        onResizeStart?.();
    }, [setIsResizing, onResizeStart]);

    const disableResize = useCallback(() => {
        setIsResizing(false);
        onResizeEnd?.();
    }, [setIsResizing, onResizeEnd]);

    const recordLastMouseDownPosition = useCallback((e: MouseEvent) => {
        setLastMouseDownClientX(e.clientX);
    }, []);

    const resize = useCallback(
        (e: MouseEvent) => {
            if (isResizing) {
                const delta = lastMouseDownClientX - e.clientX;
                const newWidth = width + delta;

                setLastMouseDownClientX(e.clientX);

                if (newWidth >= minWidth && newWidth <= maxWidth) {
                    setWidth(newWidth);
                }
            }
        },
        [minWidth, maxWidth, lastMouseDownClientX, width, isResizing]
    );

    useEffect(() => {
        if (maxWidth !== 0 && width > maxWidth) {
            setWidth(maxWidth);
        }
    }, [maxWidth, width]);

    useEffect(() => {
        document.addEventListener('mouseleave', disableResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', disableResize);
        document.addEventListener('mousedown', recordLastMouseDownPosition);

        return () => {
            document.removeEventListener('mouseleave', disableResize);
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', disableResize);
            document.removeEventListener('mousedown', recordLastMouseDownPosition);
        };
    }, [disableResize, resize, recordLastMouseDownPosition]);

    return { width, enableResize, isResizing };
};
