import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { AppBar, Menu, MenuItem, Toolbar, IconButton, Typography, Select, Link } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import { InventoryTable } from './../components/InventoryTable'
import { ServantTable } from './../components/ServantTable'
import { MSExchangeDialog } from './../components/MSExchangeDialog'

import { Inventory, InventoryStatus, validateInventory, importMSInventory, exportMSInventory, calcInventoryStatus } from './../../fgo/inventory'
import { Servants, validateServants, importMSServants, exportMSServants } from './../../fgo/servants'

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    toolbar: theme.mixins.toolbar,
    title: {
      flexGrow: 1
    },
    contents: {
      height: "calc(100vh - 64px)"
    },
    notice: {
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
  const [ selectedInfo, setSelectedInfo ] = useState(localStorage.getItem("selectedInfo") || "Inventory")
  const [ openMSExchangeDialog, setOpenMSExchangeDialog ] = useState(false)

  const updateInventoryTable = () => {
    setInventoryTableKey(inventoryTableKey + 1)
  }
  const updateServantTable = () => {
    setServantTableKey(servantTableKey + 1)
  }

  const handleSelectedInfoChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedInfo(e.target.value)
    localStorage.setItem("selectedInfo", e.target.value)
  }

  const inventory: Inventory = validateInventory(JSON.parse(localStorage.getItem("inventory")))
  const handleInventoryChanged = (inventory: Inventory) => {
    localStorage.setItem("inventory", JSON.stringify(inventory))
  }

  const servants: Servants = validateServants(JSON.parse(localStorage.getItem("servants")))
  const handleServantChanged = (servants) => {
    localStorage.setItem("servants", JSON.stringify(servants))
    inventoryStatus = calcInventoryStatus(inventory, servants)
  }

  let inventoryStatus: InventoryStatus = calcInventoryStatus(inventory, servants)
  const getInventoryStatus = () => inventoryStatus

  const handleImportExport = () => {
    setOpenMSExchangeDialog(true)
    closeMenu()
  }
  const handleCloseMSExchangeDialog = () => {
    setOpenMSExchangeDialog(false)
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

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const closeMenu = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <div className={classes.toolbar}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" aria-label="menu" aria-controls="main-menu" onClick={handleMenuClick}>
              <MenuIcon />
            </IconButton>
            <Menu id="main-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
              <MenuItem onClick={handleImportExport}>インポート/エクスポート</MenuItem>
            </Menu>
            <Typography variant="h6" className={classes.title}>
              Chaldea Data Viewer
            </Typography>
            <Select label="表示対象" value={selectedInfo} onChange={handleSelectedInfoChanged}>
              <MenuItem value={"Inventory"}>所持アイテム</MenuItem>
              <MenuItem value={"Servants"}>サーヴァント</MenuItem>
            </Select>
          </Toolbar>
        </AppBar>
      </div>
      <div className={classes.contents}>
        {selectedInfo == "Inventory" && <InventoryTable key={`inventoryTable-${inventoryTableKey}`} onChange={handleInventoryChanged} inventory={inventory} getInventoryStatus={getInventoryStatus} />}
        {selectedInfo == "Servants" && <ServantTable key={`servantTable-${servantTableKey}`} onChange={handleServantChanged} servants={servants} />}
        {openMSExchangeDialog && <MSExchangeDialog open={openMSExchangeDialog} onClose={handleCloseMSExchangeDialog}
                                    onImportServants={handleImportServants} onExportServants={handleExportServants}
                                    onImportInventory={handleImportInventory} onExportInventory={handleExportInventory}
                                 />}
      </div>
    </>
  )
}