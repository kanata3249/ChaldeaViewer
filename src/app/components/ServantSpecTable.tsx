import React, { FC, useState, useEffect, useRef } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { isAndroid } from 'react-device-detect'

import { Grid, Button, TextField } from '@material-ui/core'
import { VariableSizeGrid } from 'react-window'

import { Servants, Servant, servantNames, servantClassNames, attributeNames, servantSkills, skillTypeNames } from '../../fgo/servants'
import { InventoryStatus } from '../../fgo/inventory'

import { PopoverCell } from './PopoverCell'
import { DialogProviderContext } from './DialogProvider'
import { FilterDefinition, FilterValues } from './FilterDialog'
import { saveFilter, loadFilter } from '../storage'

type Prop = {
  servants: Servants
  onChange(servants: Servants): void
  getInventoryStatus(): InventoryStatus
}

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: number
  span?: number
  editable?: boolean
  type?: "number" | "string"
  max?: number
  button?: boolean
  buttonLabel?: string
  popover?: boolean
}

type ServantSpecTableData = {
  id: number
  index: number
  name: string
  servant: Servant
  buffSkill: {
    attackBuff: FindSkillResult
    busterBuff: FindSkillResult
    artsBuff: FindSkillResult
    quickBuff: FindSkillResult
    npBuff: FindSkillResult
    npCharge: FindSkillResult
  }
}

type FindSkillResult = {
  id: number
  name: string
  effect: string
  effectIndex: number
  sort: string
}

