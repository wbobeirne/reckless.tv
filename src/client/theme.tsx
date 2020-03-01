import { createMuiTheme } from "@material-ui/core"
import { grey, amber } from "@material-ui/core/colors"

const defaultPalette = createMuiTheme().palette

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[900],
      dark: "#141414",
      light: grey[800],
      contrastText: "#FFF",
    },
    secondary: amber,
  },
  overrides: {
    MuiButton: {
      contained: {
        backgroundColor: "#FFF",
        color: grey[900],

        "&$disabled": {
          backgroundColor: "#FFF",
        },
      },
      containedPrimary: {
        "&$disabled": {
          backgroundColor: defaultPalette.action.disabledBackground,
        },
      },
      containedSecondary: {
        "&$disabled": {
          backgroundColor: defaultPalette.action.disabledBackground,
        },
      },
    },
    MuiLink: {
      root: {
        color: amber[800],
      },
    },
  },
})
