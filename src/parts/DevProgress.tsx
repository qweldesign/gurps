import { Fragment } from 'react'
import { type Task, type Tasks } from '../devProgress/types'

function DevProgress({ progress }: { progress: Tasks[] }) {
  const getTaskCount = () => {
    let count = 0
    progress.forEach(p => {
      p.tasks.forEach(() => count++)
    })
    return count
  }

  const getRowsCount = () => {
    const count = getTaskCount()
    return Math.ceil(count / 3)
  }

  const getId = (i: number, j: number): number => {
    progress.forEach((p, k) => {
      if (i > k) j += p.tasks.length
    })
    return j
  }

  const getName = (catName: string, name: string): string => {
    return `${catName} / ${name}`
  }

  const getLabel = (task: Task): string => {
    return task.progress === task.weight ? '完了'
      : task.progress > 0 ? '作業中' : '未着手'
  }

  const getClass = (task: Task): string => {
    return `w-${String(task.progress)}/${String(task.weight)}`
  }

  const getProgress = (): string => {
    let weightTotal = 0,  progressTotal = 0
    progress.forEach(p => {
      p.tasks.forEach(task => {
        weightTotal += task.weight
        progressTotal += task.progress
      })
    })
    return `${progressTotal / weightTotal * 100} %`
  }

  return (
    <>
      <h5>開発進捗 <span className="inline-block w-24 text-right">{getProgress()}</span></h5>
      <div className="table-wrapper">
        <div className={`grid grid-rows-${getRowsCount() + 1} grid-flow-col gap-x-8 w-5xl border-t-0`}>
          {progress.map((p, i) => (p.tasks.map((task, j) => (
            <Fragment key={`${i}-${j}`}>
              {getId(i, j) % getRowsCount() === 0 && (
                <div className="flex w-xs border-t font-bold">
                  <div className="flex-3/4">開発項目</div>
                  <div className="flex-1/4">進捗</div>
                </div>
              )}
              <div className="relative flex w-xs">
                <div className="flex-3/4 ps-3 text-left">{getName(p.name, task.name)}</div>
                <div className="flex-1/4">{getLabel(task)}</div>
                <div className={`progress absolute top-0 left-0 ${getClass(task)} h-1/1`}></div>
              </div>
            </Fragment>
          ))))}
        </div>
      </div>
    </>
  )
}

export default DevProgress
