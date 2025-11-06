import { createClient } from "@/lib/supabase/server"
import { HabitList } from "@/components/habits/habit-list"
import { CreateHabitDialog } from "@/components/habits/create-habit-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function HabitsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hábitos</h1>
          <p className="text-muted-foreground">Acompanhe seus hábitos e construa sequências</p>
        </div>
        <CreateHabitDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Hábito
          </Button>
        </CreateHabitDialog>
      </div>

      <HabitList initialHabits={habits || []} />
    </div>
  )
}
