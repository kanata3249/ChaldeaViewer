import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Grid } from '@material-ui/core'

import { Inventory, InventoryStatus, ItemStatus, itemNames } from './../../fgo/inventory'

import { FilterDialog, FilterDefinition, FilterValues } from './FilterDialog'

type Prop = {
  inventory: Inventory
  onChange(inventory: Inventory): void
  getInventoryStatus(): InventoryStatus
}

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: string
  formatter?: (value: number) => string
  span?: number
  editable?: boolean
}

type InventoryTableData = {
  id: number
  name: string
  item: ItemStatus
}

const columns : TableColumnInfo[] = [
  { label: 'ID', key: 'id', align: "right", width: "5%" },
  { label: '名称', key: 'name', align: "left", width: "20% "},
  { label: '所持数', key: 'stock', align: "right", width: "10%", editable: true },
  { label: '使用予定', key: 'reserved', align: "right", width: "10%" },
  { label: '使用可能', key: 'free', align: "right", width: "10%" },
  { label: '使用済み', key: 'used', align: "right", width: "10%" },
  { label: '必要数(実装済)', key: 'required', align: "right", width: "10%" },
  { label: '必要数(召喚)', key: 'summoned', align: "right", width: "10%" },
  { label: '残必要数(実装済)', key: 'remain', align: "right", width: "10%" },
  { label: '残必要数(召喚)', key: 'remainSummoned', align: "right", width: "10%" },
]

const getTableData = (inventoryTableData: InventoryTableData, columnIndex: number) => {
  const key = columns[columnIndex].key
  const sum = (key: string) => Object.values<number>(inventoryTableData.item[key]).reduce((acc, value) => acc + value)

  switch (key) {
    case 'id':
    case 'name':
      return inventoryTableData[key]
    case 'required':
    case 'summoned':
    case 'used':
    case 'reserved':
      return sum(key)
    case 'remain':
      return Math.max(sum('required') - sum('used') - inventoryTableData.item.stock, 0)
    case 'remainSummoned':
      return Math.max(sum('summoned') - sum('used') - inventoryTableData.item.stock, 0)
    default:
      return inventoryTableData.item[key]
  }
}

const filterDefinition: FilterDefinition[] = [
  {
    name: "表示対象", key: "display", type: "check",
    buttons: [
      { label: "再臨素材", key: "items" },
      { label: "モニュピ", key: "essentials" },
      { label: "秘石等", key: "gems" },
    ]
  }
]
const defaultFilterValues: FilterValues = {
  "display": {
    "items": true,
    "essentials": true,
    "gems": true,
  }
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    controller: {
      width: "100%",
      height: 48,
      marginRight: 8
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
  })
)

const calcInventoryTableData = (inventoryStatus: InventoryStatus): InventoryTableData[] => {
  return Object.keys(inventoryStatus).map((itemId) => (
    { id: Number.parseInt(itemId), name: itemNames[itemId], item: inventoryStatus[itemId] } 
  ))
}

const filterAndSort = (inventoryTableData: InventoryTableData[], filters: FilterValues, sortColumn: number, sortOrder: number) => {
  return inventoryTableData.filter((row) => {
    return Object.entries(filters).every(([groupKey, groupValues]) => {
      switch(groupKey) {
        case "display":
          return Object.entries(groupValues).some(([filterKey, enabled]) => {
            if (enabled) {
              switch(filterKey) {
                case 'items':
                  return (row.id >= 300 && row.id < 600)
                case 'gems':
                  return (row.id < 300 || row.id == 800)
                case 'essentials':
                  return (row.id >= 600 && row.id < 700)
              }
            }
          })
      }

      return false
    })
  }).sort((a, b) => {
    const aValue = getTableData(a, sortColumn)
    const bValue = getTableData(b, sortColumn)
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

  const [ sortBy, setSortBy ] = useState(0)
  const [ sortOrder, setSortOrder ] = useState(1)
  const [ filterValues, setFilterValues ] = useState<FilterValues>(defaultFilterValues)
  const [ openFilterDialog, setOpenFilterDialog ] = useState(false)
  const [ tableKey, setTableKey ] = useState(0)
  const tableData = filterAndSort(calcInventoryTableData(props.getInventoryStatus()), filterValues, sortBy, sortOrder)

  const handleClickColumn = (column: number) => {
    let newSortOrder = -sortOrder
    if (sortBy != column) {
      newSortOrder = 1
      setSortBy(column)
    }
    setSortOrder(newSortOrder)
  }

  const handleStockChanged = (rowIndex: number, value: number) => {
    if (!Number.isNaN(value)) {
      tableData[rowIndex].item.free += (value - tableData[rowIndex].item.stock)
      tableData[rowIndex].item.stock = value
      setTableKey(tableKey + 1)

      props.inventory[tableData[rowIndex].id] = value
      props.onChange(props.inventory)
    }
  }

  const handleClickFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenFilterDialog(true)
  }

  const handleCloseFilter = (newFilterValues: FilterValues) => {
    setFilterValues(newFilterValues)
    setOpenFilterDialog(false)
  }

  const handleClickClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    const lines: string[] = []

    lines.push(columns.reduce((acc, column) => (acc + "\t" + column.label),""))
    tableData.forEach((data) => {
      lines.push(columns.reduce((acc, column, columnIndex) => (acc + "\t" + getTableData(data, columnIndex)),""))
    })

    navigator.clipboard?.writeText(lines.reduce((acc, line) => (acc + line.slice(1) + '\n'),""))
  }

  return (
    <div>
      <Grid container className={classes.controller} justify="flex-end" alignItems="center" spacing={1} >
        <Grid item>
          <Button onClick={handleClickClipboard} variant="outlined" >クリップボードにコピー</Button>
        </Grid>
        <Grid item>
          <Button onClick={handleClickFilter} variant="contained" >フィルタ</Button>
        </Grid>
      </Grid>
      <TableContainer className={classes.container}>
        <Table stickyHeader>
          <TableHead>
            <TableRow key="label">
              {columns.map((column, idx) =>
                <TableCell className={classes.head} key={idx} width={column.width} onClick={() => handleClickColumn(idx)}>
                  {(sortBy == idx) ? ((sortOrder == 1) ? column.label + "▲" : column.label + "▼") : column.label}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((tableDataRow, rowIndex) => (
              <TableRow key={`${tableDataRow.id}-${rowIndex}`} className={classes.row} >
                {columns.map((column, columnIndex) =>
                  <TableCell className={classes.cell} key={`${tableDataRow.id}-${rowIndex}-${columnIndex}`} align={column.align} width={column.width} size="small">
                    {column.editable ?
                      <TextField value={getTableData(tableDataRow, columnIndex)} size="small"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {handleStockChanged(rowIndex, Number.parseInt(e.target.value))}}
                                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}}
                                type="number" InputProps={{ disableUnderline: true }} inputProps={{ min: 0, style: { textAlign: column.align, paddingTop: 2, paddingBottom: 0, fontSize: "0.875rem" }}} />
                      : getTableData(tableData[rowIndex], columnIndex)
                    }
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <FilterDialog open={openFilterDialog} values={filterValues} defaultValues={defaultFilterValues} filterDefinition={filterDefinition} onClose={handleCloseFilter} />
      </TableContainer>
    </div>
  )
}