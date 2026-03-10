/**
 * useDragAndDrop — Custom drag-and-drop hook for reordering items.
 *
 * Supports mouse and touch interactions. Framework-agnostic sorting logic
 * with visual feedback via placeholder rendering and transform animations.
 *
 * Features:
 * - Touch & mouse drag support
 * - Auto-scroll when dragging near container edges
 * - Accessible keyboard reordering (Arrow keys + Space/Enter)
 * - Visual drag preview following cursor
 * - Placeholder gap at drop position
 * - Configurable axis (horizontal or vertical)
 * - Cancel drag with Escape key
 * - Haptic feedback on mobile (if supported)
 */

import { useCallback, useRef, useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DragItem {
  id: string;
  index: number;
}

export interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  draggedIndex: number;
  overIndex: number;
  dragX: number;
  dragY: number;
  initialX: number;
  initialY: number;
  offsetX: number;
  offsetY: number;
}

export interface DragAndDropOptions {
  /** Called when an item is dropped at a new position */
  onReorder: (fromIndex: number, toIndex: number) => void;
  /** Called when drag starts */
  onDragStart?: (item: DragItem) => void;
  /** Called when drag ends (regardless of drop) */
  onDragEnd?: (item: DragItem) => void;
  /** Called when drag is cancelled */
  onDragCancel?: () => void;
  /** Direction of the sortable list */
  axis?: 'horizontal' | 'vertical';
  /** Whether drag-and-drop is enabled */
  enabled?: boolean;
  /** Minimum distance in px before drag initiates */
  dragThreshold?: number;
  /** Whether to trigger haptic feedback */
  hapticFeedback?: boolean;
  /** Duration of transition animation in ms */
  animationDuration?: number;
  /** Lock dragging to a specific axis */
  lockAxis?: boolean;
  /** Auto-scroll speed when near edges */
  autoScrollSpeed?: number;
  /** Distance from edge to trigger auto-scroll */
  autoScrollThreshold?: number;
}

export interface UseDragAndDropReturn {
  /** Current drag state */
  dragState: DragState;
  /** Is any item currently being dragged? */
  isDragging: boolean;
  /** Props to spread on the container element */
  containerProps: {
    ref: React.RefCallback<HTMLElement>;
    role: string;
    'aria-label': string;
  };
  /** Get props for each draggable item */
  getItemProps: (id: string, index: number) => DragItemProps;
  /** Keyboard handler for accessible reordering */
  getKeyboardProps: (id: string, index: number) => KeyboardItemProps;
  /** The index where the dragged item would be dropped */
  dropTargetIndex: number;
  /** Programmatically cancel the current drag */
  cancelDrag: () => void;
  /** Whether keyboard reorder mode is active */
  isKeyboardDragging: boolean;
  /** The ID being keyboard-dragged */
  keyboardDragId: string | null;
}

export interface DragItemProps {
  'data-drag-id': string;
  'data-drag-index': number;
  draggable: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  style: React.CSSProperties;
  className: string;
  role: string;
  tabIndex: number;
  'aria-grabbed': boolean;
  'aria-dropeffect': string;
  'aria-roledescription': string;
  'aria-label': string;
}

export interface KeyboardItemProps {
  onKeyDown: (e: React.KeyboardEvent) => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialDragState: DragState = {
  isDragging: false,
  draggedId: null,
  draggedIndex: -1,
  overIndex: -1,
  dragX: 0,
  dragY: 0,
  initialX: 0,
  initialY: 0,
  offsetX: 0,
  offsetY: 0,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDragAndDrop(
  items: { id: string }[],
  options: DragAndDropOptions
): UseDragAndDropReturn {
  const {
    onReorder,
    onDragStart,
    onDragEnd,
    onDragCancel,
    axis = 'horizontal',
    enabled = true,
    dragThreshold = 5,
    hapticFeedback = true,
    animationDuration = 200,
    lockAxis = true,
    autoScrollSpeed = 10,
    autoScrollThreshold = 40,
  } = options;

  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const [isKeyboardDragging, setIsKeyboardDragging] = useState(false);
  const [keyboardDragId, setKeyboardDragId] = useState<string | null>(null);
  const [keyboardDragIndex, setKeyboardDragIndex] = useState(-1);

  const containerRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, initiated: false });
  const autoScrollRef = useRef<number | null>(null);
  const itemRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const animDurationRef = useRef(animationDuration);

