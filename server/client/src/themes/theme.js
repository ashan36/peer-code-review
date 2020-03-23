import { createMuiTheme } from "@material-ui/core";

export const theme = createMuiTheme({
  typography: {
    fontFamily: '"Roboto"',
    fontSize: 12,
    h1: {
      // could customize the h1 variant as well
    }
  },
  palette: {
    primary: { main: "#6E3ADB" }, // purple
    secondary: { main: "#43DDC1" }, // turquoise
    background: { default: "#E7EBFB" },
    action: {
      hover: "#D3D3D3"
    }
  }
});
