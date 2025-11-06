"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Task, UserSettings } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Progress } from "@/components/ui/progress"

interface PomodoroTimerProps {
  settings?: UserSettings
  tasks: Task[]
  userId: string
}

type TimerMode = "pomodoro" | "short-break" | "long-break"

export function PomodoroTimer({ settings, tasks, userId }: PomodoroTimerProps) {
  const router = useRouter()
  const [mode, setMode] = useState<TimerMode>("pomodoro")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState((settings?.pomodoro_duration || 25) * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const durations = {
    pomodoro: (settings?.pomodoro_duration || 25) * 60,
    "short-break": (settings?.short_break_duration || 5) * 60,
    "long-break": (settings?.long_break_duration || 15) * 60,
  }

  const totalTime = durations[mode]
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = async () => {
    setIsRunning(false)

    if (mode === "pomodoro") {
      // Save pomodoro session
      const supabase = createClient()
      await supabase.from("pomodoro_sessions").insert({
        user_id: userId,
        task_id: selectedTaskId,
        duration: settings?.pomodoro_duration || 25,
        completed: true,
        completed_at: new Date().toISOString(),
      })

      setCompletedPomodoros((prev) => prev + 1)
      router.refresh()

      // Auto-switch to break
      if (completedPomodoros + 1 >= 4) {
        setMode("long-break")
        setTimeLeft(durations["long-break"])
        setCompletedPomodoros(0)
      } else {
        setMode("short-break")
        setTimeLeft(durations["short-break"])
      }
    } else {
      // Break finished, switch back to pomodoro
      setMode("pomodoro")
      setTimeLeft(durations.pomodoro)
    }
  }

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(durations[mode])
  }

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(durations[newMode])
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={mode === "pomodoro" ? "default" : "outline"}
                onClick={() => handleModeChange("pomodoro")}
                disabled={isRunning}
              >
                Pomodoro
              </Button>
              <Button
                variant={mode === "short-break" ? "default" : "outline"}
                onClick={() => handleModeChange("short-break")}
                disabled={isRunning}
              >
                Pausa Curta
              </Button>
              <Button
                variant={mode === "long-break" ? "default" : "outline"}
                onClick={() => handleModeChange("long-break")}
                disabled={isRunning}
              >
                Pausa Longa
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-8xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
              <Progress value={progress} className="mt-4" />
            </div>

            {mode === "pomodoro" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tarefa (opcional)</label>
                <Select
                  value={selectedTaskId || "none"}
                  onValueChange={(value) => setSelectedTaskId(value === "none" ? null : value)}
                  disabled={isRunning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma tarefa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma tarefa</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              {!isRunning ? (
                <Button size="lg" onClick={handleStart}>
                  <Play className="mr-2 h-5 w-5" />
                  Iniciar
                </Button>
              ) : (
                <Button size="lg" onClick={handlePause}>
                  <Pause className="mr-2 h-5 w-5" />
                  Pausar
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-5 w-5" />
                Reiniciar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sessões Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    i < completedPomodoros ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {i < completedPomodoros && <CheckCircle2 className="h-6 w-6" />}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">{completedPomodoros} de 4 Pomodoros completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Escolha uma tarefa para focar</p>
            <p>2. Inicie o timer de 25 minutos</p>
            <p>3. Trabalhe até o timer acabar</p>
            <p>4. Faça uma pausa de 5 minutos</p>
            <p>5. A cada 4 Pomodoros, faça uma pausa de 15 minutos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
