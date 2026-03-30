import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Servant, attributeNames } from '../../fgo/servants'

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

const summonLabels = {
  'normal': '恒常',
  'story': 'ストーリー限定',
  'limited': '期間限定',
  'friendpoint': 'フレンドポイント',
  'welfare': '配布',
  'reward': '報酬'
}

export const ServantSpecPage: FC<Prop> = (props) => {
  const classes = useStyles()
  const [ tableSize, setTableSize ] = useState([480, 400])

  return (
    <div>
      {props.servant && (
        <div style={{width: tableSize[0], height: tableSize[1], overflowY: "auto"}}>
          取得: {summonLabels[props.servant.spec.summon]}<br />
          特性: {attributeNames[props.servant.spec.attributes]} {props.servant.spec.characteristics}<br />       
        </div>)}
    </div>
  )
}