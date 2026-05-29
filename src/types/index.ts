export type FieldKind = "input" | "textarea" | "select" | "radio";
export type DataType = "text" | "number" | "email" | "password" | "date";
export type GapUnit = "rem" | "px" | "em";

export type FieldOption = { label: string; value: string };

export type FormField = {
  id: string;
  kind: FieldKind;
  label: string;
  name: string;
  dataType: DataType;
  placeholder?: string;
  required: boolean;
  options: FieldOption[];
  x: number;
  y: number;
  w: number;
  h: number;
};

export type GridConfig = {
  cols: number;
  rows: number;
  gap: number;
  gapUnit: GapUnit;
};

export type BuilderState = {
  fields: FormField[];
  grid: GridConfig;
  selectedId: string | null;
};

export type BuilderAction =
  | { type: "ADD_FIELD"; payload: FormField }
  | { type: "UPDATE_FIELD"; payload: Partial<FormField> & { id: string } }
  | { type: "REMOVE_FIELD"; payload: { id: string } }
  | { type: "SELECT_FIELD"; payload: { id: string | null } }
  | { type: "SET_GRID"; payload: Partial<GridConfig> }
  | {
      type: "UPDATE_LAYOUT";
      payload: { id: string; x: number; y: number; w: number; h: number }[];
    };
