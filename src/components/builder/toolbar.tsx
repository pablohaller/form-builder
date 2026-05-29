"use client";

import { Columns2, Rows2, Space, Eye, Code2 } from "lucide-react";
import { useBuilder } from "@/context/builder-context";
import { calcEffectiveRows } from "@/lib/grid-utils";
import Button from "@/components/ui/button";
import type { GapUnit } from "@/types";

type Props = {
  onShowPreview: () => void;
  onShowCode: () => void;
};

const BTN = "w-6 h-6 flex items-center justify-center rounded text-foreground hover:bg-current-line disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm";

const Counter = ({
  label,
  icon,
  value,
  onDec,
  onInc,
  disableDec,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onDec: () => void;
  onInc: () => void;
  disableDec?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-comment">{icon}</span>
    <span className="text-xs text-comment">{label}</span>
    <button onClick={onDec} disabled={disableDec} className={BTN}>−</button>
    <span className="text-sm font-mono w-5 text-center text-foreground">{value}</span>
    <button onClick={onInc} className={BTN}>+</button>
  </div>
);

const Toolbar = ({ onShowPreview, onShowCode }: Props) => {
  const { state, dispatch } = useBuilder();
  const { cols, rows, gap, gapUnit } = state.grid;

  const effectiveRows = calcEffectiveRows(state.fields, rows);
  const maxUsedRow = state.fields.length > 0 ? Math.max(...state.fields.map((f) => f.y + f.h)) : 0;

  const setGrid = (patch: Parameters<typeof dispatch>[0] extends { payload: infer P } ? P : never) =>
    dispatch({ type: "SET_GRID", payload: patch as Partial<typeof state.grid> });

  return (
    <header className="flex items-center gap-6 px-4 py-3 border-b border-current-line bg-background flex-wrap min-h-[52px]">
      <h1 className="text-sm font-semibold text-foreground">Form Builder</h1>

      <div className="w-px h-4 bg-current-line" />

      <Counter
        label="Columns"
        icon={<Columns2 size={14} />}
        value={cols}
        disableDec={cols <= 1}
        onDec={() => dispatch({ type: "SET_GRID", payload: { cols: cols - 1 } })}
        onInc={() => dispatch({ type: "SET_GRID", payload: { cols: cols + 1 } })}
      />

      <Counter
        label="Rows"
        icon={<Rows2 size={14} />}
        value={effectiveRows}
        disableDec={effectiveRows <= 1 || effectiveRows <= maxUsedRow}
        onDec={() => dispatch({ type: "SET_GRID", payload: { rows: Math.max(1, rows - 1) } })}
        onInc={() => dispatch({ type: "SET_GRID", payload: { rows: effectiveRows + 1 } })}
      />

      <div className="w-px h-4 bg-current-line" />

      <div className="flex items-center gap-2">
        <span className="text-comment"><Space size={14} /></span>
        <span className="text-xs text-comment">Gap</span>
        <input
          type="number"
          min={0}
          step={gapUnit === "px" ? 1 : 0.25}
          value={gap}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= 0) dispatch({ type: "SET_GRID", payload: { gap: v } });
          }}
          className="w-14 rounded border border-comment bg-current-line px-2 py-1 text-sm text-foreground text-center focus:outline-none focus:border-purple"
        />
        <select
          value={gapUnit}
          onChange={(e) => dispatch({ type: "SET_GRID", payload: { gapUnit: e.target.value as GapUnit } })}
          className="rounded border border-comment bg-current-line px-2 py-1 text-sm text-foreground focus:outline-none focus:border-purple cursor-pointer"
        >
          <option value="rem">rem</option>
          <option value="px">px</option>
          <option value="em">em</option>
        </select>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onShowPreview}>
          <Eye size={14} />
          Preview
        </Button>
        <Button size="sm" onClick={onShowCode}>
          <Code2 size={14} />
          Code
        </Button>
      </div>
    </header>
  );
};

export default Toolbar;
