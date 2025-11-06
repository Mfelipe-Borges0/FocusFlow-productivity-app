"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Habit } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"

const habitSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
})

interface EditHabitDialogProps {
  habit: Habit
  onUpdate: (habit: Habit) => void
  children: React.ReactNode
}

export function EditHabitDialog({ habit, onUpdate, children }: EditHabitDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      frequency: formData.get("frequency") as "daily" | "weekly" | "monthly",
    }

    try {
      habitSchema.parse(data)

      const supabase = createClient()
      const { data: updatedHabit, error: updateError } = await supabase
        .from("habits")
        .update({
          name: data.name,
          description: data.description || null,
          frequency: data.frequency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", habit.id)
        .select()
        .single()

      if (updateError) throw updateError

      if (updatedHabit) {
        onUpdate(updatedHabit)
      }

      setOpen(false)
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocorreu um erro ao atualizar o hábito")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Hábito</DialogTitle>
          <DialogDescription>Atualize as informações do hábito</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" name="name" defaultValue={habit.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea id="edit-description" name="description" defaultValue={habit.description || ""} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-frequency">Frequência</Label>
              <Select name="frequency" defaultValue={habit.frequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
