import React, { FC, useState } from 'react'
import { styled } from '@mui/material/styles'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, ToggleButton } from '@mui/material'
import { Paper, Grid } from '@mui/material'

export type FilterDefinition = {
  key: string
  name: string
  type: "radio" | "check"
  buttons: {
    key: string
    label: string
  }[]
}

export type FilterValues = {
  [key: string]: {
    [key: string]: boolean
  }
}

type Prop = {
  open: boolean
  filterDefinition: FilterDefinition[]
  values: FilterValues
  defaultValues: FilterValues
  onClose(result: FilterValues): void
}

const GroupContainer = styled(Paper)({ padding: 8 })
const GroupTitle = styled(Grid)({ flexGrow: 1 })

export const FilterDialog: FC<Prop> = (props) => {
  const [ filterValues, setFilterValues ] = useState({...props.defaultValues, ...props.values})

  const handleDefault = () => {
    setFilterValues(props.defaultValues)
  }
  const handleClearAll = () => {
    const newValue = Object.values(props.filterDefinition).reduce((acc, group) => {
      acc[group.key] = group.buttons.reduce((acc, button) => {
        acc[button.key] = false
        return acc
      },{})
      if (group.type == "radio")
        acc[group.key][group.buttons[0].key] = true
      return acc
    },{})
    setFilterValues(newValue)
  }
  const handleClose = () => {
    props.onClose(filterValues)
  }

  const handleGroupSelectAll = (groupIndex: number) => {
    const newValue = JSON.parse(JSON.stringify(filterValues))
    const group = props.filterDefinition[groupIndex]
    if (group.type == "check") {
      newValue[group.key] = group.buttons.reduce((acc, button) => {
        acc[button.key] = true
        return acc
      },{})
      setFilterValues(newValue)
    }
  }
  const handleGroupClearAll = (groupIndex: number) => {
    const newValue = JSON.parse(JSON.stringify(filterValues))
    const group = props.filterDefinition[groupIndex]
    if (group.type == "check") {
      newValue[group.key] = group.buttons.reduce((acc, button) => {
        acc[button.key] = false
        return acc
      },{})
      setFilterValues(newValue)
    }
  }

  const handleClickFilterButton = (groupKey: string, clickedButtonKey: string, group: FilterDefinition) => {
    const newFilterValues = JSON.parse(JSON.stringify(filterValues))

    if (group.type == "radio") {
      if (!newFilterValues[groupKey][clickedButtonKey]) {
        group.buttons.forEach(({label, key}) => {
          newFilterValues[groupKey][key] = false
        })
        newFilterValues[groupKey][clickedButtonKey] = true
      }
    } else {
      newFilterValues[groupKey][clickedButtonKey] = !newFilterValues[groupKey][clickedButtonKey]
    }

    setFilterValues(newFilterValues)
  }

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">フィルター</DialogTitle>
        <DialogContent>
          {props.filterDefinition.map((group, groupIndex) =>
            <GroupContainer variant="outlined" key={groupIndex} >
              <Grid container spacing={1}>
                <GroupTitle>{group.name}:</GroupTitle>
                {group.type == "check" &&
                  <Grid>
                    <Button onClick={() => { handleGroupClearAll(groupIndex) }} variant="outlined" size="small" style={{ padding: 0 }} >全解除</Button>
                  </Grid>
                }
                {group.type == "check" &&
                  <Grid>
                    <Button onClick={() => { handleGroupSelectAll(groupIndex) }} variant="outlined" size="small" style={{ padding: 0 }} >全選択</Button>
                  </Grid>
                }
                </Grid>
              <Grid container spacing={1}>
                {group.buttons.map((button, buttonIndex) =>
                  <Grid key={`${groupIndex}-${buttonIndex}`}>
                    <ToggleButton onClick={() => { handleClickFilterButton(group.key, button.key, group) }} value={button.label} selected={filterValues[group.key][button.key]} size="small">
                      {button.label}
                    </ToggleButton>
                  </Grid>
                )}
              </Grid>
            </GroupContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearAll} variant="outlined">
            全解除
          </Button>
          <Button onClick={handleDefault} variant="outlined">
            初期値に戻す
          </Button>
          <Button onClick={handleClose} variant="outlined">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}