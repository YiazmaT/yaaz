import {SxProps, Theme} from "@mui/material";

export interface SearchInputProps {
  onSearch: (value: string) => void;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}
