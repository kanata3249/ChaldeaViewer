import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@material-ui/core'
import { Select, MenuItem } from '@material-ui/core'

type Prop = {
  open: boolean
  onClose(): void
  onImportInventory(json: string): void
  onExportInventory(): string
  onImportServants(json: string): void
  onExportServants(): string
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
  })
)

export const MSExchangeDialog: FC<Prop> = (props) => {
  const classes = useStyles()

  const [ targetData, setTargetData ] = useState("Inventory")
  const [ direction, setDirection ] = useState("Import")
  let inputCode = ""

  const textLabel = {
    "Inventory": {
      "Import": "アイテム引継ぎコードを入力してください",
      "Export": "",
    },
    "Servants": {
      "Import": "サーヴァント引継ぎコードを入力してください",
      "Export": "",
    }
  }

  const exportCode = (() => {
    if (direction == "Export") {
      if (targetData == "Inventory")
        return props.onExportInventory()
      else
        return props.onExportServants()
    }
    return ""
  })()

  const canExecute = () => {
    if (direction == "Import") {
      return true
    } else {
      return false
    }
  }
  const handleClose = () => {
    props.onClose()
  }
  const handleExecute = () => {
    // TODO validate input code
    if (targetData == "Inventory") {
      props.onImportInventory(inputCode)
    } else {
      props.onImportServants(inputCode)
    }
  }
  const handleTargetDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetData(e.target.value)
  }
  const handleDirectionChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirection(e.target.value)
  }
  const handleCodeChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    inputCode = e.target.value
  }

  return (
    <div>
      <Dialog open={true} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">データインポート/エクスポート</DialogTitle>
        <DialogContent>
          <DialogActions>
          <Select label="対象" value={targetData} onChange={handleTargetDataChanged} >
              <MenuItem value={"Inventory"}>所持アイテム情報</MenuItem>
              <MenuItem value={"Servants"}>サーヴァント情報</MenuItem>
            </Select>
            をMaterial Simulator
            <Select label="操作" value={direction} onChange={handleDirectionChanged} >
              <MenuItem value={"Export"}>へエクスポート</MenuItem>
              <MenuItem value={"Import"}>からインポート</MenuItem>
            </Select>
          </DialogActions>
          <TextField label={textLabel[targetData][direction]} rows={10} multiline fullWidth defaultValue={exportCode} variant="outlined" onChange={handleCodeChanged} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExecute} variant="outlined" disabled={!canExecute()}>
            実行
          </Button>
          <Button onClick={handleClose} variant="outlined">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}