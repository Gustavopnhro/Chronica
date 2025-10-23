import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PostmortemState } from "@/types/postmortem"
import { useEffect } from "react"

interface IncidentOverviewProps {
  state: PostmortemState
  onChange: (field: keyof PostmortemState, value: any) => void
  t: (key: string) => string
}

export const IncidentOverview = ({ state, onChange, t }: IncidentOverviewProps) => {

  // 🧮 Cálculo automático da duração
  useEffect(() => {
    if (state.startTime && state.endTime) {
      const [h1, m1] = state.startTime.split(":").map(Number)
      const [h2, m2] = state.endTime.split(":").map(Number)
      const start = h1 * 60 + m1
      const end = h2 * 60 + m2
      const diff = end - start
      if (diff >= 0) {
        const hours = Math.floor(diff / 60)
        const minutes = diff % 60
        onChange("duration", `${hours}h ${minutes}m`)
      }
    }
  }, [state.startTime, state.endTime])

  return (
    <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-primary rounded-full"></span>
        {t("Incident Overview")}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {/* 🧾 Título */}
        <div className="md:col-span-2">
          <Label htmlFor="title">{t("Incident Title")}</Label>
          <Input
            id="title"
            value={state.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="e.g., API outage impacting checkout"
            className="mt-2"
          />
        </div>

        {/* 👤 Criador */}
        <div>
          <Label htmlFor="creator">{t("Creator")}</Label>
          <Input
            id="creator"
            value={state.creator}
            onChange={(e) => onChange("creator", e.target.value)}
            placeholder="Name of the creator"
            className="mt-2"
          />
        </div>

        {/* 📅 Data, horário e gravidade */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">{t("Date (start)")}</Label>
            <Input
              id="date"
              type="date"
              value={state.date}
              onChange={(e) => onChange("date", e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="severity">{t("Severity")}</Label>
            <Select value={state.severity} onValueChange={(v) => onChange("severity", v)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEV-1">SEV-1 (Critical)</SelectItem>
                <SelectItem value="SEV-2">SEV-2 (High)</SelectItem>
                <SelectItem value="SEV-3">SEV-3 (Moderate)</SelectItem>
                <SelectItem value="SEV-4">SEV-4 (Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Horários */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Horário de Início</Label>
            <Input
              id="startTime"
              type="time"
              value={state.startTime || ""}
              onChange={(e) => onChange("startTime", e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="endTime">Horário de Término</Label>
            <Input
              id="endTime"
              type="time"
              value={state.endTime || ""}
              onChange={(e) => onChange("endTime", e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {/* 👥 Donos */}
        <div>
          <Label htmlFor="owners">{t("Incident Commander / Owners")}</Label>
          <Input
            id="owners"
            value={state.owners}
            onChange={(e) => onChange("owners", e.target.value)}
            placeholder="Name(s), team(s)"
            className="mt-2"
          />
        </div>

        {/* ⏱️ Duração (automática) e sistemas afetados */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">{t("Duration (calculated)")}</Label>
            <Input
              id="duration"
              value={state.duration}
              readOnly
              placeholder="Automatic"
              className="mt-2 bg-muted/40 text-muted-foreground"
            />
          </div>
          <div>
            <Label htmlFor="affected">{t("Affected Systems")}</Label>
            <Input
              id="affected"
              value={state.affected}
              onChange={(e) => onChange("affected", e.target.value)}
              placeholder="e.g., Checkout API, DB shard A"
              className="mt-2"
            />
          </div>
        </div>

        {/* 🧠 Sumário e impacto */}
        <div>
          <Label htmlFor="summary">{t("Executive Summary")}</Label>
          <Textarea
            id="summary"
            value={state.summary}
            onChange={(e) => onChange("summary", e.target.value)}
            placeholder="What happened, who/what was impacted, and current status in 3–5 sentences."
            className="mt-2 min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="impact">{t("Customer Impact")}</Label>
          <Textarea
            id="impact"
            value={state.impact}
            onChange={(e) => onChange("impact", e.target.value)}
            placeholder="Quantify impact: % errors, # requests affected, revenue loss, SLO/SLA breaches."
            className="mt-2 min-h-[100px]"
          />
        </div>
      </div>
    </Card>
  )
}
