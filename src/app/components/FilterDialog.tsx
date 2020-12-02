import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import { Paper, Grid } from '@material-ui/core'
import { ToggleButton } from '@material-ui/lab'

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

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    groupContainer: {
      padding: 8
    },
  })
)

export const FilterDialog: FC<Prop> = (props) => {
  const classes = useStyles()

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
            <Paper variant="outlined" className={classes.groupContainer} key={groupIndex} >
              <span>{group.name}:</span><br />
              <Grid container spacing={1}>
                {group.buttons.map((button, buttonIndex) =>
                  <Grid item key={`${groupIndex}-${buttonIndex}`}>
                    <ToggleButton onClick={() => { handleClickFilterButton(group.key, button.key, group) }} value={button.label} selected={filterValues[group.key][button.key]} size="small">
                      {button.label}
                    </ToggleButton>
                  </Grid>
                )}
              </Grid>
            </Paper>
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