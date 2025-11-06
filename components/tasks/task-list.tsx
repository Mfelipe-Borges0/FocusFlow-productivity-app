"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { TaskCard } from "./task-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TaskListProps {
  initialTasks: Task[]
}

export function TaskList({ initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const todoTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList>
        <TabsTrigger value="active">Ativas ({todoTasks.length})</TabsTrigger>
        <TabsTrigger value="completed">Concluídas ({completedTasks.length})</TabsTrigger>
        <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4 mt-6">
        {todoTasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma tarefa ativa. Crie uma nova tarefa para começar!
          </p>
        ) : (
          todoTasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
          ))
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4 mt-6">
        {completedTasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma tarefa concluída ainda.</p>
        ) : (
          completedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
          ))
        )}
      </TabsContent>

      <TabsContent value="all" className="space-y-4 mt-6">
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma tarefa criada ainda.</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
