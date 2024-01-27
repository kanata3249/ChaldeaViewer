import { ServantItemCounts, ItemPerUsage, itemNames } from './inventory'


export type ClassScoreSpec = {
  id: number
  class: number
  nodeName: string
  prevNodeName: string
  effect: {
    condition: string
    text: string
    value: string
  }
  items: {
    [id: number]: number
  }
}

export type ClassScore = {
  id: number
  nodeName: string
  acquired: boolean
  reserved: boolean

  spec: ClassScoreSpec
}

export type ClassScores = ClassScore[]

const classscoreSpecs: {
  [id: number]: ClassScoreSpec
} = require('./classscores.json')

export const generateCleanClassScore = (spec: ClassScoreSpec) => {
  return {
    id: spec.id,
    nodeName: spec.nodeName,
    acquired: false,
    reserved: false,
    spec: spec
  }
}

const generateCleanClassScores = () => {
  return Object.values(classscoreSpecs).map((spec) => 
    generateCleanClassScore(spec)
  )
}

export const validateClassScores = (classscores: ClassScores): ClassScores =>
{
  const result = generateCleanClassScores()
  if (classscores) {
    result.forEach((classscore, index) => {
      const matchedClassScores = classscores.filter((item) => item.nodeName == classscore.nodeName)
      if (matchedClassScores.length > 0) {
        result[index].acquired = matchedClassScores[0].acquired
        result[index].reserved = matchedClassScores[0].reserved
      }
    })
  }
  return result
}
