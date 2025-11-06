"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/utils/date"
import { EditTaskDialog } from "./edit-task-dialog"
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

interface TaskCardProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = async () => {
    const supabase = createClient()
    const completed = !task.completed
    const completed_at = completed ? new Date().toISOString() : null

    const { data, error } = await supabase
      .from("tasks")
      .update({
        completed,
        completed_at,
        status: completed ? "completed" : "todo",
      })
      .eq("id", task.id)
      .select()
      .single()

    if (!error && data) {
      onUpdate(data)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("tasks").delete().eq("id", task.id)

    if (!error) {
      onDelete(task.id)
    }
    setIsDeleting(false)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox checked={task.completed} onCheckedChange={handleToggleComplete} className="mt-1" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <EditTaskDialog task={task} onUpdate={onUpdate}>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </EditTaskDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
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
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <div className={`mr-2 h-2 w-2 rounded-full ${PRIORITY_COLORS[task.priority]}`} />
                {PRIORITY_LABELS[task.priority]}
              </Badge>
              <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge>
              {task.due_date && (
                <Badge variant="outline">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDate(task.due_date)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
