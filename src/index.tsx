import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from "@material-ui/core/CssBaseline"

import { appTheme } from './app/theme'
import { TopPage } from './app/pages/topPage'

const theme = appTheme()

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <TopPage>
    </TopPage>
  </ThemeProvider>,
  document.getElementById('root')
)