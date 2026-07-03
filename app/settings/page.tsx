import { getSettings } from "@/actions/settings-actions";
import { SettingsForm } from "@/components/settings-form";
import { ImportExportPanel } from "@/components/import-export-panel";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h2 className="mb-1 text-base font-semibold text-slate-800">Ayarlar</h2>
        <p className="text-[13px] text-slate-400">Arşivleme süresini yönetin ve verilerinizi yedekleyin.</p>
      </div>
      <SettingsForm initialRetentionDays={settings.completedTaskRetentionDays} />
      <ImportExportPanel />
    </div>
  );
}
