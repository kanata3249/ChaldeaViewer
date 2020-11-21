import { Servants, Servant } from './servants'

export type Inventory = {
  [itemId: number]: number
}

export type ItemPerUsage = {
  ascension: number
  skill: number
  dress: number
  sound: number
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

export const materialNames: {
  [itemId: number]: string
} = {
  200: "剣の輝石",
  201: "弓の輝石",
  202: "槍の輝石",
  203: "騎の輝石",
  204: "術の輝石",
  205: "殺の輝石",
  206: "狂の輝石",

  210: "剣の魔石",
  211: "弓の魔石",
  212: "槍の魔石",
  213: "騎の魔石",
  214: "術の魔石",
  215: "殺の魔石",
  216: "狂の魔石",

  220: "剣の秘石",
  221: "弓の秘石",
  222: "槍の秘石",
  223: "騎の秘石",
  224: "術の秘石",
  225: "殺の秘石",
  226: "狂の秘石",

  300: "英雄の証",
  301: "凶骨",
  302: "竜の牙",
  303: "虚陰の塵",
  304: "愚者の鎖",
  305: "万死の毒針",
  306: "魔術髄液",
  307: "宵哭きの鉄杭",
  308: "励振火薬",

  400: "世界樹の種",
  401: "ゴーストランタン",
  402: "八連双晶",
  403: "蛇の宝玉",
  404: "鳳凰の羽",
  405: "無間の歯車",
  406: "禁断の頁",
  407: "ホムンクルスベピー",
  408: "隕蹄鉄",
  409: "大騎士勲章",
  410: "追憶の貝殻",
  411: "枯淡勾玉",
  412: "永遠結氷",
  413: "巨人の指輪",
  414: "オーロラ鋼",
  415: "閑古鈴",
  416: "禍罪の矢尻",
  417: "光銀の冠",
  418: "神脈霊子",

  500: "混沌の爪",
  501: "蛮神の心臓",
  502: "竜の逆鱗",
  503: "精霊根",
  504: "戦馬の幼角",
  505: "血の涙石",
  506: "黒獣脂",
  507: "封魔のランプ",
  508: "智慧のスカラベ",
  509: "原初の産毛",
  510: "呪獣胆石",
  511: "奇奇神酒",
  512: "暁光炉心",
  513: "九十九鏡",
  514: "真理の卵",
  515: "煌星のカケラ",
  516: "悠久の実",

  600: "セイバーピース",
  601: "アーチャーピース",
  602: "ランサーピース",
  603: "ライダーピース",
  604: "キャスターピース",
  605: "アサシンピース",
  606: "バーサーカーピース",

  610: "セイバーモニュメント",
  611: "アーチャーモニュメント",
  612: "ランサーモニュメント",
  613: "ライダーモニュメント",
  614: "キャスターモニュメント",
  615: "アサシンモニュメント",
  616: "バーサーカーモニュメント",

  800: "伝承結晶",
}

const emptyItemUsage = {
  ascension: 0,
  skill: 0,
  dress: 0,
  sound: 0
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

  return Object.keys(materialNames).reduce((acc, itemId) => {
    acc[itemId] = ms[itemId2msItemId[itemId] || itemId]
    return acc
  }, {})
}

export const exportMSInventory = (inventory: Inventory): string =>
{
  return JSON.stringify(
    Object.keys(materialNames).reduce((acc, itemId) => {
      acc[itemId2msItemId[itemId] || itemId] = inventory[itemId]
      return acc
    }, {}))
}

export const validateInventory = (inventory: Inventory): Inventory =>
{
  return Object.keys(materialNames).reduce((acc, itemId) => {
    acc[itemId] = (inventory ?? {})[itemId] || 0
    return acc
  }, {})
}

export const calcInventoryStatus = (inventory: Inventory, servants: Servants): InventoryStatus =>
{
  const totalItemCounts = servants.reduce((acc, servant) => {
    Object.entries(itemsForServant(servant)).forEach(([itemId, itemCounts]) => {
      acc[itemId] = acc[itemId] || JSON.parse(JSON.stringify(itemCountsTemplate))
      Object.entries(itemCounts).forEach(([type, countsPerType]) => {
        Object.entries(countsPerType).forEach(([usage, count]) => {
          acc[itemId][type][usage] += count
        })
      })
    })
    return acc
  }, {})
  return Object.entries<ItemCounts>(totalItemCounts).reduce((acc, [itemId, counts]) => {
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
}

const itemsForServant = (servant: Servant) => {
  const isSummoned = servant.npLevel > 0
  const currentAscensionLevel = servant.ascension
  const reservedAscensionLevel = servant.maxAscension
  const currentSkillLevel = servant.skillLevel
  const reservedSkillLevel = servant.maxSkillLevel

  const ascensionItems = servant.servantInfo.ascension
  const skillItems = servant.servantInfo.skill

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

  return servantItemCounts
}