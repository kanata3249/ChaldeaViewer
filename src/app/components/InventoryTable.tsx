import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@material-ui/core'

import { Inventory, InventoryStatus, ItemStatus, materialNames, calcInventoryStatus } from './../../fgo/inventory'
import { Servants,  } from './../../fgo/servants'

type Prop = {
  inventory: Inventory
  servants: Servants
  onChange(id: number, value: number): void
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

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    container: {
      maxHeight: "calc(100vh - 64px - 32px)"    // find another way to limit heght.
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

const calcInventoryTableData = (inventory: Inventory, servants: Servants): InventoryTableData[] => {
  const inventoryStatus = calcInventoryStatus(inventory, servants)
  return Object.keys(inventory).map((itemId) => (
    { id: Number.parseInt(itemId), name: materialNames[itemId], item: inventoryStatus[itemId] } 
  ))
}

export const InventoryTable: FC<Prop> = (props) => {
  const classes = useStyles()

  const [ inventoryTableData, setInventoryTableData ] = useState(calcInventoryTableData(props.inventory, props.servants))
  const [ sortBy, setSortBy ] = useState(0)
  const [ sortOrder, setSortOrder ] = useState(1)

  console.log(inventoryTableData)

  const handleClickColumn = (column: number) => {
    let newSortOrder = -sortOrder
    if (sortBy != column) {
      newSortOrder = 1
      setSortBy(column)
    }
    setSortOrder(newSortOrder)
    inventoryTableData.sort((a, b) => {
      const aValue = getTableData(a, column)
      const bValue = getTableData(b, column)
      if (aValue == bValue)
        return 0
      if (bValue > aValue)
        return -newSortOrder
      else
        return newSortOrder
    })
  }

  const handleStockChanged = (rowIndex: number, value: number) => {
    if (!Number.isNaN(value)) {
      inventoryTableData[rowIndex].item.free += (value - inventoryTableData[rowIndex].item.stock)
      inventoryTableData[rowIndex].item.stock = value

      setInventoryTableData(JSON.parse(JSON.stringify(inventoryTableData)))
      props.onChange(inventoryTableData[rowIndex].id, value)
    }
  }

  return (
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
          {Object.keys(materialNames).map((itemId, rowIndex) => (
            <TableRow key={`${itemId}-${rowIndex}`} className={classes.row} >
              {columns.map((column, columnIndex) =>
                <TableCell className={classes.cell} key={`${itemId}-${rowIndex}-${columnIndex}`} align={column.align} width={column.width} size="small">
                  {column.editable ?
                    <TextField value={getTableData(inventoryTableData[rowIndex], columnIndex)} size="small"
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {handleStockChanged(rowIndex, Number.parseInt(e.target.value))}}
                               onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}}
                               type="number" InputProps={{ disableUnderline: true }} inputProps={{ min: 0, style: { textAlign: column.align, paddingTop: 2, paddingBottom: 0, fontSize: "0.875rem" }}} />
                    : getTableData(inventoryTableData[rowIndex], columnIndex)
                  }
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}