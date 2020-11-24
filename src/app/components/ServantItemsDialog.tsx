import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@material-ui/core'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { Paper, Grid } from '@material-ui/core'

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
    container: {
    },
    head: {
    },
    row: {
    },
    cell: {
    }
  })
)

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: string
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
  { label: '名称', key: 'name', align: "left", width: "20% "},
  { label: '必要数', key: 'required', align: "right", width: "10%" },
  { label: '使用済', key: 'used', align: "right", width: "10%" },
  { label: '残数', key: 'remain', align: "right", width: "10%" },
  { label: '使用可', key: 'free', align: "right", width: "10%" },
  { label: '所持数', key: 'stock', align: "right", width: "10%" },
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
  }
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

  const tableData: ServantItemsTableData[] = createServantItemsTableData(props.servant, props.inventoryStatus)

  const handleClose = () => {
    props.onClose()
  }

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{`必要素材${props.servant ? ` - ${servantNames[props.servant.id]} (${servantClassNames[props.servant.servantInfo.class]})` : ""}`}</DialogTitle>
        <DialogContent>
          {props.servant && (
            <TableContainer className={classes.container}>
            <Table stickyHeader>
              <TableHead>
                <TableRow key="label">
                  {columns.map((column, idx) =>
                    <TableCell className={classes.head} key={idx} width={column.width} >
                      {column.label}
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((tableDataRow, rowIndex) => (
                  <TableRow key={`${tableDataRow.id}-${rowIndex}`} className={classes.row} >
                    {columns.map((column, columnIndex) =>
                      <TableCell className={classes.cell} key={`${tableDataRow.id}-${rowIndex}-${columnIndex}`} align={column.align} width={column.width} size="small">
                        {getTableData(tableData[rowIndex], columnIndex)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
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