"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { exportBackup, importBackup } from "@/actions/import-export-actions";

export function ImportExportPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "backup.json";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  function handleImportClick() {
    if (
      !window.confirm(
        "İçe aktarma mevcut tüm süreç, kart ve ayarların üzerine yazacak. Devam etmek istiyor musunuz?"
      )
    ) {
      return;
    }
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setMessage(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = await importBackup(json);
      if (result.success) {
        setMessage({ type: "success", text: "İçe aktarma tamamlandı." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Dosya okunamadı veya geçerli bir JSON değil." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5">
      <h3 className="text-[13px] font-semibold text-slate-800">Yedekleme</h3>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <Download size={14} /> JSON Dışa Aktar
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <Upload size={14} /> JSON İçe Aktar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {message ? (
        <p className={`text-xs ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
