import React, { FC, useState, useEffect, useRef } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { isAndroid } from 'react-device-detect'

import { Grid, Button, TextField, FormControlLabel, Checkbox } from '@material-ui/core'
import { VariableSizeGrid } from 'react-window'

import { Servants, Servant, ServantSpec, servantNames, servantClassNames, attributeNames, estimatedLevelByAscensionAndRare, servantSkills, generateCleanServant } from '../../fgo/servants'
import { InventoryStatus } from '../../fgo/inventory'

import { DialogProviderContext } from './DialogProvider'
import { FilterDefinition, FilterValues } from './FilterDialog'
import { saveFilter, loadFilter, saveModifyInventory, loadModifyInventory } from '../storage'

type Prop = {
  servants: Servants
  onChange(servants: Servants): void
  getInventoryStatus(): InventoryStatus
  setInventoryStatus(InventoryStatus): void
}

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: number
  span?: number
  editable?: boolean
  type?: "number" | "string"
  min?: number
  max?: number
  button?: boolean
  duplicate?: boolean
  buttonLabel?: string
  step?: number
}

type ServantTableData = {
  id: number
  index: number
  name: string
  servant: Servant
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

const parseAppendSkillLevel = (text: string) => {
  const result = [ -1, -1, -1 ]

  const values = text.match(/(\d+)\s*\/(\d+)\s*\/(\d+)/) || [ "", "", "", "" ]
  if (values[0].length) {
    result[0] = Number.parseInt(values[1])
    result[1] = Number.parseInt(values[2])
    result[2] = Number.parseInt(values[3])
  } else {
    let value = Number.parseInt(text)
    if (value >= 0 && value <= 101010) {
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
    if (value > 10 || value < 0)
      result[index] = 0
  })
  return result
}

const columns : TableColumnInfo[] = [
  { label: 'ID', key: 'id', align: "center", width: 80},
  { label: '名称', key: 'name', align: "left", width: 240},
  { label: 'クラス', key: 'class', align: "center", width: 80},
  { label: 'レア', key: 'rare', align: "center", width: 80},
  { label: 'レベル', key: 'level', align: "center", width: 80, editable: true, type: "number", min: 1, max: 120},
  { label: '宝具', key: 'npLevel', align: "center", width: 80, editable: true, type: "number", min: 0, max: 5},
  { label: '再臨', key: 'ascension', align: "center", width: 80, editable: true, type: "number", min: 0, max: 4},
  { label: '(予定)', key: 'maxAscension', align: "center", width: 80, editable: true, type: "number", min: 0, max: 4},
  { label: 'スキル', key: 'skillLevel', align: "center", width: 80, editable: true, type: "string"},
  { label: '(予定)', key: 'maxSkillLevel', align: "center", width: 80, editable: true, type: "string"},
  { label: 'APスキル', key: 'appendSkillLevel', align: "center", width: 80, editable: true, type: "string"},
  { label: '(予定)', key: 'maxAppendSkillLevel', align: "center", width: 80, editable: true, type: "string"},
  { label: 'Atk+', key: 'attackMod', align: "center", width: 80, editable: true, type: "number", min: 0, max: 2000, step: 10},
  { label: 'HP+', key: 'hpMod', align: "center", width: 80, editable: true, type: "number", min: 0, max: 2000, step: 10},
  { label: '育成中', key: 'leveling', align: "center", width: 80},
  { label: '残素材数', key: 'items', align: "center", width: 80 },
  { label: 'AP残数', key: 'itemsForAP', align: "center", width: 80 },
  { label: '素材確認', key: 'checkItems', align: "center", width: 80, button: true, buttonLabel: "素材" },
  { label: '分裂', key: 'duplicated', align: "center", width: 80, duplicate: true, buttonLabel: "+" }
]

const getTableData = (servantTableData: ServantTableData, columnIndex: number, sort?: boolean) => {
  const key = columns[columnIndex].key
  const row = servantTableData

  switch (key) {
    case 'name':
      return row[key]
    case 'skillLevel':
    case 'maxSkillLevel':
    case 'appendSkillLevel':
    case 'maxAppendSkillLevel':
      if (sort)
        return row.servant[key].reduce((acc, level) => acc * (level + 1), 1)
      return `${row.servant[key][0]}/${row.servant[key][1]}/${row.servant[key][2]}`
    case 'class':
      if (sort)
        return row.servant.spec[key]
      return servantClassNames[row.servant.spec[key]]
    case 'attributes':
      if (sort)
        return row.servant.spec[key]
      return attributeNames[row.servant.spec[key]]
    case 'rare':
    case 'gender':
    case 'npType':
        return row.servant.spec[key]
    case 'characteristics':
      return row.servant.spec[key]
    case 'leveling':
      if ((row.servant.npLevel > 0)
          && (row.servant.ascension < row.servant.maxAscension || row.servant.skillLevel[0] < row.servant.maxSkillLevel[0]
              || row.servant.skillLevel[1] < row.servant.maxSkillLevel[1] || row.servant.skillLevel[2] < row.servant.maxSkillLevel[2])
              || row.servant.appendSkillLevel[0] < row.servant.maxAppendSkillLevel[0] || row.servant.appendSkillLevel[1] < row.servant.maxAppendSkillLevel[1]
              || row.servant.appendSkillLevel[2] < row.servant.maxAppendSkillLevel[2])
        return "育成中"
      return ""
    case 'items':
      if (row.servant.ascension < 4 || row.servant.skillLevel[0] < 9 || row.servant.skillLevel[1] < 9 || row.servant.skillLevel[2] < 9) {
        if (!sort && row.servant.ascension < 4)
          return row.servant.totalItemsForMax.ascension + " + " + row.servant.totalItemsForMax.skill
        return row.servant.totalItemsForMax.skill
      } else {
        return ""
      }
    case 'itemsForAP':
      if (row.servant.appendSkillLevel[0] < 9 || row.servant.appendSkillLevel[1] < 9 || row.servant.appendSkillLevel[2] < 9) {
        return row.servant.totalItemsForMax.appendSkill
      } else {
        return ""
      }
    case 'checkItems':
      return ""
    default:
      return row.servant[key]
  }
}

const updateInventoryForAscension = (servantSpec: ServantSpec, newAscensionLevel: number, oldAscensionLevel: number, inventoryStatus: InventoryStatus) => {
  const [ min, max ] = [ Math.min(newAscensionLevel, oldAscensionLevel), Math.max(newAscensionLevel, oldAscensionLevel) ]
  const inc = min == newAscensionLevel
  let updated = false

  for (let ascensionLevel = min; ascensionLevel < max; ascensionLevel++) {
    updated = true
    Object.entries(servantSpec.items.ascension[ascensionLevel]).forEach(([id, count]) => {
      inventoryStatus[id].stock += (inc ? 1 : -1) * count
    })
  }
  return updated
}

const updateInventoryForSkill = (servantSpec: ServantSpec, newSkillLevel: number[], oldSkillLevel: number[], inventoryStatus: InventoryStatus) => {
  const skillNos = [ 0, 1, 2 ]
  let updated = false

  skillNos.forEach((skillNo: number) => {
    const [ min, max ] = [ Math.min(newSkillLevel[skillNo], oldSkillLevel[skillNo]), Math.max(newSkillLevel[skillNo], oldSkillLevel[skillNo]) ]
    const inc = min == newSkillLevel[skillNo]

    for (let skillLevel = min - 1; skillLevel < max - 1; skillLevel++) {
      updated = true
      Object.entries(servantSpec.items.skill[skillLevel]).forEach(([id, count]) => {
        inventoryStatus[id].stock += (inc ? 1 : -1) * count
      })
    }
  })
  return updated
}

const updateInventoryForAppendSkill = (servantSpec: ServantSpec, newAppendSkillLevel: number[], oldAppendSkillLevel: number[], inventoryStatus: InventoryStatus) => {
  const skillNos = [ 0, 1, 2 ]
  let updated = false

  skillNos.forEach((skillNo: number) => {
    const [ min, max ] = [ Math.min(newAppendSkillLevel[skillNo], oldAppendSkillLevel[skillNo]), Math.max(newAppendSkillLevel[skillNo], oldAppendSkillLevel[skillNo]) ]
    const inc = min == newAppendSkillLevel[skillNo]

    for (let appendSkillLevel = Math.max(min - 1, 0); appendSkillLevel < max - 1; appendSkillLevel++) {
      updated = true
      Object.entries(servantSpec.items.appendSkill[appendSkillLevel]).forEach(([id, count]) => {
        inventoryStatus[id].stock += (inc ? 1 : -1) * count
      })
    }
  })
  return updated
}


const setTableData = (servantTableData: ServantTableData, columnIndex: number, value: string, props: Prop, modifyInventory: boolean) => {
  const key = columns[columnIndex].key
  const row = servantTableData

  switch (key) {
    case 'level':
      row.servant[key] = Math.max(1, Math.min(Number.parseInt(value) || 0, columns[columnIndex].max))
      break
    case 'npLevel':
    case 'hpMod':
    case 'attackMod':
      row.servant[key] = Math.max(0, Math.min(Number.parseInt(value) || 0, columns[columnIndex].max))
      break
    case 'ascension':
    case 'maxAscension':
      {
        const newValue = Math.max(0, Math.min(Number.parseInt(value) || 0, columns[columnIndex].max))
        if (key == 'ascension') {
          row.servant.level = estimatedLevelByAscensionAndRare[row.servant.spec.rare][newValue]
        }
        if (key == 'ascension' && modifyInventory) {
          const inventoryStatus = props.getInventoryStatus()
          if (updateInventoryForAscension(row.servant.spec, newValue, row.servant.ascension, inventoryStatus)) {
            props.setInventoryStatus(inventoryStatus)
          }
        }
        row.servant[key] = newValue
        row.servant.maxAscension = Math.max(row.servant.ascension, row.servant.maxAscension)
      }
      break
    case 'skillLevel':
    case 'maxSkillLevel':
      {
        const newValues = parseSkillLevel(value)
        if (newValues && newValues[0]) {
          if (key == 'skillLevel' && modifyInventory) {
            const inventoryStatus = props.getInventoryStatus()
            if (updateInventoryForSkill(row.servant.spec, newValues, row.servant.skillLevel, inventoryStatus)) {
              props.setInventoryStatus(inventoryStatus)
            }
          }
          row.servant[key] = newValues
          row.servant.maxSkillLevel[0] = Math.max(row.servant.skillLevel[0], row.servant.maxSkillLevel[0])
          row.servant.maxSkillLevel[1] = Math.max(row.servant.skillLevel[1], row.servant.maxSkillLevel[1])
          row.servant.maxSkillLevel[2] = Math.max(row.servant.skillLevel[2], row.servant.maxSkillLevel[2])
        }
      }
      break
    case 'appendSkillLevel':
    case 'maxAppendSkillLevel':
      {
        const newValues = parseAppendSkillLevel(value)
        if (newValues && newValues[0] >= 0) {
          if (key == 'appendSkillLevel' && modifyInventory) {
            const inventoryStatus = props.getInventoryStatus()
            if (updateInventoryForAppendSkill(row.servant.spec, newValues, row.servant.appendSkillLevel, inventoryStatus)) {
              props.setInventoryStatus(inventoryStatus)
            }
          }
          row.servant[key] = newValues
          row.servant.maxAppendSkillLevel[0] = Math.max(row.servant.appendSkillLevel[0], row.servant.maxAppendSkillLevel[0])
          row.servant.maxAppendSkillLevel[1] = Math.max(row.servant.appendSkillLevel[1], row.servant.maxAppendSkillLevel[1])
          row.servant.maxAppendSkillLevel[2] = Math.max(row.servant.appendSkillLevel[2], row.servant.maxAppendSkillLevel[2])
        }
      }
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
      { label: "ビースト", key: "獣" },
      { label: 'シールダー', key: "盾" },
    ]
  },
  {
    name: "レアリティ", key: "rare", type: "check",
    buttons: [
      { label: "★5", key: "5" },
      { label: "★4", key: "4" },
      { label: "★3", key: "3" },
      { label: "★2", key: "2" },
      { label: "★1", key: "1" },
      { label: "★0", key: "0" },
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
    name: "ATKフォウ", key: "attackMod", type: "check",
    buttons: [
      { label: "0～999", key: "0,999" },
      { label: "1000～1999", key: "1000,1999" },
      { label: "2000", key: "2000,2000" },
    ]
  },
  {
    name: "HPフォウ", key: "hpMod", type: "check",
    buttons: [
      { label: "0～999", key: "0,999" },
      { label: "1000～1999", key: "1000,1999" },
      { label: "2000", key: "2000,2000" },
    ]
  },
  {
    name: "再臨状態", key: "ascension", type: "check",
    buttons: [
      { label: "最終再臨", key: "4" },
      { label: "第3再臨", key: "3" },
      { label: "第2再臨", key: "2" },
      { label: "第1再臨", key: "1" },
      { label: "未再臨", key: "0" },
    ]
  },
  {
    name: "育成状態", key: "growthStatus", type: "check",
    buttons: [
      { label: "育成中", key: "leveling" },
      { label: "未スキルマ", key: "0" },
      { label: "スキルマ(偽)", key: "1" },
      { label: "スキルマ", key: "2" },
    ]
  },
  {
    name: "アペンド育成状態", key: "appendGrowthStatus", type: "check",
    buttons: [
      { label: "未解放有り", key: "notOpen" },
      { label: "育成中", key: "0" },
      { label: "未スキルマ", key: "notSkillMax" },
      { label: "未解放有りスキルマ(偽含)", key: "1" },
      { label: "全スキルマ(偽)", key: "2" },
      { label: "全スキルマ", key: "3" },
    ]
  },
  {
    name: "分裂", key: "duplicatedStatus", type: "check",
    buttons: [
      { label: "通常", key: "normal" },
      { label: "分裂", key: "duplicated" },
    ]
  }
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
      { label: "ビースト攻撃適性", key: "ビースト攻撃適性" },
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
      minHeight: 48,
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
  })
)

