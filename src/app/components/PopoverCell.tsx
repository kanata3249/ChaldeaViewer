import React, { FC, useState } from 'react'
import { styled } from '@mui/material/styles'

import { Popover } from '@mui/material'
import { Paper } from '@mui/material'

type Prop = {
  popover: any
  children?: React.ReactNode
}

const StyledPopoverPaper = styled(Paper)({ padding: 6 })

export const PopoverCell: FC<Prop> = (props) => {
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
        <Popover open={open} slots={{ paper: StyledPopoverPaper }}
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