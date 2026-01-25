import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { List, ListItem, ListItemText, Grid, Divider } from '@material-ui/core'

import { Servant, servantNames, servantClassNames, servantSkills, skillTypeNames } from '../../fgo/servants'

type Prop = {
  servant: Servant
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    skillDescription: {
      paddingLeft: 8,
      fontSize: "smaller"
    },
    skillDetail: {
      fontSize: "smaller",
      paddingBottom: 8,
    },
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
  ct?: number
  npType?: string
  detail: string
  targets: string[]
  effects: string[]
  grows: string[]
  values: string[][]
}

const formatSkillDetail = (detail: string) => {
  return (
    <>
      { detail?.split(/(＆|＋)/).reduce((acc, token, index) => {
          if (index % 2 == 0 && index != 0) {
            acc.push(`${acc.pop()}${token}`)
          } else {
            acc.push(token)
          }
          return acc
        },[]).map((line, index) =>
          <React.Fragment key={index}>
              {line}<br />
          </React.Fragment>
        )}
    </>
  )
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
          name: skillSpec.name + (skillSpec.condition ? `〔${skillSpec.condition}〕` : ''),
          type: type,
          ct: skillSpec.ct,
          npType: skillSpec.npType,
          detail: skillSpec.detail,
          targets: skillSpec.effects.map((effect) => effect.target),
          effects: skillSpec.effects.map((effect) => effect.text),
          grows: skillSpec.effects.map((effect) => effect.grow),
          values: skillSpec.effects.map((effect) => effect.values),
        }
      }
    ))
  }, [])
}

export const ServantSkillsPage: FC<Prop> = (props) => {
  const classes = useStyles()
  const [ tableSize, setTableSize ] = useState([480, 400])
  const tableData: ServantSkillsTableData[] = createServantSkillsTableData(props.servant)

  const listItem = (row: ServantSkillsTableData, index: number) => {
    return (
      <div key={index}>
        {index != 0 && <Divider key={index * 100} />}
        <ListItem alignItems="flex-start" >
          <Grid container direction="column">
            <Grid item>
              {row.type == "np" && <ListItemText primary={row.name + " - " + row.npType + skillTypeNames[row.type]} />}
              {row.type == "active" && <ListItemText primary={row.name + ` ct${row.ct}～${row.ct-2} - ` + skillTypeNames[row.type]} />}
              {row.type == "passive" && <ListItemText primary={row.name + " - " + skillTypeNames[row.type]} />}
              {row.type == "append" && <ListItemText primary={row.name + " - " + skillTypeNames[row.type]} />}
            </Grid>
            { row.detail && 
              <Grid item className={classes.skillDetail} >
                {formatSkillDetail(row.detail)}
              </Grid>
            }
            <Grid item className={classes.skillDescription} >
              <table>
                <tbody>
                  {row.effects.map((text, index) => {
                    switch (row.type) {
                    case "np":
                      return (<tr key={index}><td colSpan={11} >{`${row.targets[index]} ${text}`}</td></tr>)
                    case "passive":
                      if (row.targets[0] != "自身")
                        return (<tr key={index}><td colSpan={11} >{`${row.targets[index]} ${text} ${row.values[index]}`}</td></tr>)
                      return (<tr key={index}><td colSpan={11} >{`${text} ${row.values[index]}`}</td></tr>)
                    case "active":
                      if (row.values[index][0] != row.values[index][9])
                        return (<tr key={index}><td colSpan={11} >{`${row.targets[index]} ${text} ${row.values[index][0]}～${row.values[index][9]}`}</td></tr>)
                      else
                        return (<tr key={index}><td colSpan={11} >{`${row.targets[index]} ${text} ${row.values[index][0]}`}</td></tr>)
                    case "append":
                      return (<tr key={index}><td colSpan={11} >{`${text}  ${row.values[index][0]}～${row.values[index][9]}`}</td></tr>)                    }
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
      {props.servant && (
        <div style={{width: tableSize[0], height: tableSize[1], overflowY: "auto"}}>
          <List>
            {tableData.map((row, index) => listItem(row, index))}
          </List>
        </div>)}
    </div>
  )
}