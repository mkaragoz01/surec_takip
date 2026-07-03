"use server";

import { revalidatePath } from "next/cache";
import { buildExportData, applyImportData } from "@/lib/export-import";
import { importFileSchema } from "@/lib/validations";

export async function exportBackup() {
  return buildExportData();
}

export async function importBackup(raw: unknown) {
  const parsed = importFileSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "Dosya formatı geçersiz: " + parsed.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  if (parsed.data.version !== 1) {
    return { success: false as const, error: "Desteklenmeyen yedek sürümü" };
  }

  await applyImportData(parsed.data);
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/settings");
  return { success: true as const };
}
