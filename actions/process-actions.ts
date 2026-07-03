"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { processFormSchema, type ProcessFormValues } from "@/lib/validations";

export async function createProcess(values: ProcessFormValues) {
  const data = processFormSchema.parse(values);
  const maxOrder = await prisma.process.aggregate({ _max: { order: true } });
  const process = await prisma.process.create({
    data: {
      ...data,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  revalidatePath("/");
  return process;
}

export async function updateProcess(id: string, values: ProcessFormValues) {
  const data = processFormSchema.parse(values);
  const process = await prisma.process.update({ where: { id }, data });
  revalidatePath("/");
  return process;
}

export async function deleteProcess(id: string) {
  await prisma.process.delete({ where: { id } });
  revalidatePath("/");
}

export async function reorderProcesses(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.process.update({ where: { id }, data: { order: index } })
    )
  );
  revalidatePath("/");
}
