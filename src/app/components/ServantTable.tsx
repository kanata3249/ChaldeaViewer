import React, { FC, useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Grid, Button, TextField } from '@material-ui/core'
import { VariableSizeGrid } from 'react-window'

import { Servants, Servant, servantNames, servantClassNames, attributeNames } from '../../fgo/servants'

import { FilterDialog, FilterDefinition, FilterValues } from './FilterDialog'

type Prop = {
  servants: Servants
  onChange(servants: Servants): void
}

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: number
  formatter?: (value: number) => string
  span?: number
  editable?: boolean
  type?: "number" | "string"
  max?: number
}

type ServantTableData = {
  id: number
  index: number
  name: string
  servant: Servant
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
  { label: '名称', key: 'name', align: "left", width: 300},
  { label: 'クラス', key: 'class', align: "center", width: 60},
  { label: 'レア', key: 'rare', align: "center", width: 60},
  { label: '性別', key: 'gender', align: "center", width: 60},
  { label: '属性', key: 'attributes', align: "center", width: 60},
  { label: '特性', key: 'characteristics', align: "left", width: 400},
  { label: '宝具タイプ', key: 'npType', align: "center", width: 80},
  { label: 'レベル', key: 'level', align: "center", width: 60, editable: true, type: "number", max: 100},
  { label: '宝具', key: 'npLevel', align: "center", width: 60, editable: true, type: "number", max: 5},
  { label: '再臨', key: 'ascension', align: "center", width: 60, editable: true, type: "number", max: 4},
  { label: '(予定)', key: 'maxAscension', align: "center", width: 60, editable: true, type: "number", max: 4},
  { label: 'スキル', key: 'skillLevel', align: "center", width: 80, editable: true, type: "string"},
  { label: '(予定)', key: 'maxSkillLevel', align: "center", width: 80, editable: true, type: "string"},
  { label: 'Atk+', key: 'attackMod', align: "center", width: 80, editable: true, type: "number", max: 2000},
  { label: 'HP+', key: 'hpMod', align: "center", width: 80, editable: true, type: "number", max: 2000},
  { label: '育成中', key: 'leveling', align: "center", width: 60},
]

const getTableData = (servantTableData: ServantTableData, columnIndex: number, sort?: boolean) => {
  const key = columns[columnIndex].key
  const row = servantTableData

  switch (key) {
    case 'name':
      return row[key]
    case 'skillLevel':
    case 'maxSkillLevel':
      if (sort)
        return row.servant[key].reduce((acc, level) => acc * level)
      return `${row.servant[key][0]}/${row.servant[key][1]}/${row.servant[key][2]}`
    case 'class':
      if (sort)
        return row.servant.servantInfo[key]
      return servantClassNames[row.servant.servantInfo[key]]
    case 'attributes':
      if (sort)
        return row.servant.servantInfo[key]
      return attributeNames[row.servant.servantInfo[key]]
    case 'rare':
    case 'gender':
    case 'npType':
        return row.servant.servantInfo[key]
    case 'characteristics':
      return row.servant.servantInfo[key]
    case 'leveling':
      if ((row.servant.npLevel > 0)
          && (row.servant.ascension < row.servant.maxAscension || row.servant.skillLevel[0] < row.servant.maxSkillLevel[0]
              || row.servant.skillLevel[1] < row.servant.maxSkillLevel[1] || row.servant.skillLevel[2] < row.servant.maxSkillLevel[2]))
        return "育成中"
      return ""
      break
    default:
      return row.servant[key]
  }
}

