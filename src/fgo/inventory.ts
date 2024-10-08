import { Servants, Servant, Costumes } from './servants'
import { ClassScores, ClassScore } from './classscores'
import { Bgms, Bgm } from './bgms'

export type Inventory = {
  [itemId: number]: number
}

export type ItemPerUsage = {
  ascension: number
  skill: number
  appendSkill: number
  duplicated: number
  classscore: number
  dress: number
  bgm: number
}

export type ItemStatus = {
  required: ItemPerUsage
  summoned: ItemPerUsage
  reserved: ItemPerUsage
  used: ItemPerUsage
  free: number
  stock: number
}

export type InventoryStatus = {
  [itemId: number]: ItemStatus
}

type ItemCounts = {
  required: ItemPerUsage
  summoned: ItemPerUsage
  used: ItemPerUsage
  reserved: ItemPerUsage
}

export type ServantItemCounts = {
  [itemId: number]: ItemCounts
}

export const itemNames: {
  [itemId: number]: string
} = require('./itemnames.json')

export const itemName2Id = Object.entries(itemNames).reduce((acc, [key, value]: string[]) => {
  acc[value] = parseInt(key)
  return acc
},{})

export const emptyItemUsage = {
  ascension: 0,
  skill: 0,
  appendSkill: 0,
  duplicated: 0,
  classscore: 0,
  dress: 0,
  bgm: 0
}

const emptyItemStatus = {
  required: emptyItemUsage,
  summoned: emptyItemUsage,
  reserved: emptyItemUsage,
  used: emptyItemUsage,
  free: 0,
  stock: 0
}

const itemCountsTemplate = {
  required: emptyItemUsage,
  summoned: emptyItemUsage,
  used: emptyItemUsage,
  reserved: emptyItemUsage
}

const itemId2msItemId = {
  600: 100,
  601: 101,
  602: 102,
  603: 103,
  604: 104,
  605: 105,
  606: 106,

  610: 110,
  611: 111,
  612: 112,
  613: 113,
  614: 114,
  615: 115,
  616: 116,

  700: -1,
  701: -1,
  702: -1,
  703: -1,
}

export const importMSInventory = (msInventory: string): Inventory =>
{
  const ms: Inventory = JSON.parse(msInventory)

  ms[900] = (ms[900] / 10000) >> 0
  return Object.keys(itemNames).reduce((acc, itemId) => {
    acc[itemId] = ms[itemId2msItemId[itemId] || itemId]
    return acc
  }, {})
}

export const exportMSInventory = (inventory: Inventory): string =>
{
  return JSON.stringify(
    Object.keys(itemNames).reduce((acc, itemId) => {
      if (!itemId2msItemId[itemId] || itemId2msItemId[itemId] >= 0) {
        acc[itemId2msItemId[itemId] || itemId] = inventory[itemId]
      }
      return acc
    }, {"900":0}))
}

export const validateInventory = (inventory: Inventory): Inventory =>
{
  return Object.keys(itemNames).reduce((acc, itemId) => {
    acc[itemId] = (inventory ?? {})[itemId] || 0
    return acc
  }, {})
}

export const calcInventoryStatus = (inventory: Inventory, servants: Servants, classscores: ClassScores, costumes: Costumes, bgms: Bgms): InventoryStatus =>
{
  const emptyItemCounts = Object.keys(itemNames).reduce((acc, itemId) => {
    acc[itemId] = JSON.parse(JSON.stringify(itemCountsTemplate))
    return acc
  }, {})
  const totalItemCounts = servants.reduce((acc, servant) => {
    servant.itemCounts = itemsForServant(servant)
    servant.totalItemsForMax = { ...emptyItemUsage }
    Object.entries(servant.itemCounts).forEach(([itemId, itemCounts]) => {
      Object.entries(itemCounts).forEach(([type, countsPerType]) => {
        Object.entries(countsPerType).forEach(([usage, count]) => {
          acc[itemId][type][usage] += count
        })
      })
    })
    return acc
  }, emptyItemCounts)

  classscores.forEach((classscore) => {
    Object.entries(classscore.spec.items).forEach(([id, count]) => {
      totalItemCounts[id].required.classscore += count
      totalItemCounts[id].summoned.classscore += count
      if (classscore.acquired) {
        totalItemCounts[id].used.classscore += count
      } else {
        if (classscore.reserved) {
          totalItemCounts[id].reserved.classscore += count
        }
      }
    })
  })

  bgms.forEach((bgm) => {
    Object.entries(bgm.spec.items).forEach(([id, count]) => {
      totalItemCounts[id].required.bgm += count
      if (bgm.onsale) {
        totalItemCounts[id].summoned.bgm += count

        if (bgm.purchased) {
          totalItemCounts[id].used.bgm += count
        } else {
          if (bgm.reserved) {
            totalItemCounts[id].reserved.bgm += count
          }
        }
      }
    })
  })

  costumes.forEach((costume) => {
    Object.entries(costume.spec.items).forEach(([id, count]) => {
      totalItemCounts[id].required.dress += count
      if (costume.onsale && servants.find((servant) => servant.id == costume.spec.servantId).npLevel > 0) {
        totalItemCounts[id].summoned.dress += count

        if (costume.purchased) {
          totalItemCounts[id].used.dress += count
        } else {
          if (costume.reserved) {
            totalItemCounts[id].reserved.dress += count
          }
        }
      }
    })
  })

  const inventoryStatus = Object.entries<ItemCounts>(totalItemCounts).reduce((acc, [itemId, counts]) => {
    acc[itemId] = {
      required: counts.required,
      summoned: counts.summoned,
      reserved: counts.reserved,
      used: counts.used,
      free: inventory[itemId] - Object.values<number>(counts.reserved).reduce((acc, value) => acc + value),
      stock: inventory[itemId]
    }
    return acc
  }, {})

  servants.forEach((servant) => {
    if (servant.ascension < 4
       || servant.skillLevel.some((v) => v < 9)
       || servant.appendSkillLevel.some((v) => v < 9)) {
      Object.entries(servant.itemCounts).forEach(([itemId, counts]) => {
        if (Number(itemId) >= 800)
          return

        const ascension = counts.required.ascension - counts.used.ascension
        if (ascension) {
          if (counts.reserved.ascension)
            servant.totalItemsForMax.ascension += Math.max(0, ascension - Math.max(inventoryStatus[itemId].stock, 0))
          else
            servant.totalItemsForMax.ascension += Math.max(0, ascension - Math.max(inventoryStatus[itemId].free, 0))
        }

        const skill = counts.required.skill - counts.used.skill
        if (skill) {
          if (counts.reserved.skill)
            servant.totalItemsForMax.skill += Math.max(0, ascension + skill - Math.max(inventoryStatus[itemId].stock, 0))
          else
            servant.totalItemsForMax.skill += Math.max(0, ascension + skill - Math.max(inventoryStatus[itemId].free, 0))
        }

        const appendSkill = counts.required.appendSkill - counts.used.appendSkill
        if (appendSkill) {
          if (counts.reserved.appendSkill)
            servant.totalItemsForMax.appendSkill += Math.max(0, ascension + appendSkill - Math.max(inventoryStatus[itemId].stock, 0))
          else
            servant.totalItemsForMax.appendSkill += Math.max(0, ascension + appendSkill - Math.max(inventoryStatus[itemId].free, 0))
        }
      })
    }
  })

  return inventoryStatus
}

