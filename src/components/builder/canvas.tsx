"use client";

import { useDroppable } from "@dnd-kit/core";
import { GridLayout, useContainerWidth, noCompactor, type Layout } from "react-grid-layout";
import { useBuilder } from "@/context/builder-context";
import { gapToPx, calcEffectiveRows } from "@/lib/grid-utils";
import { ROW_HEIGHT, CANVAS_PADDING } from "@/lib/canvas-constants";
import FieldCard from "./field-card";
import "react-grid-layout/css/styles.css";

const Canvas = () => {
  const { state, dispatch } = useBuilder();
  const { fields, grid } = state;
  const { width, containerRef } = useContainerWidth();

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: "canvas" });

  const gapPx = gapToPx(grid.gap, grid.gapUnit);
  const effectiveRows = calcEffectiveRows(fields, grid.rows);
  const margin: [number, number] = [gapPx, gapPx];

  const layout: Layout = fields.map((f) => ({
    i: f.id,
    x: f.x,
    y: f.y,
    w: f.w,
    h: f.h,
    minW: 1,
    minH: 1,
  }));

  const handleLayoutChange = (newLayout: Layout) => {
    dispatch({
      type: "UPDATE_LAYOUT",
      payload: newLayout.map((l) => ({
        id: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      })),
    });
  };

  return (
    <div
      ref={setDropRef}
      onClick={() => dispatch({ type: "SELECT_FIELD", payload: { id: null } })}
      className={`flex-1 overflow-auto transition-colors ${isOver ? "bg-purple/5" : "bg-background"}`}
      style={{ padding: CANVAS_PADDING }}
    >
      {fields.length === 0 && width === 0 && (
        <div className="h-full flex items-center justify-center pointer-events-none">
          <p className="text-comment text-sm">Drag fields from the palette to start building</p>
        </div>
      )}

      <div ref={containerRef} className="relative">
        {/* Grid line overlay */}
        {width > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
              gridTemplateRows: `repeat(${effectiveRows}, ${ROW_HEIGHT}px)`,
              gap: gapPx,
              padding: gapPx,
            }}
          >
            {Array.from({ length: grid.cols * effectiveRows }).map((_, i) => (
              <div
                key={i}
                className="rounded border border-dashed border-comment/20"
              />
            ))}
          </div>
        )}

        {/* React Grid Layout */}
        {width > 0 && (
          <GridLayout
            width={width}
            layout={layout}
            gridConfig={{ cols: grid.cols, rowHeight: ROW_HEIGHT, margin }}
            dragConfig={{ enabled: true, threshold: 5 }}
            resizeConfig={{ enabled: true }}
            compactor={noCompactor}
            onLayoutChange={handleLayoutChange}
          >
            {fields.map((field) => (
              <div key={field.id}>
                <FieldCard field={field} />
              </div>
            ))}
          </GridLayout>
        )}

        {/* Empty state (only shown when there are no fields but container is sized) */}
        {fields.length === 0 && width > 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ minHeight: ROW_HEIGHT + gapPx * 2 }}
          >
            <p className="text-comment text-sm">Drag fields from the palette to start building</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
