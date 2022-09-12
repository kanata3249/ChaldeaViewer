import { Servants, Servant, Costumes } from './servants'
import { Bgms, Bgm } from './bgms'

export type Inventory = {
  [itemId: number]: number
}

export type ItemPerUsage = {
  ascension: number
  skill: number
  appendSkill: number
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

const emptyItemUsage = {
  ascension: 0,
  skill: 0,
  appendSkill: 0,
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
      acc[itemId2msItemId[itemId] || itemId] = inventory[itemId]
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

export const calcInventoryStatus = (inventory: Inventory, servants: Servants, costumes: Costumes, bgms: Bgms): InventoryStatus =>
{
  const totalItemCounts = servants.reduce((acc, servant) => {
    servant.itemCounts = itemsForServant(servant)
    servant.totalItemsForMax = { ...emptyItemUsage }
    Object.entries(servant.itemCounts).forEach(([itemId, itemCounts]) => {
      acc[itemId] = acc[itemId] || JSON.parse(JSON.stringify(itemCountsTemplate))
      Object.entries(itemCounts).forEach(([type, countsPerType]) => {
        Object.entries(countsPerType).forEach(([usage, count]) => {
          acc[itemId][type][usage] += count
        })
      })
    })
    return acc
  }, {})

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
       || servant.skillLevel[0] < 9 || servant.skillLevel[1] < 9 || servant.skillLevel[2] < 9
       || servant.appendSkillLevel[0] < 9 || servant.appendSkillLevel[1] < 9 || servant.appendSkillLevel[2] < 9) {
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
  const currentAscensionLevel = servant.ascension
  const reservedAscensionLevel = servant.maxAscension
  const currentSkillLevel = servant.skillLevel
  const reservedSkillLevel = servant.maxSkillLevel
  const currentAppendSkillLevel = servant.appendSkillLevel
  const reservedAppendSkillLevel = servant.maxAppendSkillLevel

  const ascensionItems = servant.spec.items.ascension
  const skillItems = servant.spec.items.skill
  const appendSkillItems = servant.spec.items.appendSkill

  const servantItemCounts = {}

  ascensionItems.forEach((items, ascensionLevel) => {
    Object.entries(items).forEach(([itemId, count]) => {
      const counts = servantItemCounts[itemId] || JSON.parse(JSON.stringify(itemCountsTemplate))

      servantItemCounts[itemId] = counts
      counts.required.ascension += count
      if (isSummoned) {
        counts.summoned.ascension += count
        if (currentAscensionLevel > ascensionLevel) {
          counts.used.ascension += count
        } else {
          if (reservedAscensionLevel > ascensionLevel) {
            counts.reserved.ascension += count
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
        counts.required.skill += count
        if (isSummoned) {
          counts.summoned.skill += count
          if (currentSkillLevel[skillNo] > skillLevel + 1) {
            counts.used.skill += count
          } else {
            if (reservedSkillLevel[skillNo] > skillLevel + 1) {
              counts.reserved.skill += count
            }
          }
        }
      })
    })
  })

  skillNos.forEach((skillNo) => {
    appendSkillItems.forEach((items, skillLevel) => {
      Object.entries(items).forEach(([itemId, count]) => {
        if (Number(itemId) == 900 && skillLevel + 1 == 9) {
          return
        }
        const counts = servantItemCounts[itemId] || JSON.parse(JSON.stringify(itemCountsTemplate))

        servantItemCounts[itemId] = counts
        counts.required.appendSkill += count
        if (isSummoned) {
          counts.summoned.appendSkill += count
          if (currentAppendSkillLevel[skillNo] > skillLevel + 1) {
            counts.used.appendSkill += count
          } else {
            if (reservedAppendSkillLevel[skillNo] > skillLevel + 1) {
              counts.reserved.appendSkill += count
            }
          }
        }
      })
    })
  })

  return servantItemCounts
}