# Form Builder

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A visual drag-and-drop form builder for developers. Design forms on a configurable grid, then export production-ready code.

Vibe coded with Claude.

## Features

- **Drag & drop** field types from the palette onto a grid canvas
- **Grid canvas** with configurable columns, rows, and gap (rem / px / em)
- **Resize & reposition** any field freely within the grid
- **Field types**: Input, Textarea, Select, Radio
- **Per-field config**: label, field name, data type, placeholder, required, options (select/radio)
- **Live preview** — interact with the form, validation runs, submit logs to console
- **Code generation** with two output targets:
  - React component (Tailwind CSS + react-hook-form + Zod or Yup)
  - Plain HTML + CSS (BEM, no framework)
- **Grid-only mode** — strip all decorative classes, keep only grid structure
- Syntax-highlighted code viewer with one-click copy

## Stack

|                 |                                   |
| --------------- | --------------------------------- |
| Framework       | Next.js 16 (App Router)           |
| Language        | TypeScript (strict)               |
| Styling         | Tailwind CSS v4 (Dracula palette) |
| Drag & drop     | @dnd-kit/core                     |
| Grid canvas     | react-grid-layout                 |
| Preview form    | react-hook-form + Zod             |
| Code highlight  | prism-react-renderer              |
| Package manager | pnpm                              |

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Building a form

1. **Add fields** — drag any field type from the left palette and drop it onto the canvas at the target cell.
2. **Reposition** — drag a field card within the canvas to move it to another cell.
3. **Resize** — grab the resize handle (bottom-right corner of a card) to span multiple columns or rows.
4. **Configure** — click a field card to select it; edit its properties in the right panel (label, name, data type, required, options).
5. **Grid settings** — use the toolbar to adjust column count, row count, and gap size with unit.

### Previewing

Click **Preview** in the toolbar to open the live form. Fill it in and submit — validation runs against the Zod schema derived from your field configuration. The submitted data is logged to the browser console.

### Exporting code

Click **Code** in the toolbar to open the code viewer.

| Option         | Description                                             |
| -------------- | ------------------------------------------------------- |
| Framework      | `React + Tailwind` or `HTML + CSS (BEM)`                |
| Validator      | `Zod`, `Yup`, or none (React only)                      |
| Submit handler | Function name called with the form data on submit       |
| Grid only      | Strip all decorative classes — keep grid structure only |

For **HTML + CSS**, two tabs appear: `form.html` and `form.css`. Copy each file separately.

### Generated React output

```tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ROLE_OPTIONS = [
  { label: "Engineer", value: "engineer" },
  { label: "Designer", value: "designer" },
] as const;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["engineer", "designer"]),
});

type FormData = z.infer<typeof schema>;

const MyForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid grid-cols-2 gap-[1rem]">
      <div className="col-start-1 col-span-1 row-start-1 row-span-1 flex flex-col gap-1">
        <label htmlFor="name" className="block text-sm font-medium">
          Name *
        </label>
        <input
          id="name"
          type="text"
          className="w-full rounded-md border px-3 py-2 text-sm ..."
          {...register("name")}
        />
        {errors.name && (
          <span className="text-xs mt-0.5">{errors.name?.message}</span>
        )}
      </div>
      {/* ... */}
    </form>
  );
};
```

Grid positioning uses standard Tailwind utilities (`col-start-*`, `col-span-*`, `row-start-*`, `row-span-*`) — no arbitrary values or inline styles for layout.

## Project structure

```
src/
  app/                        # Next.js app directory
    layout.tsx
    page.tsx
    globals.css               # Dracula theme variables
  components/
    builder/
      builder.tsx             # Root: DnD context + modal state
      canvas.tsx              # Grid canvas + visual grid overlay
      field-card.tsx          # Draggable field card
      palette.tsx             # Field type palette
      properties-panel.tsx    # Field config panel
      toolbar.tsx             # Grid controls + action buttons
    modals/
      code-modal.tsx          # Code viewer
      preview-modal.tsx       # Live form preview
    ui/                       # Shared primitives (Button, Input, Select, Label)
  context/
    builder-context.tsx       # useReducer state + BuilderProvider
  lib/
    canvas-constants.ts       # ROW_HEIGHT, CANVAS_PADDING
    code-gen.ts               # Pure code generator (React + HTML/CSS)
    grid-utils.ts             # gapToPx, calcEffectiveRows, findFreeCell
  types/
    index.ts                  # FormField, GridConfig, BuilderState, actions
```

## License

AGPL v3 — see [LICENSE](./LICENSE). Any modified version hosted as a network service must publish its source under the same license.
