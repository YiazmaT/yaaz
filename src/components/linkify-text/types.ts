import {TypographyProps} from "@mui/material";

export interface LinkifyTextProps extends Omit<TypographyProps, "children"> {
  text: string;
}
