export type ServantInfo = {
  id: number
  class: number
  rare: number
  gender: string
  attributes: string
  characteristics: string
  npType: string
  ascension: {}[]
  skill: {}[]
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

  servantInfo: ServantInfo
}

export type Servants = Servant[]

const servantData: {
  [id: number]: ServantInfo
} = require('./servantdata.json')
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
  return Object.values(servantData).map((servant) => (
    { id: servant.id,
      ascension: 0, maxAscension: 4,
      skillLevel: [1, 1, 1], maxSkillLevel: [10, 10, 10],
      npLevel: 0, level: 1, hpMod: 0, attackMod: 0,
      servantInfo: servant
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
      servants[idx].level = estimatedLevelByAscensionAndRare[servantData[id].rare][ascension]
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
  if (servants == null) {
    return generateCleanServants()
  }
  return servants.map((servant) => (
   { ...servant, servantInfo: servantData[servant.id] } 
  ))
  return servants
}