const calcServantTableData = (servants: Servants): ServantTableData[] => {
  return servants.map((servant, index) => (
    { id: servant.id, name: servantNames[servant.id], index, servant: servant } 
  ))
}

const calcServantSummary = (servants: Servants) => {
  return servants.reduce((acc, servant) => {
    if (servant.duplicated) {
      acc.duplicated++
    } else {
      acc.servants++
      servant.npLevel > 0 && acc.summoned++
      servant.ascension == 4 && acc.maxAscension++
      (servant.skillLevel[0] >= 9 && servant.skillLevel[1] >= 9 && servant.skillLevel[2] >= 9) && acc.maxSkill++
      (servant.appendSkillLevel[0] >= 9 && servant.appendSkillLevel[1] >= 9 && servant.appendSkillLevel[2] >= 9) && acc.maxAppendSkill++
    }

    return acc
  }, { servants: 0, summoned: 0, maxAscension: 0, maxSkill: 0, maxAppendSkill: 0, duplicated: 0 })
}

const filterAndSort = (servantTableData: ServantTableData[], filters: FilterValues, skillFilters: FilterValues, filterString: string, sortColumn: number, sortOrder: number) => {
  const isSkillFilterUsed = Object.values(skillFilters).some((group) => Object.values(group).some((value) => value))
  const preSortkey = (row) => ((sortOrder > 0 ? 100 - row.servant.spec.class : row.servant.spec.class) * 10000 + (10 - row.servant.spec.rare) * 1000 + (1000 - row.id))
  const filterStrings = filterString.split(/[,\s]+/)

  return servantTableData.filter((row) => {
    return filterStrings.some((str) => {
      return row.id == parseInt(str, 10) || row.name.match(str)
    })
  }).sort((a, b) => {
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
        case "npType":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.spec[groupKey] == filterKey)
          })
        case "npLevel":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant[groupKey] == Number.parseInt(filterKey))
          })
        case 'hpMod':
        case 'attackMod':
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            const [ min, max ] = filterKey.split(',')
            return enabled && (Number.parseInt(min) <= row.servant[groupKey] && row.servant[groupKey] <= Number.parseInt(max))
          })
        case 'ascension':
          return Object.entries(groupValues).some(([filterKey, enabled]) => (enabled && (row.servant.ascension == Number.parseInt(filterKey))))
        case 'growthStatus':
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            switch (filterKey) {
            case 'leveling':
              return enabled && (row.servant.npLevel > 0)
                              && (row.servant.ascension < row.servant.maxAscension || row.servant.skillLevel[0] < row.servant.maxSkillLevel[0]
                                || row.servant.skillLevel[1] < row.servant.maxSkillLevel[1] || row.servant.skillLevel[2] < row.servant.maxSkillLevel[2])
            case '0':
              return enabled && (row.servant.skillLevel[0] < 9 || row.servant.skillLevel[1] < 9 || row.servant.skillLevel[2] < 9)
            case '1':
              return enabled && (row.servant.skillLevel[0] >= 9 && row.servant.skillLevel[1] >= 9 && row.servant.skillLevel[2] >= 9)
                              && row.servant.skillLevel.reduce((acc, value) => acc * value) != 1000
            case '2':
              return enabled && (row.servant.skillLevel[0] == 10 && row.servant.skillLevel[1] == 10 && row.servant.skillLevel[2] == 10)
            default:
              return false
            }
          })
        case 'appendGrowthStatus':
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            const allClose = row.servant.appendSkillLevel.every((value) => value == 0)
            const allOpen = row.servant.appendSkillLevel.every((value) => value > 0)
            const nineOver = row.servant.appendSkillLevel.every((value) => value == 0 || value >= 9)
            const maxLevel = row.servant.appendSkillLevel.every((value) => value == 10)
            const leveling = row.servant.appendSkillLevel.some((value, index) => row.servant.maxAppendSkillLevel[index] != value)
            switch (filterKey) {
            case 'notOpen':
              return enabled && !allOpen
            case '0':
              return enabled && leveling
            case 'notSkillMax':
              return enabled && !allClose && !nineOver 
            case '1':
              return enabled && !allClose && !allOpen && nineOver
            case '2':
              return enabled && allOpen && nineOver && !maxLevel
            case '3':
              return enabled && maxLevel
            default:
              return false
            }
          })
        case 'duplicatedStatus':
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            switch (filterKey) {
              case 'normal':
                return enabled && !row.servant.duplicated
              case 'duplicated':
                return enabled && row.servant.duplicated
            }
          })
        default:
          return false
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
  }).sort((a, b) => {
    let aValue = getTableData(a, sortColumn, true)
    let bValue = getTableData(b, sortColumn, true)

    if (columns[sortColumn].key == 'items') {
      if (aValue === "")
        aValue = 999999 * sortOrder
      if (bValue === "")
        bValue = 999999 * sortOrder
    }
    if (aValue == bValue)
      return 0
    if (bValue > aValue)
      return -sortOrder
    else
      return sortOrder
  })
}