const findSkill = (servant: Servant, effectText: string, option = {} ): FindSkillResult => {
  const { type, target } = { type: "active,np", target: "(全体|単体)", ...option }
  const result: FindSkillResult = {
    id: 0,
    effectIndex: -1,
    name: "",
    effect: "",
    sort: ""
  }

  if (type.match("active")) {
    servant.spec.skills.active.some((skillId) => {
      const skillSpec = servantSkills[skillId]

      return skillSpec.effects.some((effect, effectIndex) => {
        if (effect.text.match(effectText)) {
          if (effect.target.match(target)) {
            result.id = skillId
            result.effectIndex = effectIndex
            return true
          }
        }
        return false
      })
    })
  }

  if (type.match("np")) {
    if (result.id == 0) {
      servant.spec.skills.np.some((skillId) => {
        const skillSpec = servantSkills[skillId]

        return skillSpec.effects.some((effect, effectIndex) => {
          if (effect.text.match(effectText)) {
            if (effect.target.match(target)) {
              result.id = skillId
              result.effectIndex = effectIndex
              return true
            }
          }
          return false
        })
      })
    }
  }

  if (result.id > 0) {
    const skillSpec = servantSkills[result.id]
    const effect = skillSpec.effects[result.effectIndex]
    const min = effect.values[0]
    const max = skillSpec.type == "np" ? effect.values[4] : effect.values[9]

    const prefix = effect.target.match(/単体/) ? "単 " : skillSpec.type == "np" ? "宝 " : ""
    result.name = skillSpec.name
    if (min != max)
      result.effect = prefix + min + "～" + max + " " + effect.text.replace(/^.*(\(.*)$/, "$1").replace(/NP増加/,"")
    else
      result.effect = prefix + min + " " + effect.text.replace(/^.*(\(.*)$/, "$1").replace(/NP増加/,"")
    result.sort = ((Number.parseFloat(min) * 100) >> 0).toString().padStart(8, "0")
  }

  return result
}

const parseSkillLevel = (text: string) => {
  const result = [ 0, 0, 0 ]

  const values = text.match(/(\d+)\s*\/(\d+)\s*\/(\d+)/) || [ "", "", "", "" ]
  if (values[0].length) {
    result[0] = Number.parseInt(values[1])
    result[1] = Number.parseInt(values[2])
    result[2] = Number.parseInt(values[3])
  } else {
    let value = Number.parseInt(text)
    if (value >= 111 && value <= 101010) {
      if ((value % 10) != 0) {
        result[2] = value % 10
        value = (value / 10) >> 0
      } else {
        result[2] = value % 100
        value = (value / 100) >> 0
      }
      if ((value % 10) != 0) {
        result[1] = value % 10
        value = (value / 10) >> 0
      } else {
        result[1] = value % 100
        value = (value / 100) >> 0
      }
      result[0] = value
    }
  }
  result.forEach((value, index) => {
    if (value > 10 || value < 1)
      result[index] = 0
  })
  return result
}

const columns : TableColumnInfo[] = [
  { label: 'ID', key: 'id', align: "center", width: 80},
  { label: '名称', key: 'name', align: "left", width: 240},
  { label: 'クラス', key: 'class', align: "center", width: 80},
  { label: '特性', key: 'characteristics', align: "left", width: 400},
  { label: '宝具タイプ', key: 'npType', align: "center", width: 80},
  { label: '宝具Lv', key: 'npLevel', align: "center", width: 80 },
  { label: '攻up付与', key: 'attackBuff', align: "left", width: 120, popover: true },
  { label: 'B up付与', key: 'busterBuff', align: "left", width: 120, popover: true },
  { label: 'A up付与', key: 'artsBuff', align: "left", width: 120, popover: true },
  { label: 'Q up付与', key: 'quickBuff', align: "left", width: 120, popover: true },
  { label: '宝up付与', key: 'npBuff', align: "left", width: 120, popover: true },
  { label: '特攻付与', key: 'specialAttack', align: "left", width: 120, popover: true },
  { label: 'NP付与', key: 'npCharge', align: "left", width: 120, popover: true },
  { label: 'スキル', key: 'skills', align: "center", width: 80, button: true, buttonLabel: "表示" },
]

type getTableDataOption = {
  sort?: boolean
  popover?: boolean
}

const getTableData = (servantTableData: ServantSpecTableData, columnIndex: number, option: getTableDataOption = { sort: false, popover: false }) => {
  const key = columns[columnIndex].key
  const row = servantTableData

  switch (key) {
    case 'name':
      return row[key]
    case 'skillLevel':
    case 'maxSkillLevel':
      if (option.sort)
        return row.servant[key].reduce((acc, level) => acc * level)
      return `${row.servant[key][0]}/${row.servant[key][1]}/${row.servant[key][2]}`
    case 'class':
      if (option.sort)
        return row.servant.spec[key]
      return servantClassNames[row.servant.spec[key]]
    case 'attributes':
      if (option.sort)
        return row.servant.spec[key]
      return attributeNames[row.servant.spec[key]]
    case 'rare':
    case 'gender':
      return row.servant.spec[key]
    case 'npType':
        return row.servant.spec.npTypes.join(' / ')
    case 'characteristics':
      if (row.servant.spec.gender != "-")
        return attributeNames[row.servant.spec.attributes] + " " + row.servant.spec.gender + " " + row.servant.spec[key]
      return attributeNames[row.servant.spec.attributes] + " " + row.servant.spec[key]
    case 'leveling':
      if ((row.servant.npLevel > 0)
          && (row.servant.ascension < row.servant.maxAscension || row.servant.skillLevel[0] < row.servant.maxSkillLevel[0]
              || row.servant.skillLevel[1] < row.servant.maxSkillLevel[1] || row.servant.skillLevel[2] < row.servant.maxSkillLevel[2]))
        return "育成中"
      return ""
    case 'items':
      if (row.servant.ascension < 4 || row.servant.skillLevel[0] < 9 || row.servant.skillLevel[1] < 9 || row.servant.skillLevel[2] < 9) {
        return Object.values(row.servant.totalItemsForMax).reduce((acc, value) => acc + value)
      } else {
        return ""
      }
    case 'attackBuff':
    case 'busterBuff':
    case 'artsBuff':
    case 'quickBuff':
    case 'npBuff':
    case 'npCharge':
    case 'specialAttack':
      return row.buffSkill[key][option.sort ? "sort" : option.popover ? "id" : "effect"]
    case 'skills':
      return ""
    default:
      return row.servant[key]
  }
}

const setTableData = (servantTableData: ServantSpecTableData, columnIndex: number, value: string) => {
  const key = columns[columnIndex].key
  const row = servantTableData

  switch (key) {
    case 'level':
      row.servant[key] = Number.parseInt(value) || 1
      break
    case 'npLevel':
    case 'hpMod':
    case 'attackMod':
    case 'ascension':
    case 'maxAscension':
      row.servant[key] = Number.parseInt(value) || 0
      break
    case 'skillLevel':
    case 'maxSkillLevel':
      const values = parseSkillLevel(value)
      if (values && values[0])
        row.servant[key] = values
      break
  }
}

const filterDefinition: FilterDefinition[] = [
  {
    name: "クラス", key: "class", type: "check",
    buttons: [
      { label: "セイバー", key: "剣" },
      { label: "アーチャー", key: "弓" },
      { label: "ランサー", key: "槍" },
      { label: "ライダー", key: "騎" },
      { label: "キャスター", key: "術" },
      { label: "アサシン", key: "殺" },
      { label: "バーサーカー", key: "狂" },
      { label: "ルーラー", key: "裁" },
      { label: "アヴェンジャー", key: "讐" },
      { label: "アルターエゴ", key: "分" },
      { label: "ムーンキャンサー", key: "月" },
      { label: "フォーリナー", key: "降" },
      { label: "プリテンダー", key: "詐" },
      { label: 'シールダー', key: "盾" },
    ]
  },
  {
    name: "性別", key: "gender", type: "check",
    buttons: [
      { label: "女", key: '女' },
      { label: "男", key: '男' },
      { label: "その他", key: '-' },
    ]
  },
  {
    name: "天地人", key: "attributes", type: "check",
    buttons: [
      { label: "天", key: "0" },
      { label: "地", key: "1" },
      { label: "人", key: "2" },
      { label: "星", key: "3" },
      { label: "獣", key: "4" },
    ]
  },
  {
    name: "方針", key: "policy", type: "check",
    buttons: [
      { label: "秩序", key: "秩序" },
      { label: "中立", key: "中立" },
      { label: "混沌", key: "混沌" },
    ]
  },
  {
    name: "性格", key: "personality", type: "check",
    buttons: [
      { label: "善", key: "善" },
      { label: "中庸", key: "中庸" },
      { label: "悪", key: "悪" },
      { label: "狂", key: "狂" },
      { label: "夏", key: "夏" },
      { label: "花嫁", key: "花嫁" },
    ]
  },
  {
    name: "宝具レベル", key: "npLevel", type: "check",
    buttons: [
      { label: "未召喚", key: "0" },
      { label: "1", key: "1" },
      { label: "2", key: "2" },
      { label: "3", key: "3" },
      { label: "4", key: "4" },
      { label: "5", key: "5" },
    ]
  },
  {
    name: "宝具タイプ", key: "npType", type: "check",
    buttons: [
      { label: "バスター", key: "B" },
      { label: "アーツ", key: "A" },
      { label: "クィック", key: "Q" },
    ]
  },
  {
    name: "宝具効果", key: "npEffect", type: "check",
    buttons: [
      { label: "全体攻撃", key: "全体" },
      { label: "単体攻撃", key: "単体" },
      { label: "補助", key: "補助" },
    ]
  },
]

const defaultFilterValues: FilterValues = Object.values(filterDefinition).reduce((acc, group) => {
  acc[group.key] = group.buttons.reduce((acc, button) => {
      acc[button.key] = true
      return acc
    },{})
    return acc
  },{}
)

const validateFilter = (values: FilterValues): FilterValues => {
  return Object.values(filterDefinition).reduce((acc, group) => {
    acc[group.key] = group.buttons.reduce((acc, button) => {
      acc[button.key] = defaultFilterValues[group.key][button.key]
      if (values && values[group.key])
        acc[button.key] = values[group.key][button.key]
      return acc
    },{})
    return acc
  },{})
}

const skillFilterDefinition: FilterDefinition[] = [
  {
    name: "スキル効果", key: "active", type: "check",
    buttons: [
      { label: "攻撃力アップ付与", key: "攻撃力アップ" },
      { label: "Bバフ付与", key: "Busterカード性能アップ" },
      { label: "Aバフ付与", key: "Artsカード性能アップ" },
      { label: "Qバフ付与", key: "Quickカード性能アップ" },
      { label: "宝具威力アップ付与", key: "宝具威力アップ" },
      { label: "特攻付与", key: "〔(?!Arts).*〕威力アップ" },
      { label: "特攻", key: "〔(?!Arts).*〕威力アップ,自身" },
      { label: "NP付与", key: "(NP増加|NP獲得\\()" },
      { label: "強化解除", key: "強化〕状態を解除" },
      { label: "弱体解除", key: "弱体〕状態を解除" },
      { label: "強化解除耐性", key: "強化解除耐性" },
      { label: "弱体耐性", key: "弱体耐性アップ" },
      { label: "弱体無効", key: "弱体無効" },
    ]
  },
  {
    name: "宝具効果", key: "np", type: "check",
    buttons: [
      { label: "攻撃力アップ付与", key: "攻撃力アップ" },
      { label: "Bバフ付与", key: "Busterカード性能アップ" },
      { label: "Aバフ付与", key: "Artsカード性能アップ" },
      { label: "Qバフ付与", key: "Quickカード性能アップ" },
      { label: "宝具威力アップ付与", key: "宝具威力アップ" },
      { label: "特攻", key: "特攻宝具攻撃" },
      { label: "NP付与", key: "(NP増加|NP獲得\\()" },
      { label: "強化解除", key: "強化〕状態を解除" },
      { label: "弱体解除", key: "弱体〕状態を解除" },
      { label: "強化解除耐性", key: "強化解除耐性" },
      { label: "弱体耐性", key: "弱体耐性アップ" },
      { label: "弱体無効", key: "弱体無効" },
    ]
  },
  {
    name: "宝具タイプ", key: "npType", type: "check",
    buttons: [
      { label: "B 全体", key: "B 全体" },
      { label: "B 単体", key: "B 単体" },
      { label: "B 補助", key: "B 補助" },
      { label: "A 全体", key: "A 全体" },
      { label: "A 単体", key: "A 単体" },
      { label: "A 補助", key: "A 補助" },
      { label: "Q 全体", key: "Q 全体" },
      { label: "Q 単体", key: "Q 単体" },
      { label: "Q 補助", key: "Q 補助" },
    ]
  },
  {
    name: "アペンドスキル攻撃適性", key: "appendSkill", type: "check",
    buttons: [
      { label: "セイバー攻撃適性", key: "セイバー攻撃適性" },
      { label: "アーチャー攻撃適性", key: "アーチャー攻撃適性" },
      { label: "ランサー攻撃適性", key: "ランサー攻撃適性" },
      { label: "ライダー攻撃適性", key: "ライダー攻撃適性" },
      { label: "キャスター攻撃適性", key: "キャスター攻撃適性" },
      { label: "アサシン攻撃適性", key: "アサシン攻撃適性" },
      { label: "バーサーカー攻撃適性", key: "バーサーカー攻撃適性" },
      { label: "ルーラー攻撃適性", key: "ルーラー攻撃適性" },
      { label: "アヴェンジャー攻撃適性", key: "アヴェンジャー攻撃適性" },
      { label: "アルターエゴ攻撃適性", key: "アルターエゴ攻撃適性" },
      { label: "ムーンキャンサー攻撃適性", key: "ムーンキャンサー攻撃適性" },
      { label: "フォーリナー攻撃適性", key: "フォーリナー攻撃適性" },
      { label: "プリテンダー攻撃適性", key: "プリテンダー攻撃適性" },
    ]
  },
]

const defaultSkillFilterValues: FilterValues = Object.values(skillFilterDefinition).reduce((acc, group) => {
  acc[group.key] = group.buttons.reduce((acc, button) => {
      acc[button.key] = false
      return acc
    },{})
    return acc
  },{}
)

const validateSkillFilter = (values: FilterValues): FilterValues => {
  return Object.values(skillFilterDefinition).reduce((acc, group) => {
    acc[group.key] = group.buttons.reduce((acc, button) => {
      acc[button.key] = defaultSkillFilterValues[group.key][button.key]
      if (values && values[group.key])
        acc[button.key] = values[group.key][button.key]
      return acc
    },{})
    return acc
  },{})
}

const charFilterDefinition: FilterDefinition[] = [
  {
    name: "特性", key: "characteristics", type: "check",
    buttons: [
      { label: "愛する者", key: "愛する者" },
      { label: "アルゴノーツ", key: "アルゴノーツ" },
      { label: "アルトリア顔", key: "アルトリア顔" },
      { label: "アーサー", key: "アーサー" },
      { label: "今を生きる人類", key: "今を生きる人類" },
      { label: "イリヤ", key: "イリヤ" },
      { label: "円卓", key: "円卓" },
      { label: "王", key: "王" },
      { label: "鬼", key: "鬼" },
      { label: "機械", key: "機械" },
      { label: "ギリシャ男", key: "ギリシャ男" },
      { label: "巨人", key: "巨人" },
      { label: "源氏", key: "源氏" },
      { label: "子供", key: "子供" },
      { label: "神性", key: "神性" },
      { label: "神霊", key: "神霊" },
      { label: "人類の脅威", key: "人類の脅威" },
      { label: "超巨大", key: "超巨大" },
      { label: "童話", key: "童話" },
      { label: "信長", key: "信長" },
      { label: "魔性", key: "魔性" },
      { label: "猛獣", key: "猛獣" },
      { label: "妖精", key: "妖精" },
      { label: "竜", key: "竜" },
      { label: "領域外の生命", key: "領域外の生命" },
      { label: "ローマ", key: "ローマ" },
    ]
  },
]

const defaultCharFilterValues: FilterValues = Object.values(charFilterDefinition).reduce((acc, group) => {
  acc[group.key] = group.buttons.reduce((acc, button) => {
      acc[button.key] = false
      return acc
    },{})
    return acc
  },{}
)

const validateCharFilter = (values: FilterValues): FilterValues => {
  return Object.values(charFilterDefinition).reduce((acc, group) => {
    acc[group.key] = group.buttons.reduce((acc, button) => {
      acc[button.key] = defaultCharFilterValues[group.key][button.key]
      if (values && values[group.key])
        acc[button.key] = values[group.key][button.key]
      return acc
    },{})
    return acc
  },{})
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    container: {
      height: "100%"
    },
    summary: {
      flexGrow: 1
    },
    controller: {
      width: "100%",
      height: 48,
      paddingRight: 8,
      paddingLeft: 8
    },
    head: {
      padding: 4,
      paddingTop: 8
    },
    oddRowCell: {
      backgroundColor: theme.palette.action.hover,
      whiteSpace: "nowrap",
      scrollbarWidth: "none",
      overflow: "hidden",
      padding: 4
    },
    evenRowCell: {
      whiteSpace: "nowrap",
      scrollbarWidth: "none",
      overflow: "hidden",
      padding: 4
    },
    skillDescription: {
      paddingLeft: 8,
      fontSize: "smaller"
    }
  })
)

