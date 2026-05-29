"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { useBuilder } from "@/context/builder-context";
import { generateCode, type Framework, type Validator } from "@/lib/code-gen";
import Button from "@/components/ui/button";
import Label from "@/components/ui/label";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

type Props = { onClose: () => void };

type HtmlTab = "html" | "css";

const CodeBlock = ({ code, language }: { code: string; language: string }) => (
  <Highlight theme={themes.dracula} code={code.trim()} language={language}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre
        className={className}
        style={{ ...style, margin: 0, padding: "20px", background: "transparent", fontFamily: "monospace", fontSize: 13 }}
      >
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line })}>
            <span className="select-none mr-4 text-comment text-xs">{String(i + 1).padStart(3, " ")}</span>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);

const CodeModal = ({ onClose }: Props) => {
  const { state } = useBuilder();
  const [handler, setHandler] = useState("console.log");
  const [validator, setValidator] = useState<Validator>("zod");
  const [framework, setFramework] = useState<Framework>("react");
  const [htmlTab, setHtmlTab] = useState<HtmlTab>("html");
  const [gridOnly, setGridOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const output = generateCode(state.fields, state.grid, { handler, validator, framework, gridOnly });

  const activecode =
    output.framework === "html"
      ? htmlTab === "html"
        ? output.html
        : output.css
      : output.code;

  const activeLanguage =
    output.framework === "html"
      ? htmlTab === "css"
        ? "css"
        : "markup"
      : "tsx";

  const copy = async () => {
    await navigator.clipboard.writeText(activecode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-current-line bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-current-line">
          <h2 className="text-sm font-semibold text-foreground">Generated Code</h2>
          <button onClick={onClose} className="text-comment hover:text-foreground cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 px-5 py-3 border-b border-current-line">
          <div className="flex flex-col gap-1">
            <Label htmlFor="code-framework">Framework</Label>
            <Select
              id="code-framework"
              value={framework}
              onChange={(e) => setFramework(e.target.value as Framework)}
              className="w-44 text-sm"
            >
              <option value="react">React + Tailwind</option>
              <option value="html">HTML + CSS (BEM)</option>
            </Select>
          </div>

          {framework === "react" && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="code-validator">Validator</Label>
              <Select
                id="code-validator"
                value={validator}
                onChange={(e) => setValidator(e.target.value as Validator)}
                className="w-32 text-sm"
              >
                <option value="zod">Zod</option>
                <option value="yup">Yup</option>
                <option value="none">None</option>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1 flex-1 min-w-40">
            <Label htmlFor="code-handler">Submit handler</Label>
            <Input
              id="code-handler"
              value={handler}
              onChange={(e) => setHandler(e.target.value)}
              placeholder="e.g. myApi.submit"
              className="text-sm"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 mb-0.5">
            <input
              type="checkbox"
              checked={gridOnly}
              onChange={(e) => setGridOnly(e.target.checked)}
              className="accent-purple w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-comment">Grid only</span>
          </label>

          <Button size="sm" variant="secondary" onClick={copy} className="mb-0.5 shrink-0">
            {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {/* HTML tabs */}
        {framework === "html" && (
          <div className="flex gap-0 border-b border-current-line px-5">
            {(["html", "css"] as HtmlTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setHtmlTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  htmlTab === tab
                    ? "border-purple text-purple"
                    : "border-transparent text-comment hover:text-foreground"
                }`}
              >
                {tab === "html" ? "form.html" : "form.css"}
              </button>
            ))}
          </div>
        )}

        {/* Code */}
        <div className="overflow-auto flex-1 text-sm">
          <CodeBlock code={activecode} language={activeLanguage} />
        </div>
      </div>
    </div>
  );
};

export default CodeModal;
