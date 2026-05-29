"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { useBuilder } from "@/context/builder-context";
import type { FormField } from "@/types";

type Props = { onClose: () => void };

const buildSchema = (fields: FormField[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    if (f.kind === "select" || f.kind === "radio") {
      const vals = f.options.map((o) => o.value);
      if (vals.length > 0) {
        const [first, ...rest] = vals as [string, ...string[]];
        shape[f.name] = f.required
          ? z.enum([first, ...rest])
          : z.enum([first, ...rest]).optional();
      } else {
        shape[f.name] = f.required ? z.string().min(1) : z.string().optional();
      }
    } else if (f.dataType === "number") {
      shape[f.name] = f.required ? z.coerce.number() : z.coerce.number().optional();
    } else if (f.dataType === "email") {
      shape[f.name] = f.required
        ? z.string().email("Invalid email").min(1, `${f.label} is required`)
        : z.string().email("Invalid email").optional();
    } else {
      shape[f.name] = f.required
        ? z.string().min(1, `${f.label} is required`)
        : z.string().optional();
    }
  }
  return z.object(shape);
};

const renderField = (
  field: FormField,
  register: ReturnType<typeof useForm>["register"],
  error?: string
) => {
  const baseInputStyle: React.CSSProperties = {
    width: "100%",
    height: 38,
    padding: "0 12px",
    borderRadius: 6,
    border: `1px solid ${error ? "#ff5555" : "#6272a4"}`,
    background: "#44475a",
    color: "#f8f8f2",
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  switch (field.kind) {
    case "textarea":
      return (
        <textarea
          id={field.name}
          placeholder={field.placeholder}
          style={{ ...baseInputStyle, minHeight: 80, resize: "vertical" }}
          {...register(field.name)}
        />
      );
    case "select":
      return (
        <select id={field.name} style={baseInputStyle} {...register(field.name)}>
          <option value="">Select…</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {field.options.map((o) => (
            <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#f8f8f2", fontSize: 14 }}>
              <input type="radio" value={o.value} {...register(field.name)} style={{ accentColor: "#bd93f9" }} />
              {o.label}
            </label>
          ))}
        </div>
      );
    default:
      return (
        <input
          id={field.name}
          type={field.dataType}
          placeholder={field.placeholder}
          style={baseInputStyle}
          {...register(field.name)}
        />
      );
  }
};

const PreviewForm = ({ fields, grid }: { fields: FormField[]; grid: { cols: number; rows: number } }) => {
  const [submitted, setSubmitted] = useState(false);
  const schema = buildSchema(fields);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data: Record<string, unknown>) => {
    console.log("[Form Builder Preview] Submit:", data);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const sorted = [...fields].sort((a, b) => a.y - b.y || a.x - b.x);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gap: 16,
          marginBottom: 24,
        }}
      >
        {sorted.map((field) => (
          <div
            key={field.id}
            style={{
              gridColumn: `${field.x + 1} / span ${Math.min(field.w, grid.cols - field.x)}`,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <label
              htmlFor={field.name}
              style={{ fontSize: 13, fontWeight: 500, color: "#f8f8f2" }}
            >
              {field.label || "Untitled"}{field.required && <span style={{ color: "#ff5555" }}> *</span>}
            </label>
            {renderField(field, register, (errors[field.name]?.message as string) ?? undefined)}
            {errors[field.name] && (
              <span style={{ color: "#ff5555", fontSize: 12 }}>
                {errors[field.name]?.message as string}
              </span>
            )}
          </div>
        ))}
      </div>

      {submitted && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: "#50fa7b22", border: "1px solid #50fa7b", color: "#50fa7b", fontSize: 13 }}>
          Form submitted! Check the console for the data.
        </div>
      )}

      <button
        type="submit"
        style={{ padding: "10px 24px", background: "#bd93f9", color: "#282a36", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
      >
        Submit
      </button>
    </form>
  );
};

const PreviewModal = ({ onClose }: Props) => {
  const { state } = useBuilder();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-current-line bg-background shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-current-line">
          <h2 className="text-sm font-semibold text-foreground">Preview</h2>
          <button onClick={onClose} className="text-comment hover:text-foreground cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-auto flex-1 p-6">
          {state.fields.length === 0 ? (
            <p className="text-comment text-sm text-center py-8">No fields added yet.</p>
          ) : (
            <PreviewForm fields={state.fields} grid={state.grid} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