const calcServantTableData = (servants: Servants): ServantSpecTableData[] => {
  return servants.map((servant, index) => (
    { id: servant.id, name: servantNames[servant.id], index, servant: servant,
      buffSkill: {
        attackBuff: findSkill(servant, "攻撃力アップ"),
        busterBuff: findSkill(servant, "Busterカード性能アップ"),
        artsBuff: findSkill(servant, "Artsカード性能アップ"),
        quickBuff: findSkill(servant, "Quickカード性能アップ"),
        npBuff: findSkill(servant, "宝具威力アップ"),
        npCharge: findSkill(servant, "(NP増加|NP獲得\\()"),
        specialAttack: findSkill(servant, "〔(?!Arts).*〕威力アップ")
      }
    } 
  ))
}

const filterAndSort = (servantTableData: ServantSpecTableData[], filters: FilterValues, skillFilters: FilterValues, charFilters: FilterValues,
                       sortColumn: number, sortOrder: number) => {
  const isSkillFilterUsed = Object.values(skillFilters).some((group) => Object.values(group).some((value) => value))
  const isCharFilterUsed = Object.values(charFilters).some((group) => Object.values(group).some((value) => value))
  const preSortkey = (row) => ((sortOrder > 0 ? 100 - row.servant.spec.class : row.servant.spec.class) * 10000 + (10 - row.servant.spec.rare) * 1000 + (1000 - row.id))

  return servantTableData.sort((a, b) => {
    return preSortkey(a) - preSortkey(b)
  }).filter((row) => {
    return Object.entries(filters).every(([groupKey, groupValues]) => {
      switch(groupKey) {
        case "class":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (servantClassNames[row.servant.spec.class] == filterKey)
          })
        case "rare":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.spec.rare == Number.parseInt(filterKey))
          })
        case "gender":
        case "attributes":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.spec[groupKey] == filterKey)
          })
        case "policy":
        case "personality":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.spec.characteristics.match(filterKey))
          })
        case "npType":
        case "npEffect":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.spec.npTypes.some((npType) => npType.match(filterKey)))
          })
        case "npLevel":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant[groupKey] == Number.parseInt(filterKey))
          })
        default:
          return true
      }
    })
  }).filter((row) => {
    if (!isSkillFilterUsed)
      return true
    return Object.entries(skillFilters).some(([groupKey, groupValues]) => {
      switch(groupKey) {
        case "active":
        case "np":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            const findOption: { type: string, target?: string } = { type: groupKey }
            const [ filter, target ] = filterKey.split(",")
            if (target)
              findOption.target = target
            return enabled && (findSkill(row.servant, filter, findOption ).id > 0)
          })
        case "npType":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.spec.npTypes.some((npType) => npType.match(filterKey)))
          })
        case "appendSkill":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (servantSkills[row.servant.spec.skills.append[2]].name.match(filterKey))
          })
        default:
          return false
      }
    })
  }).filter((row) => {
    if (!isCharFilterUsed)
      return true
    return Object.entries(charFilters).some(([groupKey, groupValues]) => {
      switch(groupKey) {
        case "characteristics":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.spec[groupKey].match(filterKey))
          })
        default:
          return false
      }
    })
  }).sort((a, b) => {
    let aValue = getTableData(a, sortColumn, { sort: true } )
    let bValue = getTableData(b, sortColumn, { sort: true } )

    if (aValue === "")
      aValue = (99999999 * sortOrder).toString()
    if (bValue === "")
      bValue = (99999999 * sortOrder).toString()
    if (aValue == bValue)
      return 0
    if (bValue > aValue)
      return -sortOrder
    else
      return sortOrder
  })
}

