import type { FormField, GridConfig } from "@/types";

export type Framework = "react" | "html";
export type Validator = "zod" | "yup" | "none";

export type CodeGenOptions = {
  handler: string;
  validator: Validator;
  framework: Framework;
  gridOnly: boolean;
};

export type CodeOutput =
  | { framework: "react"; code: string }
  | { framework: "html"; html: string; css: string };

// ─── Shared helpers ───────────────────────────────────────────────────────────

const constName = (name: string) =>
  name.toUpperCase().replace(/[^A-Z0-9]/g, "_") + "_OPTIONS";

const buildOptionsConst = (field: FormField): string => {
  const rows = field.options
    .map((o) => `  { label: "${o.label}", value: "${o.value}" },`)
    .join("\n");
  return `const ${constName(field.name)} = [\n${rows}\n] as const;\n`;
};

const fieldsWithOptions = (fields: FormField[]) =>
  fields.filter((f) => (f.kind === "select" || f.kind === "radio") && f.options.length > 0);

const gridClasses = (f: FormField) =>
  `col-start-${f.x + 1} col-span-${f.w} row-start-${f.y + 1} row-span-${f.h}`;

// ─── Zod / Yup schema ────────────────────────────────────────────────────────

const toZodType = (field: FormField): string => {
  if (field.kind === "select" || field.kind === "radio") {
    if (field.options.length > 0) {
      const vals = field.options.map((o) => `"${o.value}"`).join(", ");
      const base = `z.enum([${vals}])`;
      return field.required ? base : `${base}.optional()`;
    }
    return field.required ? `z.string().min(1, "${field.label} is required")` : "z.string().optional()";
  }
  if (field.dataType === "number") {
    return field.required ? "z.coerce.number()" : "z.coerce.number().optional()";
  }
  const emailCheck = field.dataType === "email" ? `.email("Invalid email")` : "";
  const minCheck = field.required ? `.min(1, "${field.label} is required")` : "";
  return `z.string()${emailCheck}${minCheck}${!field.required ? ".optional()" : ""}`;
};

const toYupType = (field: FormField): string => {
  if (field.kind === "select" || field.kind === "radio") {
    const base = "yup.string()";
    return field.required ? `${base}.required("${field.label} is required")` : base;
  }
  if (field.dataType === "number") {
    return field.required ? `yup.number().required("${field.label} is required")` : "yup.number()";
  }
  const emailCheck = field.dataType === "email" ? `.email("Invalid email")` : "";
  const required = field.required ? `.required("${field.label} is required")` : "";
  return `yup.string()${emailCheck}${required}`;
};

const generateZodSchema = (fields: FormField[]) => {
  const entries = fields.map((f) => `  ${f.name}: ${toZodType(f)},`).join("\n");
  return `const schema = z.object({\n${entries}\n});`;
};

const generateYupSchema = (fields: FormField[]) => {
  const entries = fields.map((f) => `  ${f.name}: ${toYupType(f)},`).join("\n");
  return `const schema = yup.object({\n${entries}\n});`;
};

// ─── React + Tailwind output ──────────────────────────────────────────────────

const inputTw = "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2";
const textareaTw = `${inputTw} min-h-[80px] resize-y`;
const labelTw = "block text-sm font-medium";
const errorTw = "text-xs mt-0.5";

const cx = (cls: string, gridOnly: boolean) => (gridOnly ? "" : cls);
const attr = (name: string, val: string, gridOnly: boolean) =>
  !gridOnly && val ? ` ${name}="${val}"` : "";

const renderReactInput = (field: FormField, gridOnly = false): string => {
  switch (field.kind) {
    case "textarea":
      return `        <textarea
          id="${field.name}"${attr("placeholder", field.placeholder ?? "", gridOnly)}${cx(`\n          className="${textareaTw}"`, gridOnly)}
          {...register("${field.name}")}
        />`;

    case "select":
      if (field.options.length > 0) {
        return `        <select id="${field.name}"${cx(` className="${inputTw}"`, gridOnly)} {...register("${field.name}")}>
          <option value="">Select…</option>
          {${constName(field.name)}.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>`;
      }
      return `        <select id="${field.name}"${cx(` className="${inputTw}"`, gridOnly)} {...register("${field.name}")}>
          <option value="">Select…</option>
        </select>`;

    case "radio":
      if (field.options.length > 0) {
        return `        <div${cx(` className="flex flex-col gap-2"`, gridOnly)}>
          {${constName(field.name)}.map((o) => (
            <label key={o.value}${cx(` className="flex items-center gap-2 cursor-pointer text-sm"`, gridOnly)}>
              <input type="radio" value={o.value} {...register("${field.name}")} />
              {o.label}
            </label>
          ))}
        </div>`;
      }
      return `        <div />`;

    default:
      return `        <input
          id="${field.name}"
          type="${field.dataType}"${attr("placeholder", field.placeholder ?? "", gridOnly)}${cx(`\n          className="${inputTw}"`, gridOnly)}
          {...register("${field.name}")}
        />`;
  }
};

