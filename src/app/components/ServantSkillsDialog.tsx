import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import { List, ListItem, ListItemText, Grid, Divider } from '@material-ui/core'


import { Servant, servantNames, servantClassNames, servantSkills, skillTypeNames } from '../../fgo/servants'

type Prop = {
  servant: Servant

  open: boolean
  onClose(): void
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    title: {
      margin: 0,
      paddingTop: 2,
      paddingBottom: 2,
    },
    skillDescription: {
      paddingLeft: 8,
      fontSize: "smaller"
    }
  })
)

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: number
  formatter?: (value: number) => string
}

type ServantSkillsTableData = {
  id: number
  name: string
  type: string
  targets: string[]
  effects: string[]
  grows: string[]
  values: string[][]
}

const createServantSkillsTableData = (servant: Servant): ServantSkillsTableData[] => {
  if (!servant)
    return []
  return Object.entries(servant.spec.skills).reduce<ServantSkillsTableData[]>((acc, [type, skills]) => {
    return acc.concat(
      skills.map<ServantSkillsTableData>((skillId) => {
        const skillSpec = servantSkills[skillId]

        return {
          id: skillId,
          name: skillSpec.name,
          type: type,
          targets: skillSpec.effects.map((effect) => effect.target),
          effects: skillSpec.effects.map((effect) => effect.text),
          grows: skillSpec.effects.map((effect) => effect.grow),
          values: skillSpec.effects.map((effect) => effect.values),
        }
      }
    ))
  }, [])
}

export const ServantSkillsDialog: FC<Prop> = (props) => {
  const classes = useStyles()
  const [ tableSize, setTableSize ] = useState([600, 200])
  const tableData: ServantSkillsTableData[] = createServantSkillsTableData(props.servant)

  const handleClose = () => {
    props.onClose()
  }

  const listItem = (row: ServantSkillsTableData, index: number) => {
    return (
      <div key={index}>
        {index != 0 && <Divider key={index * 100} />}
        <ListItem alignItems="flex-start" >
          <Grid container direction="column">
            <Grid item>
              <ListItemText primary={row.name + " - " + skillTypeNames[row.type]} />
            </Grid>
            <Grid item className={classes.skillDescription} >
              <table>
                <tbody>
                  {row.effects.map((text, index) => {
                    switch (row.type) {
                    case "np":
                      return (<tr key={index}><td colSpan={11} >{`${row.targets[index]} ${text}`}</td></tr>)
                    case "passive":
                      return (<tr key={index}><td colSpan={11} >{`${text} ${row.values[index]}`}</td></tr>)
                    case "active":
                      if (row.values[index][0] != row.values[index][9])
                        return (<tr key={index}><td colSpan={11} >{`${row.targets[index]} ${text} ${row.values[index][0]}～${row.values[index][9]}`}</td></tr>)
                      else
                        return (<tr key={index}><td colSpan={11} >{`${row.targets[index]} ${text} ${row.values[index][0]}`}</td></tr>)
                    }
                  })}
                  {row.type == "np" && (<tr><th></th><th></th>{row.values[0].map((value, index) => (<th key={index}>{index + 1}</th>))}</tr>)}
                  {row.type == "np" && row.effects.map((text, index) => (
                    <tr key={index}><td></td>{row.type == "np" && (<td>{row.grows[index]}</td>)}
                      {row.values[index].map((value, index) => (
                        <td key={index}>{typeof value == "string" ? value.replace(/rate:/,"") : value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Grid>
          </Grid>
        </ListItem>
      </div>
    )
  }

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.title} id="form-dialog-title">{`スキル${props.servant ? ` - ${servantNames[props.servant.id]} (${servantClassNames[props.servant.spec.class]})` : ""}`}</DialogTitle>
        <DialogContent>
          {props.servant && (
            <>
              <List>
                {tableData.map((row, index) => listItem(row, index))}
              </List>
            </>)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}