import React, { FC, useState, useEffect, useRef } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { isAndroid } from 'react-device-detect'

import { Grid, Button, TextField, FormControlLabel, Checkbox } from '@material-ui/core'
import { VariableSizeGrid } from 'react-window'

import { Costumes, Costume, servantNames } from '../../fgo/servants'
import { InventoryStatus, itemNames } from '../../fgo/inventory'

import { DialogProviderContext } from './DialogProvider'
import { FilterDefinition, FilterValues } from './FilterDialog'
import { saveFilter, loadFilter, saveModifyInventory, loadModifyInventory } from '../storage'

type Prop = {
  costumes: Costumes
  onChange(costumes: Costumes): void
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
  type?: "number" | "string" | "boolean"
  min?: number
  max?: number
  button?: boolean
  buttonLabel?: string
  step?: number
}

type CostumeTableData = {
  id: number
  index: number
  name: string
  servantId: number
  onsale: boolean
  reserved: boolean
  purchased: boolean
  itemIds: number[]
  itemNames: string[]
  itemAmounts: number[]
  qp: number
}

const columns : TableColumnInfo[] = [
  { label: 'ID', key: 'id', align: "left", width: 80 },
  { label: '名称', key: 'name', align: "left", width: 360},
  { label: '対象', key: 'servantName', align: "left", width: 300 },
  { label: '素材1', key: 'itemName1', align: "left", width: 110 },
  { label: '数', key: 'itemAmount1', align: "right", width: 40 },
  { label: '素材2', key: 'itemName2', align: "left", width: 110 },
  { label: '数', key: 'itemAmount2', align: "right", width: 40 },
  { label: '素材3', key: 'itemName3', align: "left", width: 110 },
  { label: '数', key: 'itemAmount3', align: "right", width: 40 },
  { label: '素材4', key: 'itemName4', align: "left", width: 110 },
  { label: '数', key: 'itemAmount4', align: "right", width: 40 },
  { label: 'QP', key: 'qp', align: "right", width: 60 },
  { label: '購入可能', key: 'onsale', align: "center", width: 80, editable: true, type: "boolean" },
  { label: '購入予定', key: 'reserved', align: "center", width: 80, editable: true, type: "boolean" },
  { label: '購入済み', key: 'purchased', align: "center", width: 80, editable: true, type: "boolean" },
]

const getTableData = (costumeTableData: CostumeTableData, columnIndex: number, sort?: boolean) => {
  const key = columns[columnIndex].key
  const row = costumeTableData

  switch (key) {
    case 'onsale':
    case 'reserved':
    case 'purchased':
      if (row.itemAmounts.length) {
        return row[key]
      } else {
        return null
      }

    case 'itemName1':
      return row.itemNames[0]
    case 'itemName2':
      return row.itemNames[1]
    case 'itemName3':
      return row.itemNames[2]
    case 'itemName4':
      return row.itemNames[3]
    case 'itemAmount1':
      return row.itemAmounts[0]
    case 'itemAmount2':
      return row.itemAmounts[1]
    case 'itemAmount3':
      return row.itemAmounts[2]
    case 'itemAmount4':
      return row.itemAmounts[3]
    case 'qp':
      return row.qp || ""
    case 'servantName':
      return servantNames[row.servantId]
    default:
      return row[key]
  }
}

const updateInventory = (costume: CostumeTableData, newState: boolean, oldState: boolean, inventoryStatus: InventoryStatus) => {
  const inc = !newState && oldState

  if (newState != oldState) {
    costume.itemIds.forEach((itemId, index) => {
      inventoryStatus[itemId].stock += (inc ? 1 : -1) * costume.itemAmounts[index]
    })
    return true
  }
  return false
}

