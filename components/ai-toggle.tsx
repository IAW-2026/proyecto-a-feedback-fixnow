"use client"

import { useTransition } from "react"
import { toggleAiModeration } from "@/app/admin/reviews/actions"

export function AiToggle({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await toggleAiModeration()
    })
  }

  const isOn = isPending ? !enabled : enabled

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
    >
      <span
        className={`relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors duration-200 ${
          isOn ? "bg-green-500" : "bg-muted-foreground/40"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ${
            isOn ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="text-muted-foreground">
        Moderación IA:{" "}
        <span className={isOn ? "text-green-600 font-semibold" : "text-foreground font-semibold"}>
          {isOn ? "activada" : "desactivada"}
        </span>
      </span>
    </button>
  )
}
