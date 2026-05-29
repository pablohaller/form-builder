"use client";

import { Trash2, GripVertical } from "lucide-react";
import { useBuilder } from "@/context/builder-context";
import type { FormField } from "@/types";

const kindLabel: Record<FormField["kind"], string> = {
  input: "Input",
  textarea: "Textarea",
  select: "Select",
  radio: "Radio",
};

type Props = { field: FormField };

const FieldCard = ({ field }: Props) => {
  const { dispatch, state } = useBuilder();
  const isSelected = state.selectedId === field.id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SELECT_FIELD", payload: { id: field.id } });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "REMOVE_FIELD", payload: { id: field.id } });
  };

  return (
    <div
      onClick={handleSelect}
      className={`h-full w-full rounded-md border bg-current-line flex flex-col gap-1 p-3 cursor-pointer transition-colors group ${
        isSelected ? "border-purple ring-1 ring-purple" : "border-current-line hover:border-comment"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical size={14} className="text-comment shrink-0" />
          <span className="text-xs font-semibold text-purple uppercase tracking-wider">
            {kindLabel[field.kind]}
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-comment hover:text-red cursor-pointer"
          aria-label="Remove field"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <p className="text-sm text-foreground font-medium truncate">{field.label || <span className="text-comment italic">Untitled</span>}</p>
      {field.name && <p className="text-xs text-comment truncate">{field.name}</p>}
    </div>
  );
};

export default FieldCard;
