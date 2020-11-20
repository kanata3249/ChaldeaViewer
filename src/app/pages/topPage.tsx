import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { AppBar, Menu, MenuItem, Toolbar, IconButton, Typography, Link } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import { InventoryTable } from './../components/InventoryTable'

import { Inventory, validateInventory } from './../../fgo/inventory'

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    toolbar: theme.mixins.toolbar,
    contents: {
      maxHeight: "calc(100vh - 64px - 32px)"
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

  const [ inventoryTableKey, setInventoryTableKey ] = useState(0)

  const updateInventoryTable = () => {
    setInventoryTableKey(inventoryTableKey + 1)
  }

  const inventory: Inventory = validateInventory(JSON.parse(localStorage.getItem("inventory")))
  const handleInventoryChanged = (itemId: number, value: number) => {
    inventory[itemId] = value
    localStorage.setItem("inventory", JSON.stringify(inventory))
  }

  return (
    <>
      <div className={classes.toolbar}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" aria-label="menu" aria-controls="main-menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">
              Chaldea Status
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className={classes.contents}>
        <InventoryTable key={inventoryTableKey} onChange={handleInventoryChanged} inventory={inventory} />
      </div>
      <div className={classes.notice}>
      </div>
    </>
  )
}