const generateReactCode = (
  fields: FormField[],
  grid: GridConfig,
  options: CodeGenOptions
): string => {
  const { handler, validator, gridOnly } = options;

  const imports = [`import { useForm } from "react-hook-form";`];
  let schemaBlock = "";
  let resolverLine = "";
  let typeBlock = "";

  if (validator === "zod") {
    imports.push(`import { z } from "zod";`);
    imports.push(`import { zodResolver } from "@hookform/resolvers/zod";`);
    schemaBlock = generateZodSchema(fields);
    typeBlock = "type FormData = z.infer<typeof schema>;";
    resolverLine = "resolver: zodResolver(schema),";
  } else if (validator === "yup") {
    imports.push(`import * as yup from "yup";`);
    imports.push(`import { yupResolver } from "@hookform/resolvers/yup";`);
    schemaBlock = generateYupSchema(fields);
    typeBlock = "type FormData = yup.InferType<typeof schema>;";
    resolverLine = "resolver: yupResolver(schema),";
  } else {
    typeBlock = `type FormData = {\n${fields.map((f) => `  ${f.name}: ${f.dataType === "number" ? "number" : "string"};`).join("\n")}\n};`;
  }

  const optionConsts = fieldsWithOptions(fields).map(buildOptionsConst).join("\n");

  const fieldBlocks = fields
    .map((f) => {
      const wrapperCls = [gridClasses(f), !gridOnly && "flex flex-col gap-1"].filter(Boolean).join(" ");
      return `      <div className="${wrapperCls}">
        <label htmlFor="${f.name}"${cx(` className="${labelTw}"`, gridOnly)}>
          ${f.label}${f.required ? " *" : ""}
        </label>
${renderReactInput(f, gridOnly)}
        {errors.${f.name} && (
          <span${cx(` className="${errorTw}"`, gridOnly)}>{errors.${f.name}?.message}</span>
        )}
      </div>`;
    })
    .join("\n");

  const submitHandler =
    !handler || handler === "console.log"
      ? `  const onSubmit = (data: FormData) => {\n    console.log(data);\n  };`
      : `  const onSubmit = async (data: FormData) => {\n    console.log(data);\n    await ${handler}(data);\n  };`;

  return [
    imports.join("\n"),
    "",
    schemaBlock ? schemaBlock + "\n" : "",
    optionConsts,
    typeBlock,
    "",
    "const MyForm = () => {",
    `  const { register, handleSubmit, formState: { errors } } = useForm<FormData>(${resolverLine ? `{\n    ${resolverLine}\n  }` : "{}"});`,
    "",
    submitHandler,
    "",
    "  return (",
    `    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-${grid.cols} gap-[${grid.gap}${grid.gapUnit}]">`,
    fieldBlocks,
    `      <div className="col-span-full">`,
    `        <button type="submit"${cx(` className="px-6 py-2.5 rounded-md font-semibold"`, gridOnly)}>`,
    "          Submit",
    "        </button>",
    "      </div>",
    "    </form>",
    "  );",
    "};",
    "",
    "export default MyForm;",
    "",
  ]
    .filter((l) => l !== undefined)
    .join("\n");
};

// ─── HTML + BEM CSS output ────────────────────────────────────────────────────

const generateHtmlField = (field: FormField, grid: GridConfig): string => {
  const gridStyle = `grid-column: ${field.x + 1} / span ${Math.min(field.w, grid.cols - field.x)}; grid-row: ${field.y + 1} / span ${field.h};`;
  const requiredAttr = field.required ? " required" : "";
  const labelClass = `form__label${field.required ? " form__label--required" : ""}`;

  let control = "";
  switch (field.kind) {
    case "textarea":
      control = `      <textarea
        id="${field.name}"
        name="${field.name}"
        class="form__textarea"
        placeholder="${field.placeholder ?? ""}"${requiredAttr}
      ></textarea>`;
      break;
    case "select": {
      const opts = field.options
        .map((o) => `        <option value="${o.value}">${o.label}</option>`)
        .join("\n");
      control = `      <select id="${field.name}" name="${field.name}" class="form__select"${requiredAttr}>
        <option value="">Select…</option>
${opts}
      </select>`;
      break;
    }
    case "radio": {
      const radios = field.options
        .map(
          (o) =>
            `        <label class="form__radio-item">
          <input type="radio" name="${field.name}" value="${o.value}" class="form__radio-input"${requiredAttr} />
          <span>${o.label}</span>
        </label>`
        )
        .join("\n");
      control = `      <div class="form__radio-group">\n${radios}\n      </div>`;
      break;
    }
    default:
      control = `      <input
        id="${field.name}"
        type="${field.dataType}"
        name="${field.name}"
        class="form__input"
        placeholder="${field.placeholder ?? ""}"${requiredAttr}
      />`;
  }

  return `    <div class="form__field" style="${gridStyle}">
      <label class="${labelClass}" for="${field.name}">${field.label}</label>
${control}
      <span class="form__error" id="${field.name}-error" hidden></span>
    </div>`;
};

