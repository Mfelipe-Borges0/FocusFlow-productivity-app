import { createClient } from "@/lib/supabase/server"
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"

export default async function PomodoroPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user settings
  const { data: settings } = await supabase.from("user_settings").select("*").eq("id", user.id).single()

  // Get active tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("completed", false)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pomodoro</h1>
        <p className="text-muted-foreground">Use a técnica Pomodoro para manter o foco</p>
      </div>

      <PomodoroTimer settings={settings || undefined} tasks={tasks || []} userId={user.id} />
    </div>
  )
}
