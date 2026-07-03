import { prisma } from "@/lib/prisma";

const DEFAULT_PROCESSES = [
  { name: "Yeni", columnColor: "#F1F1EF", badgeColor: "#787774", isCompletedProcess: false },
  { name: "Sorulacak", columnColor: "#FBECDD", badgeColor: "#D9730D", isCompletedProcess: false },
  { name: "Haber Bekliyor", columnColor: "#FBF3DB", badgeColor: "#CB912F", isCompletedProcess: false },
  { name: "Devam Ediyor", columnColor: "#E7F3F8", badgeColor: "#337EA9", isCompletedProcess: false },
  { name: "Tamamlandi", columnColor: "#EDF3EC", badgeColor: "#448361", isCompletedProcess: true },
];

export async function ensureDefaultData() {
  const processCount = await prisma.process.count();
  if (processCount === 0) {
    await prisma.process.createMany({
      data: DEFAULT_PROCESSES.map((process, index) => ({
        ...process,
        order: index,
      })),
    });
  }

  await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}
