import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import { VariableSizeGrid } from 'react-window'


import { Servant, servantNames, servantClassNames } from '../../fgo/servants'
import { InventoryStatus, itemNames } from '../../fgo/inventory'

type Prop = {
  servant: Servant
  inventoryStatus: InventoryStatus

  open: boolean
  onClose(): void
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    title: {
      margin: 0,
      paddingTop: 2,
      paddingBottom: 2,
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

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: number
  formatter?: (value: number) => string
}

type ServantItemsTableData = {
  id: number
  name: string
  required: number
  used: number
  remain: number
  stock: number
  free: number
}

const columns : TableColumnInfo[] = [
  { label: '名称', key: 'name', align: "left", width: 150 },
  { label: '必要数', key: 'required', align: "right", width: 60 },
  { label: '残数', key: 'remain', align: "right", width: 60 },
  { label: '使用可', key: 'free', align: "right", width: 60 },
  { label: '所持', key: 'stock', align: "right", width: 60 },
  { label: '不足', key: 'shortage', align: "right", width: 60 },
]

const getTableData = (tableData: ServantItemsTableData, columnIndex: number) => {
  const key = columns[columnIndex].key

  switch (key) {
    case 'name':
    case 'required':
    case 'used':
    case 'remain':
    case 'stock':
    case 'free':
      return tableData[key]
    case 'shortage':
      return Math.max(0, tableData.remain - tableData.free)
  }
}

const sort = (tableData: ServantItemsTableData[], sortColumn: number, sortOrder: number) => {
  return tableData.sort((a, b) => {
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

const createServantItemsTableData = (servant: Servant, inventoryStatus: InventoryStatus): ServantItemsTableData[] => {
  if (!servant)
    return []
  return Object.entries(servant.itemCounts)
            .filter(([itemId, counts]) => itemId != "800")
            .map<ServantItemsTableData>(([itemId, counts]) => {
    const required = Object.values(counts.required).reduce((acc, value) => acc + value)
    const used = Object.values(counts.used).reduce((acc, value) => acc + value)
    const reserved = Object.values(counts.reserved).reduce((acc, value) => acc + value)
    return {
      id: Number.parseInt(itemId),
      name: itemNames[itemId],
      required,
      used,
      remain: required - used,
      stock: inventoryStatus[itemId].stock,
      free: inventoryStatus[itemId].free + reserved
    }
  })
}

export const ServantItemsDialog: FC<Prop> = (props) => {
  const classes = useStyles()
  const [ sortBy, setSortBy ] = useState(columns.length - 1)
  const [ sortOrder, setSortOrder ] = useState(-1)
  const [ tableSize, setTableSize ] = useState([480, 200])
  const tableData: ServantItemsTableData[] = sort(createServantItemsTableData(props.servant, props.inventoryStatus), sortBy, sortOrder)

  const handleClose = () => {
    props.onClose()
  }

  const handleClickColumn = (column: number) => {
    let newSortOrder = -sortOrder
    if (sortBy != column) {
      newSortOrder = 1
      setSortBy(column)
    }
    setSortOrder(newSortOrder)
  }

  const headerCell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]

    return (
      <div style={{...style, textAlign: column.align}} className={classes.head}  onClick={() => handleClickColumn(columnIndex)} >
        {(sortBy == columnIndex) ? ((sortOrder == 1) ? column.label + "▲" : column.label + "▼") : column.label}
      </div>
    )
  }

  const cell = ({columnIndex, rowIndex, style }) => {
    const column = columns[columnIndex]
    const cellData = getTableData(tableData[rowIndex], columnIndex)

    return (
      <div style={{...style, textAlign: column.align}} className={rowIndex % 2 ? classes.oddRowCell : classes.evenRowCell} >
        {cellData}
      </div>
    )
  }

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.title} id="form-dialog-title">{`必要素材${props.servant ? ` - ${servantNames[props.servant.id]} (${servantClassNames[props.servant.servantInfo.class]})` : ""}`}</DialogTitle>
        <DialogContent>
          {props.servant && (
            <>
              <VariableSizeGrid width={tableSize[0]} height={30}
                columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
                rowCount={1} rowHeight={() => (30)} >
                {headerCell}
              </VariableSizeGrid>
              <VariableSizeGrid width={tableSize[0]} height={tableSize[1] - 30} scrollOffset={0}
                columnCount={columns.length} columnWidth={(columnIndex) => columns[columnIndex].width}
                rowCount={tableData.length} rowHeight={() => (30)} >
                {cell}
              </VariableSizeGrid>
            </>)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}