const setTableData = (servantTableData: ServantTableData, columnIndex: number, value: string) => {
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
    name: "宝具タイプ", key: "npType", type: "check",
    buttons: [
      { label: "B 全体", key: "B 全体" },
      { label: "A 全体", key: "A 全体" },
      { label: "Q 全体", key: "Q 全体" },
      { label: "B 単体", key: "B 単体" },
      { label: "A 単体", key: "A 単体" },
      { label: "Q 単体", key: "Q 単体" },
      { label: "B サポート", key: "B サポート" },
      { label: "A サポート", key: "A サポート" },
      { label: "Q サポート", key: "Q サポート" },
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
  }
]
const defaultFilterValues: FilterValues = Object.values(filterDefinition).reduce((acc, group) => {
  acc[group.key] = group.buttons.reduce((acc, button) => {
      acc[button.key] = true
      return acc
    },{})
    return acc
  },{})

console.log(defaultFilterValues)

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    container: {
      height: "100%"
    },
    controller: {
      height: 48,
      paddingRight: 8
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

const filterAndSort = (sesrvantTableData: ServantTableData[], filters: FilterValues, sortColumn: number, sortOrder: number) => {
  return sesrvantTableData.filter((row) => {
    return Object.entries(filters).every(([groupKey, groupValues]) => {
      switch(groupKey) {
        case "class":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (servantClassNames[row.servant.servantInfo.class] == filterKey)
          })
        case "rare":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.servantInfo.rare == Number.parseInt(filterKey))
          })
        case "gender":
        case "attributes":
        case "npType":
            return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant.servantInfo[groupKey] == filterKey)
          })
        case "npLevel":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && (row.servant[groupKey] == Number.parseInt(filterKey))
          })
        default:
          return false
      }
    })
  }).sort((a, b) => {
    const aValue = getTableData(a, sortColumn, true)
    const bValue = getTableData(b, sortColumn, true)

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
  const [ sortBy, setSortBy ] = useState(0)
  const [ sortOrder, setSortOrder ] = useState(1)
  const [ filterValues, setFilterValues ] = useState<FilterValues>(defaultFilterValues)
  const [ openFilterDialog, setOpenFilterDialog ] = useState(false)
  const [ tableSize, setTableSize ] = useState([1000, 800])
  const tableData = filterAndSort(calcServantTableData(props.servants), filterValues, sortBy, sortOrder)

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      const height = entries[0].contentRect.height - 48
      setTableSize([width, height])
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
      setSortOrder(1)
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

  const handleClickFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenFilterDialog(true)
  }

  const handleCloseFilter = (newFilterValues: FilterValues) => {
    setFilterValues(newFilterValues)
    setOpenFilterDialog(false)
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
    const [matchWord, charMain, charSub] = ((typeof(cellData) == 'string') && cellData.match(/^([^\s]+\s+[^\s]+)\s+(.*)$/)) || [ "", cellData, ""]

    return (
      <div style={{...style, textAlign: column.align}} className={rowIndex % 2 ? classes.oddRowCell : classes.evenRowCell}>
        {column.editable ?
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
        : charSub ? <div>{charMain}<span style={{fontSize:"smaller"}}>&nbsp;{charSub}</span></div>
                : cellData
        }
      </div>
    )
  }

  return (
    <div className={classes.container} ref={myRef}>
      <Grid container className={classes.controller} justify="flex-end" alignItems="center" >
        <Grid item>
          <Button onClick={handleClickFilter} variant="contained" >フィルタ</Button>
        </Grid>
      </Grid>
      <VariableSizeGrid width={tableSize[0]} height={30} ref={headerRef}
        columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
        rowCount={1} rowHeight={() => (30)} style={{overflowX: "hidden", overflowY: "scroll"}}>
        {headerCell}
      </VariableSizeGrid>
      <VariableSizeGrid width={tableSize[0]} height={tableSize[1] - 30} scrollOffset={0}
        columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
        rowCount={tableData.length} rowHeight={() => (30)} onScroll={({scrollLeft}) => {headerRef.current.scrollTo({scrollLeft: scrollLeft, scrollTop: 0})}} >
        {cell}
      </VariableSizeGrid>
      <FilterDialog open={openFilterDialog} values={filterValues} defaultValues={defaultFilterValues} filterDefinition={filterDefinition} onClose={handleCloseFilter} />
    </div>
  )
}