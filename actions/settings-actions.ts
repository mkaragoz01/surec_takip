"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { settingsFormSchema, type SettingsFormValues } from "@/lib/validations";

export async function getSettings() {
  return prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

export async function updateSettings(values: SettingsFormValues) {
  const data = settingsFormSchema.parse(values);

  const settings = await prisma.setting.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  const pendingTasks = await prisma.task.findMany({
    where: { archivedAt: null, completedAt: { not: null } },
  });

  await prisma.$transaction(
    pendingTasks.map((task) =>
      prisma.task.update({
        where: { id: task.id },
        data: {
          archiveAt: new Date(
            task.completedAt!.getTime() + data.completedTaskRetentionDays * 24 * 60 * 60 * 1000
          ),
        },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/settings");
  return settings;
}