export const ServantTable: FC<Prop> = (props) => {
  const classes = useStyles()
  const myRef = useRef<HTMLDivElement>()
  const headerRef = useRef<VariableSizeGrid>()
  const bodyRef = useRef<VariableSizeGrid>()
  const [ tableKey, setTableKey ] = useState(0)
  const [ sortBy, setSortBy ] = useState(0)
  const [ sortOrder, setSortOrder ] = useState(1)
  const [ filterValues, setFilterValues ] = useState<FilterValues>(validateFilter(loadFilter("ServantTable")))
  const [ skillFilterValues, setSkillFilterValues ] = useState<FilterValues>(validateSkillFilter(loadFilter("ServantTable/skill")))
  const [ filterString, setFilterString ] = useState("")
  const [ tableSize, setTableSize ] = useState([1000, 800])
  const tableData = filterAndSort(calcServantTableData(props.servants), filterValues, skillFilterValues, filterString, sortBy, sortOrder)
  const summary = calcServantSummary(props.servants)
  let modifyInventory = loadModifyInventory('ServantTable')

  const refs = {}

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
    const isChanged = getTableData(row, columnIndex) != e.target.value

    isChanged && setTableData(row, columnIndex, e.target.value, props, modifyInventory)
    e.target.value = getTableData(row, columnIndex)
    if (isChanged) {
      if (columns[columnIndex].key == 'ascension' || columns[columnIndex].key == 'skillLevel' || columns[columnIndex].key == 'appendSkillLevel') {
        bodyRef.current.resetAfterColumnIndex(columnIndex)
        columns.forEach((columnInfo, index) => {
          if (columnInfo.editable) {
            if (refs[rowIndex + '-' + index]) {
              refs[rowIndex + '-' + index].current.value = getTableData(row, index)
            }
          }
        })
      }

      props.servants[row.index] = row.servant
      props.onChange(props.servants)
    }
  }

  const focusNextTabStop = (rowIndex: number, columnIndex: number) => {
    for (let index = columnIndex + 1; index < columns.length; index++) {
      if (columns[index].editable) {
        const nextTabRef = refs[rowIndex + "-" + index]
        nextTabRef?.current?.focus()
        return
      }
    }
    for (let index = 0; index <= columnIndex; index++) {
      if (columns[index].editable) {
        const nextTabRef = refs[(rowIndex + 1) + "-" + index]
        nextTabRef?.current?.focus()
        return
      }
    }
  }

  const handleKeyPress = (rowIndex: number, columnIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      focusNextTabStop(rowIndex, columnIndex)
    }
  }

  const handleCloseFilter = (newFilterValues: FilterValues) => {
    setFilterValues(newFilterValues)
    saveFilter("ServantTable", newFilterValues)
  }

  const handleCloseSkillFilter = (newFilterValues: FilterValues) => {
    setSkillFilterValues(newFilterValues)
    saveFilter("ServantTable/skill", newFilterValues)
  }

  const handleFilterStringChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value == "") {
      setFilterString("")
    } else {
      // aplly when Enter pressed
    }
  }
  const handleFilterStringKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement) {
      if (e.key == "Enter") {
        setFilterString(e.target.value)
      }
    }
  }

  const handleClickClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    const lines: string[] = []

    lines.push(columns.reduce((acc, column) => (acc + "\t" + column.label),""))
    tableData.forEach((data) => {
      lines.push(columns.reduce((acc, column, columnIndex) => (acc + "\t\"" + getTableData(data, columnIndex)) + "\"",""))
    })

    navigator.clipboard?.writeText(lines.reduce((acc, line) => (acc + line.slice(1) + '\n'),""))
  }

  const handleClickRecalc = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTableKey(tableKey + 1)
  }

  const handleModifyInventory = (e: React.ChangeEvent<HTMLInputElement>) => {
    modifyInventory = e.target.checked
    saveModifyInventory('ServantTable', modifyInventory)
  }

  const handleAddDuplicate = (servant) => {
    const servants = props.servants
    servants.push({ ...generateCleanServant(servant.spec), npLevel: 1, duplicated: true })
    props.onChange(props.servants)
    setTableKey(tableKey + 1)
  }

  const handleDelDuplicate = (servant) => {
    const servants = props.servants
    const deleteIndex = props.servants.findIndex((item) => item == servant)
    if (deleteIndex >= 0) {
      servants.splice(deleteIndex, 1)
      props.onChange(props.servants)
      setTableKey(tableKey + 1)
    } else {
      console.log("not found servant")
    }
  }
  const headerCell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]

    return (
      <div style={{...style, textAlign: column.align}} className={classes.head} onClick={() => handleClickColumn(columnIndex)}>
        {(sortBy == columnIndex) ? ((sortOrder == 1) ? column.label + "▲" : column.label + "▼") : column.label}
      </div>
    )
  }

  const editableCell = (columnIndex, rowIndex) => {
    const column = columns[columnIndex]
    const cellData = getTableData(tableData[rowIndex], columnIndex)
    const ref = useRef()

    refs[rowIndex + "-" + columnIndex] = ref
    if (column.type == "number") {
      return <TextField defaultValue={cellData} size="small" inputRef={ref}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {handleLostFocus(rowIndex, columnIndex, e)}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {handleKeyPress(rowIndex, columnIndex, e)}}
              type={column.type} InputProps={{ disableUnderline: true }}
              inputProps={{min: column.min, max: column.max, step: column.step || 1, style: { textAlign: column.align, paddingTop: 2, paddingBottom: 0, fontSize: "0.875rem" }}} />
    } else {
      return <TextField defaultValue={cellData} size="small" inputRef={ref}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {handleLostFocus(rowIndex, columnIndex, e)}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {handleKeyPress(rowIndex, columnIndex, e)}}
              type={column.type} InputProps={{ disableUnderline: true }}
              inputProps={{ style: { textAlign: column.align, paddingTop: 2, paddingBottom: 0, fontSize: "0.875rem" }}} />
    }
  }

  const cell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]
    const cellData = getTableData(tableData[rowIndex], columnIndex)
    const [matchWord, charMain, charSub] = ((typeof(cellData) == 'string') && cellData.match(/^([^\s]+\s+[^\s]+)\s+(.*)$/)) || [ "", cellData, ""]

    return (
      <div style={{...style, textAlign: column.align}} className={rowIndex % 2 ? classes.oddRowCell : classes.evenRowCell}>
        {column.editable ?
          editableCell(columnIndex, rowIndex)
          : column.button ?
            <DialogProviderContext.Consumer>
              {({showServantInfoDialog}) =>
                <Button size="small" onClick={() => showServantInfoDialog(tableData[rowIndex].servant, props.getInventoryStatus(), "items")} variant="outlined" >{column.buttonLabel}</Button>
              }
            </DialogProviderContext.Consumer>
          : column.duplicate ?
            tableData[rowIndex].servant.duplicated ?
                <Button size="small" onClick={() => handleDelDuplicate(tableData[rowIndex].servant)} variant="outlined">-</Button>
                : <Button size="small" onClick={() => handleAddDuplicate(tableData[rowIndex].servant)} variant="outlined">+</Button>
        : charSub ? <div>{charMain}<span style={{fontSize:"smaller"}}>&nbsp;{charSub}</span></div>
                : cellData
        }
      </div>
    )
  }

  return (
    <div className={classes.container} ref={myRef}>
      <Grid container className={classes.controller} justifyContent="flex-end" alignItems="center" spacing={1} >
        <Grid item className={classes.summary} >
          {`実装: ${summary.servants} 召喚: ${summary.summoned} 最終再臨: ${summary.maxAscension} スキルマ(含偽): ${summary.maxSkill} アペンドマ(含偽): ${summary.maxAppendSkill} 分裂: ${summary.duplicated} フィルタ: ${tableData.length}`}
        </Grid>
        <Grid item>
          <Button onClick={handleClickRecalc} variant="outlined" >再計算</Button>
        </Grid>
        <Grid item>
          <FormControlLabel control={<Checkbox name="checkedC" defaultChecked={modifyInventory} onChange={handleModifyInventory} />}
                            label="再臨・スキル変更時に所持数に反映" />
        </Grid>
        <Grid item>
          <Button onClick={handleClickClipboard} variant="outlined" >CSVコピー</Button>
        </Grid>
        <Grid item>
          <TextField defaultValue={filterString} size="small"
            placeholder="名称/IDフィルタ"
            inputProps={{ type: "search" }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterStringChanged(e)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleFilterStringKeyPress(e)}
            />
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
      <VariableSizeGrid width={tableSize[0]} height={tableSize[1] - 30} ref={bodyRef}
        columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
        rowCount={tableData.length} rowHeight={() => (30)} onScroll={({scrollLeft}) => {headerRef.current.scrollTo({scrollLeft: scrollLeft, scrollTop: 0})}} >
        {cell}
      </VariableSizeGrid>
    </div>
  )
}