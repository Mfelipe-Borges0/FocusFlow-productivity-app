"use client"

import { useState } from "react"
import type { Habit } from "@/lib/types"
import { HabitCard } from "./habit-card"

interface HabitListProps {
  initialHabits: Habit[]
}

export function HabitList({ initialHabits }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)

  const handleHabitUpdate = (updatedHabit: Habit) => {
    setHabits((prev) => prev.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)))
  }

  const handleHabitDelete = (habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId))
  }

  if (habits.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum hábito criado ainda. Crie um novo hábito para começar!
      </p>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} onUpdate={handleHabitUpdate} onDelete={handleHabitDelete} />
      ))}
    </div>
  )
}