const filterDefinition: FilterDefinition[] = [
  {
    name: "販売状態", key: "sale", type: "check",
    buttons: [
      { label: "購入不可", key: "notonsale" },
      { label: "購入可", key: "onsale" },
    ]
  },
  {
    name: "購入状態", key: "purchase", type: "check",
    buttons: [
      { label: "予定なし", key: "notreserved" },
      { label: "購入予定", key: "reserved" },
      { label: "購入済み", key: "purchased" },
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

const calcTableData = (costumes: Costumes): CostumeTableData[] => {
  const sortkey = (row) => row.id

  return costumes.map((costume, index) => {
    const itemIds = Object.keys(costume.spec.items).map((key) => Number(key))
    const itemAmounts = Object.values(costume.spec.items)
    return { id: costume.spec.id, name: costume.spec.name, index,
      servantId: costume.spec.servantId,
      onsale: costume.onsale, reserved: costume.reserved, purchased: costume.purchased,
      itemIds, itemNames: itemIds.map((id) => itemNames[id]), itemAmounts,
      qp: costume.spec.items[900] * 10000
    } 
  }).sort((a, b) => {
    return sortkey(a) - sortkey(b)
  })
}

const calcSummary = (costumes: Costumes) => {
  return costumes.reduce((acc, costume) => {
    acc.costumes++
    costume.onsale && acc.onsale++
    costume.reserved && !costume.purchased && acc.reserved++
    costume.purchased && acc.purchased++

    return acc
  }, { costumes: 0, onsale: 0, reserved: 0, purchased: 0 })
}

const filterAndSort = (costumeTableData: CostumeTableData[], filters: FilterValues, sortColumn: number, sortOrder: number) => {
  return costumeTableData.filter((row) => {
    return Object.entries(filters).every(([groupKey, groupValues]) => {
      switch(groupKey) {
        case "sale":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            return enabled && ((filterKey == "onsale") === row.onsale)
          })
        case "purchase":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            switch (filterKey) {
            case 'notreserved':
              return enabled && !row.reserved && !row.purchased
            case 'reserved':
            case 'purchased':
              return enabled && row[filterKey]
            }
          })
        default:
          return false
      }
    })
  }).sort((a, b) => {
    let aValue = getTableData(a, sortColumn, true)
    let bValue = getTableData(b, sortColumn, true)

    if (aValue == bValue)
      return 0
    if (bValue > aValue)
      return -sortOrder
    else
      return sortOrder
  })
}

export const CostumeTable: FC<Prop> = (props) => {
  const classes = useStyles()
  const myRef = useRef<HTMLDivElement>()
  const headerRef = useRef<VariableSizeGrid>()
  const bodyRef = useRef<VariableSizeGrid>()
  const [ tableKey, setTableKey ] = useState(0)
  const [ sortBy, setSortBy ] = useState(0)
  const [ sortOrder, setSortOrder ] = useState(1)
  const [ filterValues, setFilterValues ] = useState<FilterValues>(validateFilter(loadFilter("CostumeTable")))
  const [ tableSize, setTableSize ] = useState([1000, 800])
  const tableData = filterAndSort(calcTableData(props.costumes), filterValues, sortBy, sortOrder)
  const summary = calcSummary(props.costumes)
  let modifyInventory = loadModifyInventory('CostumeTable')
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

  const handleCloseFilter = (newFilterValues: FilterValues) => {
    setFilterValues(newFilterValues)
    saveFilter("CostumeTable", newFilterValues)
  }

  const handleCheckChanged = (rowIndex: number, columnIndex: number, checked: boolean) => {
    props.costumes[tableData[rowIndex].index][columns[columnIndex].key] = checked
    if (columns[columnIndex].key == 'purchased' && modifyInventory) {
      const inventoryStatus = props.getInventoryStatus()
      if (updateInventory(tableData[rowIndex], checked, tableData[rowIndex].purchased, inventoryStatus)) {
        props.setInventoryStatus(inventoryStatus)
      }
    }
    props.onChange(props.costumes)
    setTableKey(tableKey + 1)
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
    saveModifyInventory('CostumeTable', modifyInventory)
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
    if (column.type == "boolean") {
      if (cellData === null) {
      } else {
        return <Checkbox defaultChecked={cellData} size="small" inputRef={ref} color="default" disableRipple={true} style={{ padding: 0 }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {handleCheckChanged(rowIndex, columnIndex, checked)}} />
      }
    }
  }

  const cell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]
    const cellData = getTableData(tableData[rowIndex], columnIndex)
    const [matchWord, charMain, charSub] = ((typeof(cellData) == 'string') && cellData.match(/^([^\s]+\s+[^\s]+)\s+(.*)$/)) || [ "", cellData, ""]

    return (
      <div style={{...style, textAlign: column.align }} className={rowIndex % 2 ? classes.oddRowCell : classes.evenRowCell}>
        {column.editable ?
          editableCell(columnIndex, rowIndex)
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
          { `実装: ${summary.costumes} 販売中: ${summary.onsale} 購入予定: ${summary.reserved} 購入済み: ${summary.purchased} フィルタ: ${tableData.length}`}
        </Grid>
        <Grid item>
          <Button onClick={handleClickRecalc} variant="outlined" >再計算</Button>
        </Grid>
        <Grid item>
          <FormControlLabel control={<Checkbox name="checkedC" defaultChecked={modifyInventory} onChange={handleModifyInventory} />}
                            label="購入状態変更時に所持数に反映" />
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