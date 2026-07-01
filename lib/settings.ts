import { db } from "./db"

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  const setting = await db.setting.findUnique({ where: { key } })
  return setting?.value ?? defaultValue
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.setting.upsert({
    where:  { key },
    update: { value },
    create: { key, value },
  })
}

export async function isAiModerationEnabled(): Promise<boolean> {
  const val = await getSetting("ai_moderation_enabled", "true")
  return val === "true"
}
