// create-sample.ts

import { SampleCharacter } from "../domains/SampleCharacter"

const DEFAULT_SIZE = 64

export function createSamples(totalPoints: number = 10, size: number = DEFAULT_SIZE) {
  // 最大値・最小値指定
  totalPoints = Math.max(Math.min(totalPoints, 64), 10)
  size = Math.max(Math.min(size, DEFAULT_SIZE), 1)

  const collection: SampleCharacter[] = []
  const step = DEFAULT_SIZE / size // size より step を算出
  for (let n = 0; n < size; n++) {
    const id = n + 1
    const uid = Math.floor(n * step)
    collection.push(new SampleCharacter(id, uid, totalPoints))
  }

  return collection
}

export function createSample(id: number, totalPoints: number = 10, size: number = DEFAULT_SIZE) {
  // size から step 分を元に戻して id, uid に変換
  const uid = Math.floor((id - 1) * (DEFAULT_SIZE / size))
  return new SampleCharacter(id, uid, totalPoints)
}
