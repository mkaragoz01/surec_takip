import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, "Geçerli bir renk kodu girin (örn: #F8FAFC)");

export const priorityEnum = z.enum(["LOW", "NORMAL", "HIGH"]);

export const processFormSchema = z.object({
  name: z.string().trim().min(1, "Süreç adı gerekli").max(50, "En fazla 50 karakter"),
  columnColor: hexColor,
  badgeColor: hexColor,
  isCompletedProcess: z.boolean(),
});
export type ProcessFormValues = z.infer<typeof processFormSchema>;

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Başlık gerekli").max(200, "En fazla 200 karakter"),
  description: z.string().trim().max(2000, "En fazla 2000 karakter").optional().or(z.literal("")),
  priority: priorityEnum,
  processId: z.string().min(1, "Süreç seçin"),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const settingsFormSchema = z.object({
  completedTaskRetentionDays: z
    .number()
    .int("Tam sayı girin")
    .min(1, "En az 1 gün")
    .max(365, "En fazla 365 gün"),
});
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const importProcessSchema = z.object({
  id: z.string(),
  name: z.string(),
  columnColor: z.string(),
  badgeColor: z.string(),
  order: z.number(),
  isCompletedProcess: z.boolean(),
});

const importTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: priorityEnum,
  order: z.number(),
  processId: z.string(),
  completedAt: z.string().nullable(),
  archiveAt: z.string().nullable(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const importFileSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  settings: z.object({
    completedTaskRetentionDays: z.number().int().min(1).max(365),
  }),
  processes: z.array(importProcessSchema),
  tasks: z.array(importTaskSchema),
});
export type ImportFile = z.infer<typeof importFileSchema>;
