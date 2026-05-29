"use client";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { nanoid } from "nanoid";
import { BuilderProvider, useBuilder } from "@/context/builder-context";
import Palette from "./palette";
import Canvas from "./canvas";
import PropertiesPanel from "./properties-panel";
import Toolbar from "./toolbar";
import CodeModal from "@/components/modals/code-modal";
import PreviewModal from "@/components/modals/preview-modal";
import { findFreeCell, gapToPx } from "@/lib/grid-utils";
import { ROW_HEIGHT, CANVAS_PADDING } from "@/lib/canvas-constants";
import type { FieldKind, FormField } from "@/types";

const defaultField = (kind: FieldKind, x: number, y: number): FormField => ({
  id: nanoid(),
  kind,
  label: kind.charAt(0).toUpperCase() + kind.slice(1),
  name: `${kind}_${nanoid(4)}`,
  dataType: "text",
  placeholder: "",
  required: false,
  options: [],
  x,
  y,
  w: 1,
  h: 1,
});

const cellFromDrop = (
  event: DragEndEvent,
  cols: number,
  gapPx: number
): { x: number; y: number } | null => {
  const canvasRect = event.over?.rect;
  const dragRect = event.active.rect.current.translated;
  if (!canvasRect || !dragRect) return null;

  // Inner width available to the RGL (canvas minus outer padding on both sides)
  const innerWidth = canvasRect.width - CANVAS_PADDING * 2;
  // Cell width accounting for container padding (gapPx each side) and gaps between cells
  const cellWidth = (innerWidth - gapPx * (cols + 1)) / cols;

  // Centre of the dragged element in viewport coordinates
  const dropCenterX = (dragRect.left + dragRect.right) / 2;
  const dropCenterY = (dragRect.top + dragRect.bottom) / 2;

  // Position relative to the RGL container origin (after canvas outer padding)
  const xInRgl = dropCenterX - canvasRect.left - CANVAS_PADDING;
  const yInRgl = dropCenterY - canvasRect.top - CANVAS_PADDING;

  // Convert to grid cell indices (containerPadding = gapPx, cell stride = cellWidth + gapPx)
  const col = Math.max(0, Math.min(cols - 1, Math.floor((xInRgl - gapPx) / (cellWidth + gapPx))));
  const row = Math.max(0, Math.floor((yInRgl - gapPx) / (ROW_HEIGHT + gapPx)));

  return { x: col, y: row };
};

const BuilderInner = () => {
  const { state, dispatch } = useBuilder();
  const [showCode, setShowCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over || over.id !== "canvas") return;

    const kind = active.data.current?.kind as FieldKind | undefined;
    if (!kind) return;

    const gapPx = gapToPx(state.grid.gap, state.grid.gapUnit);
    const target = cellFromDrop(event, state.grid.cols, gapPx);
    const { x, y } = target ?? findFreeCell(state.fields, state.grid);

    dispatch({ type: "ADD_FIELD", payload: defaultField(kind, x, y) });
  };

  return (
    <DndContext id="form-builder" sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen overflow-hidden">
        <Toolbar onShowPreview={() => setShowPreview(true)} onShowCode={() => setShowCode(true)} />
        <div className="flex flex-1 overflow-hidden">
          <Palette />
          <Canvas />
          <PropertiesPanel />
        </div>
      </div>

{showCode && <CodeModal onClose={() => setShowCode(false)} />}
      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
    </DndContext>
  );
};

const Builder = () => (
  <BuilderProvider>
    <BuilderInner />
  </BuilderProvider>
);

export default Builder;
