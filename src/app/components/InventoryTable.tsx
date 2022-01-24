import React, { FC, useState, useEffect, useRef } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { isAndroid } from 'react-device-detect'

import { TextField, Button, Grid } from '@material-ui/core'
import { VariableSizeGrid } from 'react-window'

import { Inventory, InventoryStatus, ItemStatus, itemNames } from './../../fgo/inventory'

import { FilterDefinition, FilterValues } from './FilterDialog'
import { DialogProviderContext } from './DialogProvider'
import { saveFilter, loadFilter } from '../storage'

type Prop = {
  inventory: Inventory
  onChange(inventory: Inventory): void
  getInventoryStatus(): InventoryStatus
}

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: number
  editable?: boolean
}

type InventoryTableData = {
  id: number
  name: string
  item: ItemStatus
}

const countColumnWidth = 64
const fullColumns : TableColumnInfo[] = [
  { label: 'ID', key: 'id', align: "center", width: 80 },
  { label: '名称', key: 'name', align: "left", width: 150 },
  { label: '所持数', key: 'stock', align: "right", width: 70, editable: true },
  { label: '使用予定(BGM)', key: 'reservedForBGM', align: "right", width: countColumnWidth },
  { label: '使用予定(衣)', key: 'reservedForCostume', align: "right", width: countColumnWidth },
  { label: '使用予定(AS)', key: 'reservedForAP', align: "right", width: countColumnWidth },
  { label: '使用予定', key: 'reserved', align: "right", width: countColumnWidth },
  { label: '使用可能', key: 'free', align: "right", width: countColumnWidth },
  { label: '使用済み(BGM)', key: 'usedForBGM', align: "right", width: countColumnWidth },
  { label: '使用済み(衣)', key: 'usedForCostume', align: "right", width: countColumnWidth },
  { label: '使用済み(AS)', key: 'usedForAP', align: "right", width: countColumnWidth },
  { label: '使用済み', key: 'used', align: "right", width: countColumnWidth },
  { label: '必要数(全BGM)', key: 'requiredForBGM', align: "right", width: countColumnWidth },
  { label: '必要数(全衣)', key: 'requiredForCostume', align: "right", width: countColumnWidth },
  { label: '必要数(全AS)', key: 'requiredForAP', align: "right", width: countColumnWidth },
  { label: '必要数(全)', key: 'required', align: "right", width: countColumnWidth },
  { label: '必要数(可BGM)', key: 'summonedForBGM', align: "right", width: countColumnWidth },
  { label: '必要数(可衣)', key: 'summonedForCostume', align: "right", width: countColumnWidth },
  { label: '必要数(召AS)', key: 'summonedForAP', align: "right", width: countColumnWidth },
  { label: '必要数(召)', key: 'summoned', align: "right", width: countColumnWidth },
  { label: '残必要数(全BGM)', key: 'remainForBGM', align: "right", width: countColumnWidth },
  { label: '残必要数(全衣)', key: 'remainForCostume', align: "right", width: countColumnWidth },
  { label: '残必要数(全AS込)', key: 'remainForAP', align: "right", width: countColumnWidth },
  { label: '残必要数(全)', key: 'remain', align: "right", width: countColumnWidth },
  { label: '残必要数(可BGM)', key: 'remainSummonedForBGM', align: "right", width: countColumnWidth },
  { label: '残必要数(可衣)', key: 'remainSummonedForCostume', align: "right", width: countColumnWidth },
  { label: '残必要数(召AS込)', key: 'remainSummonedForAP', align: "right", width: countColumnWidth },
  { label: '残必要数(召)', key: 'remainSummoned', align: "right", width: countColumnWidth },
]

