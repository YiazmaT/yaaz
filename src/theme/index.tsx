import {createTheme, PaletteOptions} from "@mui/material";
import {alpha, ThemeOptions} from "@mui/material/styles";
import {blackOrWhite} from "../utils/black-or-white";

export const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR!;
export const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR!;

export const theme = {
  fontSize: {
    tiny: 14,
    small: 16,
    default: 18,
    large: 20,
    big: 22,
  },
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
    error: "#E24C4C",
  },
};

export const themeMaterial = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: alpha(primaryColor, 0.5),
      dark: alpha(primaryColor, 0.9),
      contrastText: blackOrWhite(primaryColor),
    },
    secondary: {
      main: secondaryColor,
      light: alpha(secondaryColor, 0.5),
      dark: alpha(secondaryColor, 0.9),
      contrastText: blackOrWhite(secondaryColor),
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
          color: primaryColor,
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

export const globalStyles = {
  body: {
    backgroundColor: "#ffffff",
  },
  ".MuiButton-root:hover, .MuiListItem-root:hover, .MuiIconButton-root:hover": {
    backgroundColor: alpha(primaryColor, 0.3),
  },
};
