import { createTheme } from "@mui/material/styles"
import * as colors from '@mui/material/colors'

const isDarkMode = () => matchMedia('(prefers-color-scheme: dark)').matches

export const appTheme = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: colors.blue[800],
      },
      secondary: {
        main: "#ffb74d"
      },
      mode: isDarkMode() ? "dark" : "light",
    },
  })

  return theme
}