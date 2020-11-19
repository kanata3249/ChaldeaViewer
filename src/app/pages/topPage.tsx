import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { AppBar, Menu, MenuItem, Toolbar, IconButton, Typography, Link } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    toolbar: theme.mixins.toolbar,
    contents: {
      maxWidth: 1000
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
      </div>
      <div className={classes.notice}>
      </div>
    </>
  )
}