import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@material-ui/core'
import { Paper, Grid } from '@material-ui/core'

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
    }
  })
)

export const FilterDialog: FC<Prop> = (props) => {
  const classes = useStyles()

  const [ filterValues, setFilterValues ] = useState(props.values)

  const handleDefault = () => {
    console.log(props.defaultValues)
    setFilterValues(props.defaultValues)
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
                    <Button onClick={() => { handleClickFilterButton(group.key, button.key, group) }} variant={filterValues[group.key][button.key] ? "contained" : "outlined"}>
                      {button.label}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
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