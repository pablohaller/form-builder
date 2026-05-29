"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { BuilderAction, BuilderState, FormField } from "@/types";

const initialState: BuilderState = {
  fields: [],
  grid: { cols: 2, rows: 4, gap: 1, gapUnit: "rem" },
  selectedId: null,
};

const reducer = (state: BuilderState, action: BuilderAction): BuilderState => {
  switch (action.type) {
    case "ADD_FIELD":
      return { ...state, fields: [...state.fields, action.payload], selectedId: action.payload.id };

    case "UPDATE_FIELD":
      return {
        ...state,
        fields: state.fields.map((f) =>
          f.id === action.payload.id ? { ...f, ...action.payload } : f
        ),
      };

    case "REMOVE_FIELD":
      return {
        ...state,
        fields: state.fields.filter((f) => f.id !== action.payload.id),
        selectedId: state.selectedId === action.payload.id ? null : state.selectedId,
      };

    case "SELECT_FIELD":
      return { ...state, selectedId: action.payload.id };

    case "SET_GRID":
      return { ...state, grid: { ...state.grid, ...action.payload } };

    case "UPDATE_LAYOUT":
      return {
        ...state,
        fields: state.fields.map((f) => {
          const updated = action.payload.find((p) => p.id === f.id);
          return updated ? { ...f, ...updated } : f;
        }),
      };

    default:
      return state;
  }
};

type BuilderContextValue = {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  selectedField: FormField | null;
};

const BuilderContext = createContext<BuilderContextValue | null>(null);

export const BuilderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const selectedField = state.fields.find((f) => f.id === state.selectedId) ?? null;

  return (
    <BuilderContext.Provider value={{ state, dispatch, selectedField }}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
};
