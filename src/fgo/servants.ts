import { ServantItemCounts, ItemPerUsage, itemNames, emptyItemUsage } from './inventory'
import pako from 'pako'

export type ServantSkillSpec = {
  id: number
  name: string
  condition?: string
  type: "np" | "active" | "passive" | "append"
  npType?: string
  ct?: number
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
  append: number[]
}

export type ServantSpec = {
  id: number
  class: number
  rare: number
  gender: string
  attributes: string
  characteristics: string
  hp: { min: number, max: number }
  attack: { min: number, max: number }
  npTypes: string[]
  skills: ServantSkills
  items: {
    ascension: { [id: number]: number }[]
    skill: { [id: number]: number }[]
    appendSkill: { [id: number]: number }[]
  }
}

export type Servant = {
  id: number

  ascension: number
  maxAscension: number
  skillLevel: number[]
  maxSkillLevel: number[]
  appendSkillLevel: number[]
  maxAppendSkillLevel: number[]

  npLevel: number
  level: number
  hpMod: number
  attackMod: number

  duplicated: boolean

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
  12: "詐",
  13: "獣",
  20: "盾",
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
  "append": "アペンドスキル",
}

export const estimatedLevelByAscensionAndRare = [
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

export type Costume = {
  id: number
  spec: CostumeSpec

  onsale: boolean
  reserved: boolean
  purchased: boolean
}

export type Costumes = Costume[]

type CostumeSpec = {
  id: number
  servantId: number
  name: string
  items: { [id: number]: number }
}

const costumeSpecs: {
  [id: number]: CostumeSpec
} = require('./costumes.json')

export const generateCleanServant = (spec: ServantSpec) => {
  return {
    id: spec.id,
    ascension: 0, maxAscension: 4,
    skillLevel: [1, 1, 1], maxSkillLevel: [9, 9, 9],
    appendSkillLevel: [0, 0, 0, 0, 0], maxAppendSkillLevel: [0, 0, 0, 0, 0],
    npLevel: 0, level: 1, hpMod: 0, attackMod: 0,
    duplicated: false,
    spec: spec,
    itemCounts: {},
    totalItemsForMax: JSON.parse(JSON.stringify(emptyItemUsage))
  }
}

const generateCleanServants = () => {
  return Object.values(servantSpecs).map((spec) => 
    generateCleanServant(spec)
  )
}

const generateCleanCostumes = () => {
  return Object.values(costumeSpecs).map((costumeSpec) => (
    { id: costumeSpec.id,
      spec: costumeSpec,
      onsale: true,
      reserved: false,
      purchased: false,
    }
  ))
}

export const importMSServants = (msServants: string): Servants =>
{
  const ms = JSON.parse(msServants)
  const servants: Servants = generateCleanServants()

  ms.forEach((msServantStatus) => {
    const [msId, ascension, maxAscension, s1, maxS1, s2, maxS2, s3, maxS3, saveFlag, alwaysZero,
      as1, maxAS1, as2, maxAS2, as3, maxAS3, as4, maxAS4, as5, maxAS5
    ] = msServantStatus
    const id = msId2servantId[msId] || msId

    const idx = servants.findIndex((servant) => (servant.id == id))
    if (idx >= 0) {
      servants[idx].ascension = ascension
      servants[idx].maxAscension = maxAscension
      servants[idx].skillLevel = [ s1, s2, s3 ]
      servants[idx].maxSkillLevel = [ maxS1, maxS2, maxS3 ]
      servants[idx].appendSkillLevel = [ as1, as2, as3, as4, as5 ]
      servants[idx].maxAppendSkillLevel = [ maxAS1, maxAS2, maxAS3, maxAS4, maxAS5 ]
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
      if ((servant.npLevel > 0) && !servant.duplicated && (msId >= 0)) {
        acc.push([
          msId, servant.ascension, servant.maxAscension,
          servant.skillLevel[0], servant.maxSkillLevel[0], servant.skillLevel[1], servant.maxSkillLevel[1], servant.skillLevel[2], servant.maxSkillLevel[2],
          1, 0,
          Math.max(1, servant.appendSkillLevel[0]), Math.max(1, servant.maxAppendSkillLevel[0]),
          Math.max(1, servant.appendSkillLevel[1]), Math.max(1, servant.maxAppendSkillLevel[1]),
          Math.max(1, servant.appendSkillLevel[2]), Math.max(1, servant.maxAppendSkillLevel[2]),
          Math.max(1, servant.appendSkillLevel[3]), Math.max(1, servant.maxAppendSkillLevel[3]),
          Math.max(1, servant.appendSkillLevel[4]), Math.max(1, servant.maxAppendSkillLevel[4]),
        ])
      }
      return acc
    }, [])
  )
}

const validateServant = (servant: Servant) => {
  const { id, ascension, maxAscension, skillLevel, maxSkillLevel, appendSkillLevel, maxAppendSkillLevel, npLevel, level, hpMod, attackMod } = servant

  const result = {
      id, ascension, maxAscension, skillLevel, maxSkillLevel,
      appendSkillLevel: [ ...appendSkillLevel, 0, 0, 0, 0, 0 ].slice(0, 5), maxAppendSkillLevel: [ ...maxAppendSkillLevel, 0, 0, 0, 0, 0 ].slice(0, 5),
      npLevel, level, hpMod, attackMod,
      duplicated: false,
      spec: servantSpecs[servant.id],
      totalItemsForMax: JSON.parse(JSON.stringify(emptyItemUsage)),
      itemCounts: {}
    } 

  result.ascension = Math.max(0, Math.min(4, result.ascension))
  result.maxAscension = Math.max(result.ascension, Math.min(4, result.maxAscension))
  result.skillLevel.forEach((skillLevel, skillNo) => {
    result.skillLevel[skillNo] = Math.max(1, Math.min(10, result.skillLevel[skillNo]))
    result.maxSkillLevel[skillNo] = Math.max(result.skillLevel[skillNo], Math.min(10, result.maxSkillLevel[skillNo]))
  })

  return result
}

export const validateServants = (servants: Servants): Servants =>
{
  const result = generateCleanServants()
  const duplicatedResult = []
  if (servants) {
    result.forEach((servant, index) => {
      const matchedServants = servants.filter((item) => item.id == servant.id).sort((a, b) => b.level - a.level)
      if (matchedServants.length > 0) {
        result[index] = validateServant(matchedServants[0])
        matchedServants.slice(1).forEach((dupServant) => {
          duplicatedResult.push({ ...validateServant(dupServant), duplicated: true })
        })
      }
    })
  }
  return [ ...result, ...duplicatedResult ]
}


export const validateCostumes = (costumes: Costumes): Costumes =>
{
  const result = generateCleanCostumes()
  if (costumes) {
    result.forEach((resultCostume, index) => {
      const costumeIndex = costumes.findIndex((item) => (item.id == resultCostume.id))
      if (costumeIndex >= 0) {
        result[index].onsale = costumes[costumeIndex].onsale
        result[index].reserved = costumes[costumeIndex].reserved
        result[index].purchased = costumes[costumeIndex].purchased
      }
    })
  }
  return result
}


export const calcServantAttack = (spec: ServantSpec, level: number) =>
{
  const maxLevel = estimatedLevelByAscensionAndRare[spec.rare][4]

  if (level <= maxLevel) {
    return spec.attack.max
  }

  const levelMod = (((level - 1) / (maxLevel - 1)) * 1000 >> 0) / 1000
  return (spec.attack.min + (spec.attack.max - spec.attack.min) * levelMod) >> 0
}

export const calcServantHP = (spec: ServantSpec, level: number) =>
{
  const maxLevel = estimatedLevelByAscensionAndRare[spec.rare][4]

  if (level <= maxLevel) {
    return spec.hp.max
  }

  const levelMod = (((level - 1) / (maxLevel - 1)) * 1000 >> 0) / 1000
  return (spec.hp.min + (spec.hp.max - spec.hp.min) * levelMod) >> 0
}