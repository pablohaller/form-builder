"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Type, AlignLeft, List, CircleDot } from "lucide-react";
import type { FieldKind } from "@/types";

type PaletteItem = {
  kind: FieldKind;
  label: string;
  icon: React.ReactNode;
  description: string;
};

const items: PaletteItem[] = [
  { kind: "input", label: "Input", icon: <Type size={18} />, description: "Text, number, email…" },
  { kind: "textarea", label: "Textarea", icon: <AlignLeft size={18} />, description: "Multi-line text" },
  { kind: "select", label: "Select", icon: <List size={18} />, description: "Dropdown options" },
  { kind: "radio", label: "Radio", icon: <CircleDot size={18} />, description: "Single choice" },
];

const DraggablePaletteItem = ({ item }: { item: PaletteItem }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${item.kind}`,
    data: { kind: item.kind },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-3 rounded-md border border-current-line bg-current-line px-3 py-3 cursor-grab active:cursor-grabbing hover:border-purple transition-colors select-none"
    >
      <span className="text-cyan">{item.icon}</span>
      <div>
        <p className="text-sm font-medium text-foreground">{item.label}</p>
        <p className="text-xs text-comment">{item.description}</p>
      </div>
    </div>
  );
};

const Palette = () => (
  <aside className="w-56 shrink-0 flex flex-col gap-2 p-4 border-r border-current-line">
    <p className="text-xs font-semibold uppercase tracking-widest text-comment mb-2">Fields</p>
    {items.map((item) => (
      <DraggablePaletteItem key={item.kind} item={item} />
    ))}
  </aside>
);

export default Palette;
