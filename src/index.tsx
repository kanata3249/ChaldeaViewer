import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyStylesThemeProvider } from '@mui/styles'
import CssBaseline from "@mui/material/CssBaseline"

import { appTheme } from './app/theme'
import { TopPage } from './app/pages/topPage'

const theme = appTheme()

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <LegacyStylesThemeProvider theme={theme}>
      <CssBaseline />
      <TopPage>
      </TopPage>
    </LegacyStylesThemeProvider>
  </ThemeProvider>,
  document.getElementById('root')
)