import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Popover } from '@material-ui/core'

type Prop = {
  popover: any
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    popover: {
    },
    paper: {
      padding: 6
    }
  })
)

export const PopoverCell: FC<Prop> = (props) => {
  const classes = useStyles()

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

  const handleOpenPopover = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
      <>
        <div onClick={handleOpenPopover} >
          {props.children}
        </div>
        <Popover open={open} className={classes.popover} classes={{ paper: classes.paper }}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }} >
          {props.popover}
        </Popover>
      </>
  )
}