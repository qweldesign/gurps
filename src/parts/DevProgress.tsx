import { Fragment } from 'react'

type Task = [string, boolean]

function DevProgress({ tasks }: { tasks: Task[] }) {
  const getLabel = (task: Task): string => {
    return task[1] ? '完了' : '未実装'
  }

  const getClass = (task: Task): string => {
    return `w-${String(task[1] ? '1' : '0')}/1`
  }

  const getProgress = (): string => {
    let total = 0, progress = 0
    tasks.forEach(task => {
      total++
      progress += task[1] ? 1 : 0
    })
    return `${Math.round((progress / total) * 100)} %`
  }

  return (
    <>
      <h5 className="ml-12">術法開発進捗 <span className="inline-block w-16 text-right">{getProgress()}</span></h5>
      <div className="table-wrapper">
        <div className={`grid grid-rows-7 grid-flow-col gap-x-4 w-5xl mx-auto border-t-0 text-sm/loose`}>
          {tasks.map((task, i) => (
            <Fragment key={i}>
              {i % 6 === 0 && (
                <div className="flex w-48 border-t font-bold">
                  <div className="flex-3/4 ps-3">開発項目</div>
                  <div className="flex-1/4 text-center">進捗</div>
                </div>
              )}
              <div className="relative flex w-48">
                <div className="flex-3/4 ps-3">{task}</div>
                <div className="flex-1/4 text-center">{getLabel(task)}</div>
                <div className={`progress absolute top-0 left-0 ${getClass(task)} h-1/1`}></div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}

export default DevProgress
