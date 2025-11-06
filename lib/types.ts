export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  frequency: "daily" | "weekly" | "monthly"
  streak: number
  best_streak: number
  last_completed: string | null
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  task_id: string | null
  duration: number
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface UserSettings {
  id: string
  pomodoro_duration: number
  short_break_duration: number
  long_break_duration: number
  auto_start_breaks: boolean
  auto_start_pomodoros: boolean
  daily_goal: number
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}
