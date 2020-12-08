import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { AppBar, Menu, MenuItem, Toolbar, IconButton, Typography, Select, Link } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import { InventoryTable } from './../components/InventoryTable'
import { ServantTable } from './../components/ServantTable'
import { ServantSpecTable } from './../components/ServantSpecTable'
import { DialogProvider, DialogProviderContext } from '../components/DialogProvider'

import { Inventory, InventoryStatus, importMSInventory, exportMSInventory, calcInventoryStatus } from './../../fgo/inventory'
import { Servants, importMSServants, exportMSServants } from './../../fgo/servants'
import { createBackup, restoreBackup, saveSelectedInfo, loadSelectedInfo, saveServants, loadServants, saveInventory, loadInventory } from '../storage'

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    toolbar: theme.mixins.toolbar,
    title: {
      flexGrow: 1
    },
    contents: {
      height: "calc(100vh - 64px - 20px)"
    },
    notice: {
      height: 20,
      marginLeft: 10,
    }
  }))

export const TopPage: FC = () => {
  const classes = useStyles()

  const theme = useTheme();
  const isPC = () => {
    return useMediaQuery(theme.breakpoints.up('xl'));
  }

  const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null)
  const [ inventoryTableKey, setInventoryTableKey ] = useState(0)
  const [ servantTableKey, setServantTableKey ] = useState(0)
  const [ selectedInfo, setSelectedInfo ] = useState(loadSelectedInfo())
  const [ openMSExchangeDialog, setOpenMSExchangeDialog ] = useState(false)

  const updateInventoryTable = () => {
    setInventoryTableKey(inventoryTableKey + 1)
  }
  const updateServantTable = () => {
    setServantTableKey(servantTableKey + 1)
  }

  const handleSelectedInfoChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedInfo(e.target.value)
    saveSelectedInfo(e.target.value)
  }

  const inventory: Inventory = loadInventory()
  const handleInventoryChanged = (inventory: Inventory) => {
    saveInventory(inventory)
  }

  const servants: Servants = loadServants()
  const handleServantChanged = (servants) => {
    saveServants(servants)
    inventoryStatus = calcInventoryStatus(inventory, servants)
  }

  let inventoryStatus: InventoryStatus = calcInventoryStatus(inventory, servants)
  const getInventoryStatus = () => inventoryStatus
  const setInventoryStatus = (newInventoryStatus: InventoryStatus) => {
    const newInventory = Object.entries(newInventoryStatus).reduce<Inventory>((acc, [id, status]) => {
      acc[id] = status.stock
      return acc
    },{})
    saveInventory(newInventory)
    Object.assign(inventory, newInventory)
    inventoryStatus = calcInventoryStatus(inventory, servants)
  }

  const handleImportServants = (json: string) => {
    try {
      handleServantChanged(importMSServants(json))
      updateInventoryTable()
      updateServantTable()
    } catch(e) {
      alert("読み込みに失敗しました")
    }
  }
  const handleExportServants = () => {
    return exportMSServants(servants)
  }
  const handleImportInventory = (json: string) => {
    try {
      handleInventoryChanged(importMSInventory(json))
      updateInventoryTable()
    } catch(e) {
      alert("読み込みに失敗しました")
    }
  }
  const handleExportInventory = () => {
    return exportMSInventory(inventory)
  }

  const handleBackup = () => {
    const backup = createBackup()
    const jsonURL = window.URL.createObjectURL(new Blob([backup], { type: 'text/json' }))
    const link = document.createElement('a')
    document.body.appendChild(link)
    link.href = jsonURL
    link.setAttribute('download', 'chalde_backup.json')
    link.click()
    document.body.removeChild(link)

    closeMenu()
  }

  const handleRestore = () => {
    interface HTMLElementEvent<T extends HTMLElement> extends Event {
      target: T
    }

    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('type', 'file')
    fileSelector.setAttribute('accept', 'text/json')
    fileSelector.addEventListener("change", (inputEvent: HTMLElementEvent<HTMLInputElement>) => {
      const reader = new FileReader()

      reader.addEventListener("load", (evt) => {
        if (restoreBackup(reader.result as string)) {
          updateInventoryTable()
          updateServantTable()
        }
      })
      reader.readAsText(inputEvent.target.files[0])
    })
    fileSelector.click()
  
    closeMenu()
  }

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const closeMenu = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <DialogProvider>
        <div className={classes.toolbar}>
          <AppBar>
            <Toolbar>
              <IconButton edge="start" aria-label="menu" aria-controls="main-menu" onClick={handleMenuClick}>
                <MenuIcon />
              </IconButton>
              <Menu id="main-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                <DialogProviderContext.Consumer>
                  {({showMSExchangeDialog}) =>
                    <MenuItem onClick={() => {
                      showMSExchangeDialog(handleImportInventory, handleExportInventory, handleImportServants, handleExportServants)
                      closeMenu()}}>
                      インポート/エクスポート
                    </MenuItem>
                  }
                </DialogProviderContext.Consumer>
                <MenuItem onClick={handleBackup}>データバックアップ</MenuItem>
                <MenuItem onClick={handleRestore}>データリストア</MenuItem>
              </Menu>
              <Typography variant="h6" className={classes.title}>
                Chaldea Viewer
              </Typography>
              <Select label="表示対象" value={selectedInfo} onChange={handleSelectedInfoChanged}>
                <MenuItem value={"Inventory"}>所持アイテム</MenuItem>
                <MenuItem value={"Servants"}>サーヴァント育成</MenuItem>
                <MenuItem value={"ServantsSpec"}>サーヴァント性能</MenuItem>
              </Select>
            </Toolbar>
          </AppBar>
        </div>
        <div className={classes.contents}>
          {selectedInfo == "Inventory" && <InventoryTable key={`inventoryTable-${inventoryTableKey}`} onChange={handleInventoryChanged} inventory={inventory} getInventoryStatus={getInventoryStatus} />}
          {selectedInfo == "Servants" && <ServantTable key={`servantTable-${servantTableKey}`} onChange={handleServantChanged} servants={servants} getInventoryStatus={getInventoryStatus} setInventoryStatus={setInventoryStatus} />}
          {selectedInfo == "ServantsSpec" && <ServantSpecTable key={`servantSpecTable-${servantTableKey}`} onChange={handleServantChanged} servants={servants} getInventoryStatus={getInventoryStatus} />}
        </div>
        <div className={classes.notice}>
        サーヴァントデータなど大部分は<Link href="https://w.atwiki.jp/f_go/" target="blank">Fate/Grand Order @wiki 【FGO】</Link>を参考にさせていただいています。
        </div>
      </DialogProvider>
    </>
  )
}