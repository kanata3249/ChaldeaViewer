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
    components: {
      MuiButton: {
        styleOverrides: {
          outlined: ({ ownerState, theme }) => {
            if (ownerState.color === "inherit") {
              return {
                color: "inherit",
                borderColor: "currentColor",
              }
            }

            const textColor = theme.palette.text.primary
            return {
              color: textColor,
              borderColor: alpha(textColor, 0.23),
              "&:hover": {
                borderColor: alpha(textColor, 0.46),
              },
            }
          },
        },
      },
    },
  })

  return theme
}