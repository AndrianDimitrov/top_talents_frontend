import { useState, useCallback, useRef } from 'react';

interface DragState {
  isDragging: boolean;
  isOver: boolean;
}

interface DragAndDropOptions {
  onDragStart?: (event: DragEvent) => void;
  onDragEnd?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDrop?: (files: File[]) => void;
  accept?: string[];
  multiple?: boolean;
}

export function useDragAndDrop(options: DragAndDropOptions = {}) {
  const {
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    accept = [],
    multiple = false,
  } = options;

  const [state, setState] = useState<DragState>({
    isDragging: false,
    isOver: false,
  });

  const dragCounter = useRef(0);

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      setState(prev => ({ ...prev, isDragging: true }));
      onDragStart?.(event);
    },
    [onDragStart]
  );

  const handleDragEnd = useCallback(
    (event: DragEvent) => {
      setState({ isDragging: false, isOver: false });
      dragCounter.current = 0;
      onDragEnd?.(event);
    },
    [onDragEnd]
  );

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setState(prev => ({ ...prev, isOver: true }));
      onDragOver?.(event);
    },
    [onDragOver]
  );

  const handleDragLeave = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setState(prev => ({ ...prev, isOver: false }));
      }
      onDragLeave?.(event);
    },
    [onDragLeave]
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setState({ isDragging: false, isOver: false });
      dragCounter.current = 0;

      const items = event.dataTransfer?.items;
      if (items) {
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
              if (accept.length === 0 || accept.includes(file.type)) {
                files.push(file);
              }
            }
          }
        }

        if (files.length > 0 && (!multiple || files.length === 1)) {
          onDrop?.(multiple ? files : [files[0]]);
        }
      }
    },
    [accept, multiple, onDrop]
  );

  const dragProps = {
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  return {
    ...state,
    dragProps,
  };
} 