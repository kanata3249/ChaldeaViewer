import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import { List, ListItem, ListItemText, Grid, Divider } from '@material-ui/core'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import { Servant, servantNames, servantClassNames, servantSkills, skillTypeNames } from '../../fgo/servants'
import { InventoryStatus, itemNames } from '../../fgo/inventory'

import { ServantSkillsPage } from './ServantSkillsPage'
import { ServantItemsPage } from './ServantItemsPage'
import { ServantItemsForAPPage } from './ServantItemsForAPPage'

type Prop = {
  servant: Servant
  inventoryStatus: InventoryStatus
  page: "skills" | "items"

  open: boolean
  onClose(): void
}

const pageNameToPageNo = {
  "skills": 0,
  "items": 1
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    title: {
      margin: 0,
      paddingTop: 2,
      paddingBottom: 2,
    },
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
    skillDescription: {
      paddingLeft: 8,
      fontSize: "smaller"
    },
    tabPanel: {
      overflowX: "auto"
    }
  })
)

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  className: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, className, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={className}
      {...other}
    >
      {value === index &&
        children
}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const ServantInfoDialog: FC<Prop> = (props) => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = React.useState(pageNameToPageNo[props.page])

  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleClose = () => {
    props.onClose()
  }

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.title} id="form-dialog-title">{`${props.servant ? `${servantNames[props.servant.id]} (${servantClassNames[props.servant.spec.class]})` : ""}`}</DialogTitle>
        <DialogContent>
          <Tabs value={tabIndex} onChange={handleChangeTab} aria-label="simple tabs example">
            <Tab label="スキル" {...a11yProps(0)} />
            <Tab label="素材" {...a11yProps(1)} />
            {!props.servant.duplicated && <Tab label="素材(AP)" {...a11yProps(1)} />}
          </Tabs>
          {props.servant && (
            <>
              <TabPanel value={tabIndex} index={0} className={classes.tabPanel}>
                <ServantSkillsPage servant={props.servant} />
              </TabPanel>
              <TabPanel value={tabIndex} index={1} className={classes.tabPanel}>
                <ServantItemsPage servant={props.servant} inventoryStatus={props.inventoryStatus} />
              </TabPanel>
              {!props.servant.duplicated && (
                <TabPanel value={tabIndex} index={2} className={classes.tabPanel}>
                  <ServantItemsForAPPage servant={props.servant} inventoryStatus={props.inventoryStatus} />
                </TabPanel>
              )}
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