const generateValidationScript = (fields: FormField[], handler: string): string => {
  const validations = fields
    .filter((f) => f.required)
    .map((f) => {
      return `
    const ${f.name}El = form.querySelector('[name="${f.name}"]');
    const ${f.name}Err = document.getElementById("${f.name}-error");
    const ${f.name}Val = ${f.name}El.value;
    if (!${f.name}Val) {
      ${f.name}Err.textContent = "${f.label} is required";
      ${f.name}Err.hidden = false;
      ${f.name}El.classList.add("form__input--error");
      valid = false;
    } else {
      ${f.name}Err.hidden = true;
      ${f.name}El.classList.remove("form__input--error");
      data["${f.name}"] = ${f.name}Val;
    }`;
    })
    .join("\n");

  const nonRequired = fields
    .filter((f) => !f.required)
    .map(
      (f) =>
        `    const ${f.name}El = form.querySelector('[name="${f.name}"]');\n    data["${f.name}"] = ${f.name}El?.value ?? "";`
    )
    .join("\n");

  const submitCall =
    !handler || handler === "console.log"
      ? "    console.log(data);"
      : `    console.log(data);\n    ${handler}(data);`;

  return `  const form = document.getElementById("my-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    const data = {};
${validations}
${nonRequired}
    if (valid) {
${submitCall}
    }
  });`;
};

const generateHtmlCode = (fields: FormField[], grid: GridConfig, handler: string): string => {
  const fieldBlocks = [...fields]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((f) => generateHtmlField(f, grid))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Form</title>
  <link rel="stylesheet" href="form.css" />
</head>
<body>
  <form class="form" id="my-form" novalidate>
    <div class="form__grid" style="grid-template-columns: repeat(${grid.cols}, 1fr); grid-template-rows: repeat(${grid.rows}, auto); gap: ${grid.gap}${grid.gapUnit};">
${fieldBlocks}
    </div>
    <div class="form__actions">
      <button type="submit" class="form__submit">Submit</button>
    </div>
  </form>

  <script>
${generateValidationScript(fields, handler)}
  </script>
</body>
</html>
`;
};

const generateBemCss = (fields: FormField[], gridOnly = false): string => {
  if (gridOnly) {
    return [
      "/* Form — grid structure only */",
      "",
      ".form__grid {",
      "  display: grid;",
      "  gap: 16px;",
      "  margin-bottom: 24px;",
      "}",
      "",
      ".form__field {",
      "  display: flex;",
      "  flex-direction: column;",
      "  gap: 4px;",
      "}",
      "",
    ].join("\n");
  }
  const hasTextarea = fields.some((f) => f.kind === "textarea");
  const hasSelect = fields.some((f) => f.kind === "select");
  const hasRadio = fields.some((f) => f.kind === "radio");

  const controlSelectors = [
    ".form__input",
    hasTextarea && ".form__textarea",
    hasSelect && ".form__select",
  ]
    .filter(Boolean)
    .join(",\n");

  const focusSelectors = controlSelectors
    .split(",\n")
    .map((s) => `${s.trim()}:focus`)
    .join(",\n");

  const errorSelectors = controlSelectors
    .split(",\n")
    .map((s) => `${s.trim()}--error`)
    .join(",\n");

  return `/* Form — BEM */

.form {
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
}

.form__grid {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form__label {
  font-weight: 500;
}

.form__label--required::after {
  content: " *";
}

${controlSelectors} {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: box-shadow 0.15s;
  box-sizing: border-box;
}

${focusSelectors} {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

${errorSelectors} {
  outline: 2px solid;
}
${
  hasSelect
    ? `
.form__select {
  cursor: pointer;
}
`
    : ""
}${
  hasTextarea
    ? `
.form__textarea {
  min-height: 80px;
  resize: vertical;
}
`
    : ""
}${
  hasRadio
    ? `
.form__radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form__radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form__radio-input {
  cursor: pointer;
}
`
    : ""
}
.form__error {
  font-size: 0.75rem;
}

.form__actions {
  margin-top: 8px;
}

.form__submit {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
}
`;
};

// ─── Entry point ──────────────────────────────────────────────────────────────

export const generateCode = (
  fields: FormField[],
  grid: GridConfig,
  options: CodeGenOptions
): CodeOutput => {
  if (options.framework === "html") {
    return {
      framework: "html",
      html: generateHtmlCode(fields, grid, options.handler),
      css: generateBemCss(fields, options.gridOnly),
    };
  }

  return {
    framework: "react",
    code: generateReactCode(fields, grid, options),
  };
};
