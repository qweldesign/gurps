// create-sample.ts

import { SampleCharacter } from "../domains/SampleCharacter"

export function createSamples(totalPoints: number = 10, size: number = 96) {
  // 最大値指定
  totalPoints = Math.min(totalPoints, 40)
  size = Math.min(size, 96)

  const collection: SampleCharacter[] = []
  const step = 96 / size // size より step を算出
  for (let n = 0; n < size; n++) {
    const id = n + 1
    const uid = Math.floor(n * step)
    collection.push(new SampleCharacter(id, uid, totalPoints))
  }

  return collection
}

export function createSample(id: number, totalPoints: number = 10, size: number = 96) {
  // size から step 分を元に戻して id, uid に変換
  const uid = Math.floor((id - 1) * (96 / size))
  return new SampleCharacter(id, uid, totalPoints)
}