const itemsForServant = (servant: Servant) => {
  const isSummoned = servant.npLevel > 0
  const isDuplicated = servant.duplicated
  const currentAscensionLevel = servant.ascension
  const reservedAscensionLevel = servant.maxAscension
  const currentSkillLevel = servant.skillLevel
  const reservedSkillLevel = servant.maxSkillLevel
  const currentAppendSkillLevel = servant.appendSkillLevel
  const reservedAppendSkillLevel = servant.maxAppendSkillLevel

  const ascensionItems = servant.spec.items.ascension
  const skillItems = servant.spec.items.skill
  const appendSkillItems = servant.spec.items.appendSkill

  const ascensionKey = isDuplicated ? "duplicated" : "ascension"
  const skillKey = isDuplicated ? "duplicated" : "skill"
  const appendSkillKey = isDuplicated ? "duplicated" : "appendSkill"

  const servantItemCounts = {}

  ascensionItems.forEach((items, ascensionLevel) => {
    Object.entries(items).forEach(([itemId, count]) => {
      const counts = servantItemCounts[itemId] || JSON.parse(JSON.stringify(itemCountsTemplate))

      servantItemCounts[itemId] = counts
      if (!isDuplicated || reservedAscensionLevel > ascensionLevel) {
        counts.required[ascensionKey] += count
      }
      if (isSummoned) {
        if (!isDuplicated || reservedAscensionLevel > ascensionLevel) {
          counts.summoned[ascensionKey] += count
        }
        if (currentAscensionLevel > ascensionLevel) {
          counts.used[ascensionKey] += count
        } else {
          if (reservedAscensionLevel > ascensionLevel) {
            counts.reserved[ascensionKey] += count
          }
        }
      }
    })
  })

  const skillNos = [0, 1, 2]
  skillNos.forEach((skillNo) => {
    skillItems.forEach((items, skillLevel) => {
      Object.entries(items).forEach(([itemId, count]) => {
        if (Number(itemId) == 900 && skillLevel + 1 == 9) {
          return
        }
        const counts = servantItemCounts[itemId] || JSON.parse(JSON.stringify(itemCountsTemplate))

        servantItemCounts[itemId] = counts
        if (!isDuplicated || reservedSkillLevel[skillNo] > skillLevel + 1) {
          counts.required[skillKey] += count
        }
        if (isSummoned) {
          if (!isDuplicated || reservedSkillLevel[skillNo] > skillLevel + 1) {
            counts.summoned[skillKey] += count
          }
          if (currentSkillLevel[skillNo] > skillLevel + 1) {
            counts.used[skillKey] += count
          } else {
            if (reservedSkillLevel[skillNo] > skillLevel + 1) {
              counts.reserved[skillKey] += count
            }
          }
        }
      })
    })
  })

  const appendSkillNos = [0, 1, 2, 3, 4]
  appendSkillNos.forEach((skillNo) => {
    appendSkillItems.forEach((items, skillLevel) => {
      Object.entries(items).forEach(([itemId, count]) => {
        if (Number(itemId) == 900 && skillLevel + 1 == 9) {
          return
        }
        const counts = servantItemCounts[itemId] || JSON.parse(JSON.stringify(itemCountsTemplate))

        servantItemCounts[itemId] = counts
        if (!isDuplicated || reservedAppendSkillLevel[skillNo] > skillLevel + 1) {
          counts.required[appendSkillKey] += count
        }
        if (isSummoned) {
          if (!isDuplicated || reservedAppendSkillLevel[skillNo] > skillLevel + 1) {
            counts.summoned[appendSkillKey] += count
          }
          if (currentAppendSkillLevel[skillNo] > skillLevel + 1) {
            counts.used[appendSkillKey] += count
          } else {
            if (reservedAppendSkillLevel[skillNo] > skillLevel + 1) {
              counts.reserved[appendSkillKey] += count
            }
          }
        }
      })
    })
  })

  return servantItemCounts
}