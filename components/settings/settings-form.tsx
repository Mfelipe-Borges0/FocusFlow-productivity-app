"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { UserSettings } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { z } from "zod"

const settingsSchema = z.object({
  pomodoro_duration: z.number().min(1).max(60),
  short_break_duration: z.number().min(1).max(30),
  long_break_duration: z.number().min(1).max(60),
  daily_goal: z.number().min(1).max(20),
  auto_start_breaks: z.boolean(),
  auto_start_pomodoros: z.boolean(),
  notifications_enabled: z.boolean(),
})

interface SettingsFormProps {
  initialSettings?: UserSettings
  userId: string
}

export function SettingsForm({ initialSettings, userId }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = {
      pomodoro_duration: Number.parseInt(formData.get("pomodoro_duration") as string),
      short_break_duration: Number.parseInt(formData.get("short_break_duration") as string),
      long_break_duration: Number.parseInt(formData.get("long_break_duration") as string),
      daily_goal: Number.parseInt(formData.get("daily_goal") as string),
      auto_start_breaks: formData.get("auto_start_breaks") === "on",
      auto_start_pomodoros: formData.get("auto_start_pomodoros") === "on",
      notifications_enabled: formData.get("notifications_enabled") === "on",
    }

    try {
      settingsSchema.parse(data)

      const supabase = createClient()

      if (initialSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from("user_settings")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (updateError) throw updateError
      } else {
        // Insert new settings
        const { error: insertError } = await supabase.from("user_settings").insert({
          id: userId,
          ...data,
        })

        if (insertError) throw insertError
      }

      setSuccess(true)
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocorreu um erro ao salvar as configurações")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Pomodoro</CardTitle>
          <CardDescription>Personalize a duração dos seus ciclos Pomodoro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pomodoro_duration">Duração do Pomodoro (min)</Label>
              <Input
                id="pomodoro_duration"
                name="pomodoro_duration"
                type="number"
                min="1"
                max="60"
                defaultValue={initialSettings?.pomodoro_duration || 25}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_break_duration">Pausa Curta (min)</Label>
              <Input
                id="short_break_duration"
                name="short_break_duration"
                type="number"
                min="1"
                max="30"
                defaultValue={initialSettings?.short_break_duration || 5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long_break_duration">Pausa Longa (min)</Label>
              <Input
                id="long_break_duration"
                name="long_break_duration"
                type="number"
                min="1"
                max="60"
                defaultValue={initialSettings?.long_break_duration || 15}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily_goal">Meta Diária (Pomodoros)</Label>
            <Input
              id="daily_goal"
              name="daily_goal"
              type="number"
              min="1"
              max="20"
              defaultValue={initialSettings?.daily_goal || 8}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_start_breaks">Iniciar pausas automaticamente</Label>
                <p className="text-sm text-muted-foreground">As pausas começam automaticamente após um Pomodoro</p>
              </div>
              <Switch
                id="auto_start_breaks"
                name="auto_start_breaks"
                defaultChecked={initialSettings?.auto_start_breaks || false}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_start_pomodoros">Iniciar Pomodoros automaticamente</Label>
                <p className="text-sm text-muted-foreground">Os Pomodoros começam automaticamente após uma pausa</p>
              </div>
              <Switch
                id="auto_start_pomodoros"
                name="auto_start_pomodoros"
                defaultChecked={initialSettings?.auto_start_pomodoros || false}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications_enabled">Notificações</Label>
                <p className="text-sm text-muted-foreground">Receber notificações quando o timer terminar</p>
              </div>
              <Switch
                id="notifications_enabled"
                name="notifications_enabled"
                defaultChecked={initialSettings?.notifications_enabled !== false}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">Configurações salvas com sucesso!</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
