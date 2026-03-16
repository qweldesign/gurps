// devProgress/types.ts

export type Task = {
  name: string
  weight: number
  progress: number
}

export type Tasks = {
  name: string
  tasks: Task[]
}
