"use client";

import { useState } from "react";
import { FiDownload } from "react-icons/fi";

type ButtonState = "idle" | "loading" | "error";

export default function BragExportButton() {
  const [jsonState, setJsonState] = useState<ButtonState>("idle");
  const [pdfState, setPdfState] = useState<ButtonState>("idle");

  const isAnyLoading = jsonState === "loading" || pdfState === "loading";

  async function handleExport(format: "json" | "pdf") {
    const setState = format === "json" ? setJsonState : setPdfState;

    setState("loading");
    try {
      const res = await fetch(`/api/brag/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `brag-report.${format}`,
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  function buttonLabel(state: ButtonState, format: "json" | "pdf"): string {
    if (format === "json") {
      if (state === "loading") return "Exporting...";
      if (state === "error") return "Export Failed";
      return "Export JSON";
    }
    if (state === "loading") return "Generating...";
    if (state === "error") return "PDF Failed";
    return "Export PDF";
  }

  return (
    <div className="flex items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
      {/* JSON button */}
      <button
        onClick={() => handleExport("json")}
        disabled={isAnyLoading}
        className="btn-gradient flex items-center gap-[1.333vw] tablet:gap-[0.667vw] desktop:gap-[0.278vw] px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-lg text-white font-medium text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
      >
        <FiDownload className="w-[3.2vw] h-[3.2vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw]" />
        {buttonLabel(jsonState, "json")}
      </button>

      {/* PDF button */}
      <button
        onClick={() => handleExport("pdf")}
        disabled={isAnyLoading}
        className="btn-gradient flex items-center gap-[1.333vw] tablet:gap-[0.667vw] desktop:gap-[0.278vw] px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-lg text-white font-medium text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
      >
        <FiDownload className="w-[3.2vw] h-[3.2vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw]" />
        {buttonLabel(pdfState, "pdf")}
      </button>
    </div>
  );
}