export const ServantSpecTable: FC<Prop> = (props) => {
  const classes = useStyles()
  const myRef = useRef<HTMLDivElement>()
  const headerRef = useRef<VariableSizeGrid>()
  const [ sortBy, setSortBy ] = useState(0)
  const [ sortOrder, setSortOrder ] = useState(1)
  const [ filterValues, setFilterValues ] = useState<FilterValues>(validateFilter(loadFilter("ServantSpecTable")))
  const [ skillFilterValues, setSkillFilterValues ] = useState<FilterValues>(validateSkillFilter(loadFilter("ServantSpecTable/skill")))
  const [ charFilterValues, setCharFilterValues ] = useState<FilterValues>(validateCharFilter(loadFilter("ServantSpecTable/char")))
  const [ tableSize, setTableSize ] = useState([1000, 800])
  const tableData = filterAndSort(calcServantTableData(props.servants), filterValues, skillFilterValues, charFilterValues, sortBy, sortOrder)

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      const height = entries[0].contentRect.height - 48
      if (!(isAndroid && document.activeElement.nodeName == 'INPUT')) {
        setTableSize([width, height])
      }
    })

    myRef.current && resizeObserver.observe(myRef.current.parentElement)

    return (): void => {
      resizeObserver.disconnect();
    }
  }, [])

  const handleClickColumn = (column: number) => {
    if (sortBy == column) {
      setSortOrder(-sortOrder)
    } else {
      setSortOrder(-1)
      setSortBy(column)
    }
  }

  const handleLostFocus = (rowIndex: number, columnIndex: number, e: React.FocusEvent<HTMLInputElement>) => {
    const row = tableData[rowIndex]
    if (getTableData(row, columnIndex) != e.target.value) {
      setTableData(row, columnIndex, e.target.value)
      e.target.value = getTableData(row, columnIndex)
      props.servants[row.index] = row.servant
      props.onChange(props.servants)
    }
  }

  const handleCloseFilter = (newFilterValues: FilterValues) => {
    setFilterValues(newFilterValues)
    saveFilter("ServantSpecTable", newFilterValues)
  }

  const handleCloseSkillFilter = (newFilterValues: FilterValues) => {
    setSkillFilterValues(newFilterValues)
    saveFilter("ServantSpecTable/skill", newFilterValues)
  }

  const handleCloseCharFilter = (newFilterValues: FilterValues) => {
    setCharFilterValues(newFilterValues)
    saveFilter("ServantSpecTable/char", newFilterValues)
  }

  const handleClickClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    const lines: string[] = []

    lines.push(columns.reduce((acc, column) => (acc + "\t" + column.label),""))
    tableData.forEach((data) => {
      lines.push(columns.reduce((acc, column, columnIndex) => (acc + "\t\"" + getTableData(data, columnIndex)) + "\"",""))
    })

    navigator.clipboard?.writeText(lines.reduce((acc, line) => (acc + line.slice(1) + '\n'),""))
  }

  const skill = (skillId: number) => {
    if (skillId == 0) {
      return <></>
    }
    const skill = servantSkills[skillId]
    return (
      <Grid container direction="column" >
        <Grid item>
          {skill.name + " - " + skillTypeNames[skill.type]}
        </Grid>
        <Grid item className={classes.skillDescription} >
          <table>
            <tbody>
              {skill.effects.map((effect, index) => {
                switch (skill.type) {
                case "np":
                  return (<tr key={index}><td colSpan={11} >{`${effect.target[index]} ${effect.text}`}</td></tr>)
                case "passive":
                  return (<tr key={index}><td colSpan={11} >{`${effect.text} ${effect.values[index]}`}</td></tr>)
                case "active":
                  if (effect.values[0] != effect.values[9])
                    return (<tr key={index}><td colSpan={11} >{`${effect.target} ${effect.text} ${effect.values[0]}～${effect.values[9]}`}</td></tr>)
                  else
                    return (<tr key={index}><td colSpan={11} >{`${effect.target} ${effect.text} ${effect.values[0]}`}</td></tr>)
                }
              })}
              {skill.type == "np" && (<tr><th></th><th></th>{skill.effects[0].values.map((value, index) => (<th key={index}>{index + 1}</th>))}</tr>)}
              {skill.type == "np" && skill.effects.map((effect, index) => (
                <tr key={index}><td></td>{skill.type == "np" && (<td>{effect.grow}</td>)}
                  {effect.values.map((value, index) => (
                    <td key={index}>{typeof value == "string" ? value.replace(/rate:/,"") : value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Grid>
      </Grid>
    )
}

  const headerCell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]

    return (
      <div style={{...style, textAlign: column.align}} className={classes.head} onClick={() => handleClickColumn(columnIndex)}>
        {(sortBy == columnIndex) ? ((sortOrder == 1) ? column.label + "▲" : column.label + "▼") : column.label}
      </div>
    )
  }

  const cell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]
    const cellData = getTableData(tableData[rowIndex], columnIndex)

    return (
      <div style={{...style, textAlign: column.align}} className={rowIndex % 2 ? classes.oddRowCell : classes.evenRowCell}>
        {column.editable && (
          column.type == "number" ?
          <TextField defaultValue={cellData} size="small"
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {handleLostFocus(rowIndex, columnIndex, e)}}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}}
                    type={column.type} InputProps={{ disableUnderline: true }}
                    inputProps={{min: 0, max: column.max, style: { textAlign: column.align, paddingTop: 2, paddingBottom: 0, fontSize: "0.875rem" }}} />
          : <TextField defaultValue={cellData} size="small"
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {handleLostFocus(rowIndex, columnIndex, e)}}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}}
                    type={column.type} InputProps={{ disableUnderline: true }}
                    inputProps={{ style: { textAlign: column.align, paddingTop: 2, paddingBottom: 0, fontSize: "0.875rem" }}} />
        )}
        {column.button && (
          <DialogProviderContext.Consumer>
            {({showServantInfoDialog}) =>
              <Button size="small" onClick={() => showServantInfoDialog(tableData[rowIndex].servant, props.getInventoryStatus(), "skills")} variant="outlined" >{column.buttonLabel}</Button>
            }
          </DialogProviderContext.Consumer>
        )}
        {column.popover && (
          <PopoverCell popover={skill(getTableData(tableData[rowIndex], columnIndex, { popover: true }))}>{cellData}</PopoverCell>
        )}
        {!column.editable && !column.button && !column.popover && (
          <span style={{fontSize:"smaller"}}>{cellData}</span>
        )}
      </div>
    )
  }

  return (
    <div className={classes.container} ref={myRef}>
      <Grid container className={classes.controller} justify="flex-end" alignItems="center" spacing={1} >
        <Grid item className={classes.summary} >
          {`フィルタ: ${tableData.length}`}
        </Grid>
        <Grid item>
          <Button onClick={handleClickClipboard} variant="outlined" >CSVコピー</Button>
        </Grid>
        <Grid item>
          <DialogProviderContext.Consumer>
            {({showFilterDialog}) =>
              <Button onClick={() => showFilterDialog(charFilterValues, defaultCharFilterValues, charFilterDefinition, handleCloseCharFilter)}
                variant="contained"  color={Object.values(charFilterValues).some((group) => Object.values(group).some((value) => value)) ? "secondary" : "default"} >
                特性フィルタ
              </Button>
            }
          </DialogProviderContext.Consumer>
        </Grid>
        <Grid item>
          <DialogProviderContext.Consumer>
            {({showFilterDialog}) =>
              <Button onClick={() => showFilterDialog(skillFilterValues, defaultSkillFilterValues, skillFilterDefinition, handleCloseSkillFilter)}
                variant="contained"  color={Object.values(skillFilterValues).some((group) => Object.values(group).some((value) => value)) ? "secondary" : "default"} >
                スキルフィルタ
              </Button>
            }
          </DialogProviderContext.Consumer>
        </Grid>
        <Grid item>
          <DialogProviderContext.Consumer>
            {({showFilterDialog}) =>
              <Button onClick={() => showFilterDialog(filterValues, defaultFilterValues, filterDefinition, handleCloseFilter)}
                variant="contained"  color={Object.values(filterValues).some((group) => Object.values(group).some((value) => !value)) ? "secondary" : "default"} >
                フィルタ
              </Button>
            }
          </DialogProviderContext.Consumer>
        </Grid>
      </Grid>
      <VariableSizeGrid width={tableSize[0]} height={30} ref={headerRef}
        columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
        rowCount={1} rowHeight={() => (30)} style={{overflowX: "hidden", overflowY: "scroll"}}>
        {headerCell}
      </VariableSizeGrid>
      <VariableSizeGrid width={tableSize[0]} height={tableSize[1] - 30}
        columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
        rowCount={tableData.length} rowHeight={() => (30)} onScroll={({scrollLeft}) => {headerRef.current.scrollTo({scrollLeft: scrollLeft, scrollTop: 0})}} >
        {cell}
      </VariableSizeGrid>
    </div>
  )
}