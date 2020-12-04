import { ServantItemCounts, ItemPerUsage } from './inventory'
import pako from 'pako'

export type ServantSkillSpec = {
  id: number
  name: string
  type: "np" | "active" | "passive"
  effects: {
    target: string
    text: string
    grow: string
    values: string[]
  }[]
}

export type ServantSkillSpecMap = {
  [id: number]: ServantSkillSpec
}

export type ServantSkills = {
  np: number[]
  passive: number[]
  active: number[]
}

export type ServantSpec = {
  id: number
  class: number
  rare: number
  gender: string
  attributes: string
  characteristics: string
  npType: string
  skills: ServantSkills
  items: {
    ascension: {}[]
    skill: {}[]
  }
}

export type Servant = {
  id: number

  ascension: number
  maxAscension: number
  skillLevel: number[]
  maxSkillLevel: number[]

  npLevel: number
  level: number
  hpMod: number
  attackMod: number

  spec: ServantSpec
  itemCounts: ServantItemCounts
  totalItemsForMax: ItemPerUsage
}

export type Servants = Servant[]

const servantSpecs: {
  [id: number]: ServantSpec
} = JSON.parse(pako.inflate(new Uint8Array(require('./servantdata.json.gz')), { to: 'string' }))
export const servantSkills: ServantSkillSpecMap = JSON.parse(pako.inflate(new Uint8Array(require('./skills.json.gz')), { to: 'string' }))
const servantId2msId = require('./servantId2msId.json')

export const servantNames = require('./servantNames.json')
export const servantClassNames = {
  0: "剣",
  1: "弓",
  2: "槍",
  3: "騎",
  4: "術",
  5: "殺",
  6: "狂",
  7: "裁",
  8: "讐",
  9: "分",
  10: "月",
  11: "降",
  12: "盾",
}

export const attributeNames = {
  0: "天",
  1: "地",
  2: "人",
  3: "星",
  4: "獣",
}

export const skillTypeNames = {
  "np": "宝具",
  "active": "スキル",
  "passive": "クラススキル",
}

const estimatedLevelByAscensionAndRare = [
  [ 1, 25, 35, 45, 65 ],
  [ 1, 20, 30, 40, 60 ],
  [ 1, 25, 35, 45, 65 ],
  [ 1, 30, 40, 50, 70 ],
  [ 1, 40, 50, 60, 80 ],
  [ 1, 50, 60, 70, 90 ],
]

const msId2servantId = Object.keys(servantId2msId).reduce((acc, id) => {
  const msId = servantId2msId[id]
  if (msId >= 0) {
    acc[msId] = id
  }
  return acc
}, {})

const generateCleanServants = () => {
  return Object.values(servantSpecs).map((servant) => (
    { id: servant.id,
      ascension: 0, maxAscension: 4,
      skillLevel: [1, 1, 1], maxSkillLevel: [10, 10, 10],
      npLevel: 0, level: 1, hpMod: 0, attackMod: 0,
      spec: servant,
      itemCounts: {},
      totalItemsForMax: { ascension: 0, skill: 0, dress: 0, sound: 0 }
    }
  ))
}

export const importMSServants = (msServants: string): Servants =>
{
  const ms = JSON.parse(msServants)
  const servants: Servants = generateCleanServants()

  ms.forEach((msServantStatus) => {
    const [msId, ascension, maxAscension, s1, maxS1, s2, maxS2, s3, maxS3, saveFlag, alwaysZero] = msServantStatus
    const id = msId2servantId[msId] || msId

    const idx = servants.findIndex((servant) => (servant.id == id))
    if (idx >= 0) {
      servants[idx].ascension = ascension
      servants[idx].maxAscension = maxAscension
      servants[idx].skillLevel = [ s1, s2, s3 ]
      servants[idx].maxSkillLevel = [ maxS1, maxS2, maxS3 ]
      servants[idx].npLevel = 1
      servants[idx].level = estimatedLevelByAscensionAndRare[servantSpecs[id].rare][ascension]
    }
  })

  return servants
}

export const exportMSServants = (servants: Servants): string =>
{
  return JSON.stringify(
    servants.reduce((acc, servant) => {
      const msId = servantId2msId[servant.id] || servant.id
      if ((servant.npLevel > 0) && (msId >= 0)) {
        acc.push([
          msId, servant.ascension, servant.maxAscension,
          servant.skillLevel[0], servant.maxSkillLevel[0], servant.skillLevel[1], servant.maxSkillLevel[1], servant.skillLevel[2], servant.maxSkillLevel[2],
          1, 0
        ])
      }
      return acc
    }, [])
  )
}

export const validateServants = (servants: Servants): Servants =>
{
  const result = generateCleanServants()
  if (servants) {
    result.forEach((servant, index) => {
      const servantIndex = servants.findIndex((item) => (item.id == servant.id))
      if (servantIndex >= 0) {
        const { id, ascension, maxAscension, skillLevel, maxSkillLevel, npLevel, level, hpMod, attackMod } = servants[servantIndex]

        result[index] = { id, ascension, maxAscension, skillLevel, maxSkillLevel, npLevel, level, hpMod, attackMod,
                          spec: servantSpecs[servant.id],
                          totalItemsForMax: { ascension: 0, skill: 0, dress: 0, sound: 0 },
                          itemCounts: {}
                        } 
      }
      result[index].ascension = Math.max(0, Math.min(4, result[index].ascension))
      result[index].maxAscension = Math.max(result[index].ascension, Math.min(4, result[index].maxAscension))
      result[index].skillLevel.forEach((skillLevel, skillNo) => {
        result[index].skillLevel[skillNo] = Math.max(1, Math.min(10, result[index].skillLevel[skillNo]))
        result[index].maxSkillLevel[skillNo] = Math.max(result[index].skillLevel[skillNo], Math.min(10, result[index].maxSkillLevel[skillNo]))
      })
    })
  }
  return result
}
