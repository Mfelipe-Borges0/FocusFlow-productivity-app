"use client"

import { useState } from "react"
import type { Habit } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Flame, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EditHabitDialog } from "./edit-habit-dialog"
import { isToday } from "@/lib/utils/date"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HabitCardProps {
  habit: Habit
  onUpdate: (habit: Habit) => void
  onDelete: (habitId: string) => void
}

export function HabitCard({ habit, onUpdate, onDelete }: HabitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const completedToday = habit.last_completed ? isToday(habit.last_completed) : false

  const handleComplete = async () => {
    if (completedToday) return

    setIsCompleting(true)
    const supabase = createClient()
    const now = new Date().toISOString()
    const newStreak = habit.streak + 1
    const newBestStreak = Math.max(newStreak, habit.best_streak)

    const { data, error } = await supabase
      .from("habits")
      .update({
        streak: newStreak,
        best_streak: newBestStreak,
        last_completed: now,
        updated_at: now,
      })
      .eq("id", habit.id)
      .select()
      .single()

    if (!error && data) {
      onUpdate(data)
    }
    setIsCompleting(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("habits").delete().eq("id", habit.id)

    if (!error) {
      onDelete(habit.id)
    }
    setIsDeleting(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{habit.name}</CardTitle>
        <div className="flex items-center gap-1">
          <EditHabitDialog habit={habit} onUpdate={onUpdate}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </EditHabitDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir hábito</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este hábito? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {habit.description && <p className="text-sm text-muted-foreground">{habit.description}</p>}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{habit.streak}</p>
              <p className="text-xs text-muted-foreground">dias seguidos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{habit.best_streak}</p>
            <p className="text-xs text-muted-foreground">melhor sequência</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {habit.frequency === "daily" ? "Diário" : habit.frequency === "weekly" ? "Semanal" : "Mensal"}
          </Badge>
        </div>

        <Button
          className="w-full"
          onClick={handleComplete}
          disabled={completedToday || isCompleting}
          variant={completedToday ? "secondary" : "default"}
        >
          {completedToday ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Concluído hoje
            </>
          ) : (
            <>Marcar como concluído</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
