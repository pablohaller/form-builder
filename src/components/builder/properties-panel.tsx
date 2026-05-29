"use client";

import { Plus, Trash2 } from "lucide-react";
import { useBuilder } from "@/context/builder-context";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import type { DataType, FieldOption, FormField } from "@/types";

const dataTypes: { value: DataType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "password", label: "Password" },
  { value: "date", label: "Date" },
];

const PropertiesPanel = () => {
  const { selectedField, dispatch } = useBuilder();

  if (!selectedField) {
    return (
      <aside className="w-64 shrink-0 border-l border-current-line p-4 flex items-center justify-center">
        <p className="text-comment text-sm text-center">Select a field to edit its properties</p>
      </aside>
    );
  }

  const updateField = (patch: Partial<FormField>) =>
    dispatch({ type: "UPDATE_FIELD", payload: { id: selectedField.id, ...patch } });

  const addOption = () => {
    const next: FieldOption = { label: "Option", value: `option_${Date.now()}` };
    updateField({ options: [...selectedField.options, next] });
  };

  const updateOption = (index: number, patch: Partial<FieldOption>) => {
    const updated = selectedField.options.map((o, i) =>
      i === index ? { ...o, ...patch } : o
    );
    updateField({ options: updated });
  };

  const removeOption = (index: number) =>
    updateField({ options: selectedField.options.filter((_, i) => i !== index) });

  const showOptions = selectedField.kind === "select" || selectedField.kind === "radio";
  const showDataType = selectedField.kind === "input";

  return (
    <aside className="w-64 shrink-0 border-l border-current-line p-4 overflow-y-auto flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-comment">Properties</p>

      <div className="flex flex-col gap-1">
        <Label htmlFor="prop-label">Label</Label>
        <Input
          id="prop-label"
          value={selectedField.label}
          onChange={(e) => updateField({ label: e.target.value })}
          placeholder="Field label"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="prop-name">Field name</Label>
        <Input
          id="prop-name"
          value={selectedField.name}
          onChange={(e) =>
            updateField({ name: e.target.value.replace(/\s+/g, "_").toLowerCase() })
          }
          placeholder="field_name"
        />
        <p className="text-xs text-comment">Used as the form key</p>
      </div>

      {showDataType && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="prop-datatype">Data type</Label>
          <Select
            id="prop-datatype"
            value={selectedField.dataType}
            onChange={(e) => updateField({ dataType: e.target.value as DataType })}
          >
            {dataTypes.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <Label htmlFor="prop-placeholder">Placeholder</Label>
        <Input
          id="prop-placeholder"
          value={selectedField.placeholder ?? ""}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          placeholder="Optional hint…"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="prop-required"
          type="checkbox"
          checked={selectedField.required}
          onChange={(e) => updateField({ required: e.target.checked })}
          className="accent-purple w-4 h-4 cursor-pointer"
        />
        <Label htmlFor="prop-required">Required</Label>
      </div>

      {showOptions && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <button
              onClick={addOption}
              className="text-cyan hover:text-cyan/80 cursor-pointer transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          {selectedField.options.length === 0 && (
            <p className="text-xs text-comment">No options yet</p>
          )}
          {selectedField.options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <Input
                  value={opt.label}
                  onChange={(e) => updateOption(i, { label: e.target.value })}
                  placeholder="Label"
                  className="text-xs py-1"
                />
                <Input
                  value={opt.value}
                  onChange={(e) => updateOption(i, { value: e.target.value })}
                  placeholder="Value"
                  className="text-xs py-1"
                />
              </div>
              <button
                onClick={() => removeOption(i)}
                className="text-comment hover:text-red cursor-pointer transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-current-line">
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          onClick={() =>
            dispatch({ type: "REMOVE_FIELD", payload: { id: selectedField.id } })
          }
        >
          <Trash2 size={14} />
          Remove field
        </Button>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
