"use client"

import { useState, useTransition } from "react"
import { Header } from "@/components/header"
import { StarRating } from "@/components/star-rating"
import {
  simulateFromClient,
  simulateFromProfessional,
  simulateGetProfessional,
  simulateGetClient,
  type SimulateResult,
} from "./actions"

type PostType = "from-client" | "from-professional"
type GetType = "professional" | "client"

export default function SimulatePage() {
  const [activeTab, setActiveTab] = useState<"post" | "get">("post")
  const [isPending, startTransition] = useTransition()
  const [response, setResponse] = useState<SimulateResult | null>(null)

  // ── POST state ──────────────────────────────────────────────────────────────
  const [postType, setPostType] = useState<PostType>("from-client")
  const [jobId, setJobId] = useState("")
  const [clientId, setClientId] = useState("")
  const [professionalId, setProfessionalId] = useState("")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  // ── GET state ───────────────────────────────────────────────────────────────
  const [getUserId, setGetUserId] = useState("")
  const [getUserType, setGetUserType] = useState<GetType>("professional")
  const [getPage, setGetPage] = useState(1)
  const [getLimit, setGetLimit] = useState(10)

  // ── Handlers ────────────────────────────────────────────────────────────────
  function genUUID() {
    return crypto.randomUUID()
  }

  function handlePost() {
    startTransition(async () => {
      setResponse(null)
      const base = { job_id: jobId, client_id: clientId, professional_id: professionalId, rating, comment: comment || undefined }
      const result =
        postType === "from-client"
          ? await simulateFromClient(base)
          : await simulateFromProfessional({ job_id: jobId, professional_id: professionalId, client_id: clientId, rating, comment: comment || undefined })
      setResponse(result)
    })
  }

  function handleGet() {
    startTransition(async () => {
      setResponse(null)
      const result =
        getUserType === "professional"
          ? await simulateGetProfessional(getUserId, getPage, getLimit)
          : await simulateGetClient(getUserId, getPage, getLimit)
      setResponse(result)
    })
  }

  function switchTab(tab: "post" | "get") {
    setActiveTab(tab)
    setResponse(null)
  }

  // ── Status badge color ───────────────────────────────────────────────────────
  function statusClass(status: number) {
    if (status >= 200 && status < 300) return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
    if (status === 404) return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    if (status === 409) return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Simulador de API
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Simulá las llamadas que harían las otras apps al sistema de reseñas
            </p>
          </header>

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            {(["post", "get"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab === "post" ? "POST — Crear reseña" : "GET — Consultar reseñas"}
              </button>
            ))}
          </div>

          {/* Grid: form + response */}
          <div className="grid gap-5 lg:grid-cols-2">

            {/* ── Formulario ── */}
            <div className="rounded-xl border border-border bg-card p-5">

              {activeTab === "post" ? (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-foreground">Parámetros del POST</h2>

                  {/* Tipo */}
                  <Field label="Tipo de reseña">
                    <div className="flex gap-2">
                      {(["from-client", "from-professional"] as PostType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setPostType(t)}
                          className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            postType === t
                              ? t === "from-client"
                                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {t === "from-client" ? "Cliente → Profesional" : "Profesional → Cliente"}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Job ID */}
                  <Field label="job_id">
                    <div className="flex gap-2">
                      <input
                        value={jobId}
                        onChange={(e) => setJobId(e.target.value)}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button
                        onClick={() => setJobId(genUUID())}
                        className="rounded-lg border border-border bg-muted px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Generar
                      </button>
                    </div>
                  </Field>

                  {/* Client ID */}
                  <Field label="client_id">
                    <input
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="usr_client_001"
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </Field>

                  {/* Professional ID */}
                  <Field label="professional_id">
                    <input
                      value={professionalId}
                      onChange={(e) => setProfessionalId(e.target.value)}
                      placeholder="usr_prof_001"
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </Field>

                  {/* Rating */}
                  <Field label="rating">
                    <StarRating value={rating} onChange={setRating} size="md" />
                  </Field>

                  {/* Comment */}
                  <Field label="comment (opcional)">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Excelente servicio..."
                      rows={2}
                      className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </Field>

                  <button
                    onClick={handlePost}
                    disabled={isPending || !jobId || !clientId || !professionalId || rating === 0}
                    className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Enviando..." : "Enviar POST"}
                  </button>
                </div>

              ) : (

                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-foreground">Parámetros del GET</h2>

                  {/* Tipo de usuario */}
                  <Field label="Tipo de usuario evaluado">
                    <div className="flex gap-2">
                      {(["professional", "client"] as GetType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setGetUserType(t)}
                          className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            getUserType === t
                              ? t === "professional"
                                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {t === "professional" ? "Profesional" : "Cliente"}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* User ID */}
                  <Field label={getUserType === "professional" ? "professional_id" : "client_id"}>
                    <input
                      value={getUserId}
                      onChange={(e) => setGetUserId(e.target.value)}
                      placeholder={getUserType === "professional" ? "usr_prof_001" : "usr_client_001"}
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </Field>

                  {/* Paginación */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="page">
                      <input
                        type="number"
                        min={1}
                        value={getPage}
                        onChange={(e) => setGetPage(Math.max(1, Number(e.target.value)))}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </Field>
                    <Field label="limit (máx 50)">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={getLimit}
                        onChange={(e) => setGetLimit(Math.min(50, Math.max(1, Number(e.target.value))))}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </Field>
                  </div>

                  <button
                    onClick={handleGet}
                    disabled={isPending || !getUserId}
                    className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Consultando..." : "Enviar GET"}
                  </button>
                </div>
              )}
            </div>

            {/* ── Respuesta ── */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Respuesta</h2>
                {response && (
                  <span className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${statusClass(response.status)}`}>
                    {response.status}
                    {response.status === 201 && " Created"}
                    {response.status === 200 && " OK"}
                    {response.status === 404 && " Not Found"}
                    {response.status === 409 && " Conflict"}
                    {response.status === 422 && " Unprocessable"}
                  </span>
                )}
              </div>

              {isPending ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
                </div>
              ) : response ? (
                <pre className="max-h-105 overflow-auto rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
                  {JSON.stringify(response.body, null, 2)}
                </pre>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    La respuesta aparecerá aquí
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
