import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, TrendingUp, Target } from "lucide-react"
import { getStartOfDay, getEndOfDay, formatTime } from "@/lib/utils/date"
import { MOTIVATIONAL_QUOTES, POMODORO_TIPS, PRIORITY_COLORS } from "@/lib/constants"
import type { Task, PomodoroSession } from "@/lib/types"

async function getDashboardStats(userId: string) {
  const supabase = await createClient()
  const today = new Date()
  const startOfDay = getStartOfDay(today)
  const endOfDay = getEndOfDay(today)

  // Get all tasks
  const { data: allTasks } = await supabase.from("tasks").select("*").eq("user_id", userId)

  // Get completed tasks
  const completedTasks = allTasks?.filter((task) => task.completed) || []

  // Get today's pomodoro sessions
  const { data: todaySessions } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString())
    .lte("created_at", endOfDay.toISOString())

  // Calculate total focus time today
  const totalFocusTime =
    todaySessions?.reduce((acc, session: PomodoroSession) => acc + (session.completed ? session.duration : 0), 0) || 0

  // Calculate completion rate
  const totalTasks = allTasks?.length || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

  // Get upcoming tasks (not completed, ordered by due date)
  const { data: upcomingTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", false)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(5)

  return {
    completedTasks: completedTasks.length,
    totalTasks,
    totalFocusTime,
    completionRate,
    sessionsToday: todaySessions?.filter((s: PomodoroSession) => s.completed).length || 0,
    upcomingTasks: upcomingTasks || [],
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const stats = await getDashboardStats(user.id)

  // Get random quote and tip
  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  const randomTip = POMODORO_TIPS[Math.floor(Math.random() * POMODORO_TIPS.length)]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao FocusFlow</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso e mantenha o foco</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedTasks}/{stats.totalTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo em Foco</CardTitle>
            <Clock className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalFocusTime)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Target className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.upcomingTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma tarefa pendente. Você está em dia!</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingTasks.map((task: Task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className={`h-2 w-2 rounded-full ${PRIORITY_COLORS[task.priority]}`} />
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Motivação do Dia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <blockquote className="border-l-4 border-primary pl-4 italic">
            <p className="text-lg">{randomQuote.text}</p>
            <footer className="mt-2 text-sm text-muted-foreground">— {randomQuote.author}</footer>
          </blockquote>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              <span className="font-semibold">💡 Dica do dia:</span> {randomTip}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
