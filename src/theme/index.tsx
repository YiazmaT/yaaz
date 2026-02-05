import {createTheme, PaletteOptions} from "@mui/material";
import {alpha, ThemeOptions} from "@mui/material/styles";
import {blackOrWhite} from "../utils/black-or-white";

const DEFAULT_PRIMARY_COLOR = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#A20103";
const DEFAULT_SECONDARY_COLOR = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#060606";

export function getDefaultColors() {
  return {
    primary: DEFAULT_PRIMARY_COLOR,
    secondary: DEFAULT_SECONDARY_COLOR,
  };
}

export function createTenantTheme(primary: string, secondary: string) {
  return createTheme({
    palette: {
      primary: {
        main: primary,
        light: alpha(primary, 0.5),
        dark: alpha(primary, 0.9),
        contrastText: blackOrWhite(primary),
      },
      secondary: {
        main: secondary,
        light: alpha(secondary, 0.5),
        dark: alpha(secondary, 0.9),
        contrastText: blackOrWhite(secondary),
      },
      divider: "#BDBDBD",
    } as PaletteOptions,
    components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            color: "#000000",
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: primary,
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: "#D32F2F",
          },
        },
      },
    },
  } as ThemeOptions);
}

export function createGlobalStyles(primary: string) {
  return {
    body: {
      backgroundColor: "#ffffff",
    },
    ".MuiButton-root:hover, .MuiListItem-root:hover, .MuiIconButton-root:hover": {
      backgroundColor: alpha(primary, 0.3),
    },
  };
}