const getTableData = (inventoryTableData: InventoryTableData, columnIndex: number, columns: TableColumnInfo[]) => {
  const key = columns[columnIndex].key
  const sumExAP = (key: string) => Object.values<number>(inventoryTableData.item[key]).reduce((acc, value) => acc + value) - inventoryTableData.item[key].appendSkill
  const sumForAP = (key: string) => inventoryTableData.item[key].appendSkill
  const sumExBGM = (key: string) => Object.values<number>(inventoryTableData.item[key]).reduce((acc, value) => acc + value) - inventoryTableData.item[key].bgm
  const sumForBGM = (key: string) => inventoryTableData.item[key].bgm
  const sumForCostume = (key: string) => inventoryTableData.item[key].dress

  switch (key) {
    case 'id':
    case 'name':
      return inventoryTableData[key]
    case 'used':
    case 'reserved':
      return sumExAP(key)
    case 'usedForAP':
      return sumForAP('used')
    case 'reservedForAP':
      return sumForAP('reserved')
    case 'usedForCostume':
      return sumForCostume('used')
    case 'reservedForCostume':
      return sumForCostume('reserved')
    case 'usedForBGM':
      return sumForBGM('used')
    case 'reservedForBGM':
      return sumForBGM('reserved')
    case 'required':
    case 'summoned':
      return sumExAP(key)
    case 'requiredForAP':
      return sumForAP('required')
    case 'summonedForAP':
      return sumForAP('summoned')
    case 'requiredForCostume':
      return sumForCostume('required')
    case 'summonedForCostume':
      return sumForCostume('summoned')
    case 'requiredForBGM':
      return sumForBGM('required')
    case 'summonedForBGM':
      return sumForBGM('summoned')
    case 'remain':
      return Math.max(sumExAP('required') + sumForAP('reserved') - sumExAP('used') - inventoryTableData.item.stock, 0)
    case 'remainSummoned':
      return Math.max(sumExAP('summoned') + sumForAP('reserved')  - sumExAP('used') - inventoryTableData.item.stock, 0)
    case 'remainForAP':
      return Math.max(sumExBGM('required') - sumExBGM('used') - inventoryTableData.item.stock, 0)
    case 'remainSummonedForAP':
      return Math.max(sumExBGM('summoned') - sumExBGM('used') - inventoryTableData.item.stock, 0)
    case 'remainForCostume':
      return Math.max(sumForCostume('required') - sumForCostume('used') - inventoryTableData.item.stock, 0)
    case 'remainSummonedForCostume':
      return Math.max(sumForCostume('summoned') - sumForCostume('used') - inventoryTableData.item.stock, 0)
    case 'remainForBGM':
      return Math.max(sumForBGM('required') - sumForBGM('used') - inventoryTableData.item.stock, 0)
    case 'remainSummonedForBGM':
      return Math.max(sumForBGM('summoned') - sumForBGM('used') - inventoryTableData.item.stock, 0)
    default:
      return inventoryTableData.item[key]
  }
}

const filterDefinition: FilterDefinition[] = [
  {
    name: "表示対象", key: "display", type: "check",
    buttons: [
      { label: "素材(金)", key: "goldItems" },
      { label: "素材(銀)", key: "silverItems" },
      { label: "素材(銅)", key: "cupperItems" },
      { label: "モニュメント・ピース", key: "essentials" },
      { label: "秘石等", key: "gems" },
      { label: "QP", key: "qp" },
    ]
  },
  {
    name: "在庫", key: "stockStatus", type: "check",
    buttons: [
      { label: "在庫", key: "inStock" },
      { label: "不足", key: "outOfStock" },
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
  
const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    controller: {
      width: "100%",
      height: 48,
      paddingRight: 8,
      paddingLeft: 8
    },
    summary: {
      flexGrow: 1
    },
    container: {
      maxHeight: "calc(100vh - 64px - 48px)"    // find another way to limit heght.
    },
    head: {

    },
    row: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    cell: {
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

const calcInventoryTableData = (inventoryStatus: InventoryStatus): InventoryTableData[] => {
  return Object.keys(inventoryStatus).map((itemId) => (
    { id: Number.parseInt(itemId), name: itemNames[itemId], item: inventoryStatus[itemId] } 
  ))
}

const filterAndSort = (inventoryTableData: InventoryTableData[], filters: FilterValues, sortColumn: number, sortOrder: number, columns: TableColumnInfo[]) => {
  return inventoryTableData.filter((row) => {
    return Object.entries(filters).every(([groupKey, groupValues]) => {
      switch(groupKey) {
        case "display":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            if (enabled) {
              switch(filterKey) {
                case 'goldItems':
                  return (row.id >= 500 && row.id < 600)
                case 'silverItems':
                  return (row.id >= 400 && row.id < 500)
                case 'cupperItems':
                  return (row.id >= 300 && row.id < 400)
                case 'gems':
                  return (row.id < 300 || row.id == 800)
                case 'essentials':
                  return (row.id >= 600 && row.id < 700)
                case 'qp':
                  return row.id == 900
              }
            }
          })
        case "stockStatus":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            if (enabled) {
              switch(filterKey) {
                case 'inStock':
                  return (row.item.free >= 0)
                case 'outOfStock':
                  return (row.item.free < 0)
              }
            }
          })
      }

      return false
    })
  }).sort((a, b) => {
    const aValue = getTableData(a, sortColumn, columns)
    const bValue = getTableData(b, sortColumn, columns)
    if (aValue == bValue)
      return 0
    if (bValue > aValue)
      return -sortOrder
    else
      return sortOrder
  })
}