  animDurationRef.current = animationDuration;

  // ─── Container ref callback ────────────────────────────────────

  const setContainerRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
  }, []);

  // ─── Haptic feedback ──────────────────────────────────────────

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [hapticFeedback]);

  // ─── Calculate item rects ─────────────────────────────────────

  const updateItemRects = useCallback(() => {
    if (!containerRef.current) return;
    const rects = new Map<string, DOMRect>();
    const children = containerRef.current.querySelectorAll('[data-drag-id]');
    children.forEach((child) => {
      const id = child.getAttribute('data-drag-id');
      if (id) {
        rects.set(id, child.getBoundingClientRect());
      }
    });
    itemRectsRef.current = rects;
  }, []);

  // ─── Find drop index from cursor position ────────────────────

  const findDropIndex = useCallback(
    (clientX: number, clientY: number): number => {
      const rects = itemRectsRef.current;
      if (rects.size === 0) return -1;

      let closestIndex = -1;
      let closestDist = Infinity;

      for (const [id, rect] of rects) {
        const el = containerRef.current?.querySelector(`[data-drag-id="${CSS.escape(id)}"]`);
        if (!el) continue;
        const index = parseInt(el.getAttribute('data-drag-index') || '-1', 10);
        if (index === -1) continue;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dist =
          axis === 'horizontal'
            ? Math.abs(clientX - centerX)
            : Math.abs(clientY - centerY);

        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = index;

          // Determine if we should insert before or after
          if (axis === 'horizontal') {
            if (clientX > centerX) closestIndex = index + 1;
            else closestIndex = index;
          } else {
            if (clientY > centerY) closestIndex = index + 1;
            else closestIndex = index;
          }
        }
      }

      return Math.max(0, Math.min(closestIndex, items.length));
    },
    [axis, items.length]
  );

  // ─── Auto-scroll ──────────────────────────────────────────────

  const startAutoScroll = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);

      const scroll = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        if (axis === 'horizontal') {
          if (clientX - rect.left < autoScrollThreshold) {
            containerRef.current.scrollLeft -= autoScrollSpeed;
          } else if (rect.right - clientX < autoScrollThreshold) {
            containerRef.current.scrollLeft += autoScrollSpeed;
          }
        } else {
          if (clientY - rect.top < autoScrollThreshold) {
            containerRef.current.scrollTop -= autoScrollSpeed;
          } else if (rect.bottom - clientY < autoScrollThreshold) {
            containerRef.current.scrollTop += autoScrollSpeed;
          }
        }

        autoScrollRef.current = requestAnimationFrame(scroll);
      };

      autoScrollRef.current = requestAnimationFrame(scroll);
    },
    [axis, autoScrollSpeed, autoScrollThreshold]
  );

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // ─── Cancel drag ──────────────────────────────────────────────

  const cancelDrag = useCallback(() => {
    stopAutoScroll();
    setDragState(initialDragState);
    dragStartRef.current = { x: 0, y: 0, initiated: false };
    onDragCancel?.();
  }, [stopAutoScroll, onDragCancel]);

  // ─── Complete drag / drop ─────────────────────────────────────

  const completeDrag = useCallback(
    (fromIndex: number, toIndex: number) => {
      stopAutoScroll();

      const item: DragItem = {
        id: dragState.draggedId || '',
        index: fromIndex,
      };

      // Only reorder if positions changed
      if (fromIndex !== toIndex && toIndex >= 0) {
        // Adjust toIndex: if dragging forward, account for removal
        const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
        if (adjustedTo !== fromIndex) {
          onReorder(fromIndex, adjustedTo);
        }
      }

      onDragEnd?.(item);
      setDragState(initialDragState);
      dragStartRef.current = { x: 0, y: 0, initiated: false };
    },
    [dragState.draggedId, onReorder, onDragEnd, stopAutoScroll]
  );

  // ─── Pointer events ──────────────────────────────────────────

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, id: string, index: number) => {
      if (!enabled) return;
      // Only primary button for mouse
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initiated: false,
      };

      updateItemRects();

      setDragState((prev) => ({
        ...prev,
        draggedId: id,
        draggedIndex: index,
        initialX: e.clientX,
        initialY: e.clientY,
      }));

      // Capture pointer for reliable tracking
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [enabled, updateItemRects]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.draggedId) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check threshold
      if (!dragStartRef.current.initiated) {
        if (dist < dragThreshold) return;
        dragStartRef.current.initiated = true;
        triggerHaptic();
        onDragStart?.({
          id: dragState.draggedId,
          index: dragState.draggedIndex,
        });
      }

      const dragX = lockAxis && axis === 'horizontal' ? e.clientX : e.clientX;
      const dragY = lockAxis && axis === 'vertical' ? e.clientY : e.clientY;

      updateItemRects();
      const overIndex = findDropIndex(e.clientX, e.clientY);
      startAutoScroll(e.clientX, e.clientY);

      setDragState((prev) => ({
        ...prev,
        isDragging: true,
        dragX,
        dragY,
        offsetX: e.clientX - prev.initialX,
        offsetY: e.clientY - prev.initialY,
        overIndex,
      }));
    },
    [
      dragState.draggedId,
      dragState.draggedIndex,
      dragThreshold,
      axis,
      lockAxis,
      triggerHaptic,
      onDragStart,
      updateItemRects,
      findDropIndex,
      startAutoScroll,
    ]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragState.draggedId) return;

    if (dragStartRef.current.initiated && dragState.isDragging) {
      completeDrag(dragState.draggedIndex, dragState.overIndex);
    } else {
      cancelDrag();
    }
  }, [dragState, completeDrag, cancelDrag]);

  // ─── Touch start handler (prevent scroll) ─────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      // Allow long-press or immediate drag depending on use case
      // We prevent default to stop scrolling once drag starts
      // But we DON'T prevent here — only prevent during drag move
    },
    [enabled]
  );

  // ─── Touch move (prevent scroll during drag) ─────────────────

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (dragState.isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [dragState.isDragging]);

  // ─── Global pointer listeners ─────────────────────────────────

  useEffect(() => {
    if (!dragState.draggedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDrag();
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dragState.draggedId, handlePointerMove, handlePointerUp, cancelDrag]);

  // ─── Cleanup on unmount ───────────────────────────────────────

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  // ─── Keyboard reorder ─────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string, index: number) => {
      if (!enabled) return;

      // Enter/Space to start keyboard drag mode
      if ((e.key === 'Enter' || e.key === ' ') && !isKeyboardDragging) {
        e.preventDefault();
        setIsKeyboardDragging(true);
        setKeyboardDragId(id);
        setKeyboardDragIndex(index);
        triggerHaptic();
        return;
      }

      // While in keyboard drag mode
      if (isKeyboardDragging && keyboardDragId === id) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsKeyboardDragging(false);
          setKeyboardDragId(null);
          setKeyboardDragIndex(-1);
          return;
        }

        const moveKey =
          axis === 'horizontal'
            ? { prev: 'ArrowLeft', next: 'ArrowRight' }
            : { prev: 'ArrowUp', next: 'ArrowDown' };

        if (e.key === moveKey.prev && keyboardDragIndex > 0) {
          e.preventDefault();
          const newIndex = keyboardDragIndex - 1;
          onReorder(keyboardDragIndex, newIndex);
          setKeyboardDragIndex(newIndex);
          triggerHaptic();
          return;
        }

        if (e.key === moveKey.next && keyboardDragIndex < items.length - 1) {
          e.preventDefault();
          const newIndex = keyboardDragIndex + 1;
          onReorder(keyboardDragIndex, newIndex);
          setKeyboardDragIndex(newIndex);
          triggerHaptic();
          return;
        }

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsKeyboardDragging(false);
          setKeyboardDragId(null);
          setKeyboardDragIndex(-1);
          return;
        }
      }
    },
    [
      enabled,
      axis,
      isKeyboardDragging,
      keyboardDragId,
      keyboardDragIndex,
      items.length,
      onReorder,
      triggerHaptic,
    ]
  );

  // ─── Item style computation ───────────────────────────────────

  const getItemStyle = useCallback(
    (id: string, index: number): React.CSSProperties => {
      if (!dragState.isDragging) {
        return {
          transition: `transform ${animDurationRef.current}ms ease`,
          touchAction: 'none',
          userSelect: 'none',
          cursor: enabled ? 'grab' : 'default',
        };
      }

      // The dragged item
      if (id === dragState.draggedId) {
        const translateX = axis === 'horizontal' ? dragState.offsetX : 0;
        const translateY = axis === 'vertical' ? dragState.offsetY : 0;

        return {
          transform: `translate(${translateX}px, ${translateY}px) scale(1.05)`,
          zIndex: 1000,
          opacity: 0.9,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          touchAction: 'none',
          userSelect: 'none',
          cursor: 'grabbing',
          transition: 'box-shadow 200ms ease, opacity 200ms ease',
          pointerEvents: 'none',
        };
      }

      // Other items: shift to make room
      const draggedIndex = dragState.draggedIndex;
      const overIndex = dragState.overIndex;

      let shift = 0;
      if (overIndex >= 0) {
        if (index >= overIndex && index < draggedIndex) {
          shift = 1; // shift right/down
        } else if (index <= overIndex - 1 && index > draggedIndex) {
          shift = -1; // shift left/up
        }
      }

      // Calculate shift amount from item dimensions
      const itemRect = itemRectsRef.current.get(id);
      const shiftAmount = itemRect
        ? axis === 'horizontal'
          ? itemRect.width + 8
          : itemRect.height + 8
        : 60;

      const translateX =
        axis === 'horizontal' ? shift * shiftAmount : 0;
      const translateY =
        axis === 'vertical' ? shift * shiftAmount : 0;

      return {
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: `transform ${animDurationRef.current}ms ease`,
        touchAction: 'none',
        userSelect: 'none',
        cursor: enabled ? 'grab' : 'default',
      };
    },
    [dragState, axis, enabled]
  );

  // ─── Item class computation ───────────────────────────────────

  const getItemClass = useCallback(
    (id: string): string => {
      const classes: string[] = [];

      if (dragState.isDragging && id === dragState.draggedId) {
        classes.push('dnd-dragging');
      }

      if (isKeyboardDragging && id === keyboardDragId) {
        classes.push('dnd-keyboard-dragging');
      }

      if (dragState.isDragging && id !== dragState.draggedId) {
        classes.push('dnd-sibling');
      }

      return classes.join(' ');
    },
    [dragState, isKeyboardDragging, keyboardDragId]
  );

  // ─── Return ───────────────────────────────────────────────────

  const getItemProps = useCallback(
    (id: string, index: number): DragItemProps => ({
      'data-drag-id': id,
      'data-drag-index': index,
      draggable: false, // We use pointer events, not native drag
      onPointerDown: (e) => handlePointerDown(e, id, index),
      onTouchStart: handleTouchStart,
      style: getItemStyle(id, index),
      className: getItemClass(id),
      role: 'option',
      tabIndex: 0,
      'aria-grabbed': dragState.isDragging && dragState.draggedId === id,
      'aria-dropeffect': dragState.isDragging ? 'move' : 'none',
      'aria-roledescription': 'sortable item',
      'aria-label': `Item ${index + 1} of ${items.length}. ${
        isKeyboardDragging && keyboardDragId === id
          ? 'Press arrow keys to move, Enter to drop, Escape to cancel.'
          : 'Press Enter to start reordering.'
      }`,
    }),
    [
      handlePointerDown,
      handleTouchStart,
      getItemStyle,
      getItemClass,
      dragState,
      items.length,
      isKeyboardDragging,
      keyboardDragId,
    ]
  );

  const getKeyboardProps = useCallback(
    (id: string, index: number): KeyboardItemProps => ({
      onKeyDown: (e) => handleKeyDown(e, id, index),
    }),
    [handleKeyDown]
  );

  return {
    dragState,
    isDragging: dragState.isDragging,
    containerProps: {
      ref: setContainerRef,
      role: 'listbox',
      'aria-label': 'Reorderable list',
    },
    getItemProps,
    getKeyboardProps,
    dropTargetIndex: dragState.overIndex,
    cancelDrag,
    isKeyboardDragging,
    keyboardDragId,
  };
}

export default useDragAndDrop;