export const InventoryTable: FC<Prop> = (props) => {
  const classes = useStyles()
  const myRef = useRef<HTMLDivElement>()
  const headerRef = useRef<VariableSizeGrid>()
  const bodyRef = useRef<VariableSizeGrid>()
  const [ sortBy, setSortBy ] = useState(0)
  const [ sortOrder, setSortOrder ] = useState(1)
  const [ filterValues, setFilterValues ] = useState<FilterValues>(validateFilter(loadFilter("InventoryTable")))
  const [ tableSize, setTableSize ] = useState([1000, 800])
  const columns = fullColumns
  const tableData = filterAndSort(calcInventoryTableData(props.getInventoryStatus()), filterValues, sortBy, sortOrder, columns)

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
    if (getTableData(row, columnIndex, columns) != e.target.value) {
      const value = Number.parseInt(e.target.value)
      tableData[rowIndex].item.free += (value - tableData[rowIndex].item.stock)
      tableData[rowIndex].item.stock = value
      bodyRef.current.resetAfterColumnIndex(columnIndex)

      props.inventory[tableData[rowIndex].id] = value
      props.onChange(props.inventory)
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
    saveFilter("InventoryTable", newFilterValues)
  }

  const handleClickClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    const lines: string[] = []

    lines.push(columns.reduce((acc, column) => (acc + "\t" + column.label),""))
    tableData.forEach((data) => {
      lines.push(columns.reduce((acc, column, columnIndex) => (acc + "\t" + getTableData(data, columnIndex, columns)),""))
    })

    navigator.clipboard?.writeText(lines.reduce((acc, line) => (acc + line.slice(1) + '\n'),""))
  }

  const headerCell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]
    const labels = column.label.split(/\(/)

    return (
      <div style={{...style, textAlign: column.align == "right" ? "center" : column.align }} className={classes.head} onClick={() => handleClickColumn(columnIndex)}>
        {labels.map((label, index) => {
          if (index == 0 && sortBy == columnIndex) {
            return (sortOrder == 1) ? label + "▲" : label + "▼"
          } else {
            return index ? <span key={`inventoryTable-header-${columnIndex}-${index}`}><br />{'(' + label}</span> : label
          }
        })}
      </div>
    )
  }

  const cell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]
    const cellData = getTableData(tableData[rowIndex], columnIndex, columns)
    const [matchWord, charMain, charSub] = ((typeof(cellData) == 'string') && cellData.match(/^([^\s]+\s+[^\s]+)\s+(.*)$/)) || [ "", cellData, ""]
    if (column.editable)
      refs[rowIndex + "-" + columnIndex] = useRef()

    return (
      <div style={{...style, textAlign: column.align}} className={rowIndex % 2 ? classes.oddRowCell : classes.evenRowCell}>
        {column.editable ?
          <TextField defaultValue={cellData} size="small" inputRef={refs[rowIndex + "-" + columnIndex]}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {handleLostFocus(rowIndex, columnIndex, e)}}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {handleKeyPress(rowIndex, columnIndex, e)}}
                    type="number" InputProps={{ disableUnderline: true }}
                    inputProps={{min: 0, style: { textAlign: column.align, paddingTop: 2, paddingBottom: 0, fontSize: "0.875rem" }}} />
        : charSub ? <div>{charMain}<span style={{fontSize:"smaller"}}>&nbsp;{charSub}</span></div>
                : cellData
        }
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
              <Button onClick={() => showFilterDialog(filterValues, defaultFilterValues, filterDefinition, handleCloseFilter)}
              variant="contained"  color={Object.values(filterValues).some((group) => Object.values(group).some((value) => !value)) ? "secondary" : "default"} >
              フィルタ
            </Button>
          }
          </DialogProviderContext.Consumer>
        </Grid>
      </Grid>
      <VariableSizeGrid width={tableSize[0]} height={50} ref={headerRef}
        columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
        rowCount={1} rowHeight={() => (30)} style={{overflowX: "hidden", overflowY: "scroll"}}>
        {headerCell}
      </VariableSizeGrid>
      <VariableSizeGrid width={tableSize[0]} height={tableSize[1] - 50} ref={bodyRef}
        columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
        rowCount={tableData.length} rowHeight={() => (30)} onScroll={({scrollLeft}) => {headerRef.current.scrollTo({scrollLeft: scrollLeft, scrollTop: 0})}} >
        {cell}
      </VariableSizeGrid>
    </div>
  )
}