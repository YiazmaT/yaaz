import {Box, Drawer, IconButton, Typography, useMediaQuery, useTheme} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {GenericDrawerProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {PropsWithChildren} from "react";

export function GenericDrawer(props: PropsWithChildren<GenericDrawerProps>) {
  const {translate} = useTranslate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Drawer anchor="right" open={props.show} onClose={props.onClose}>
      <Box sx={{width: isMobile ? "100vw" : 500, height: "100%", display: "flex", flexDirection: "column"}}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6" sx={{fontWeight: 600}}>
            {translate(props.title)}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={props.onClose}
          >
            <Typography sx={{marginRight: 1}}>[esc]</Typography>
            <IconButton>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{flex: 1, overflow: "auto", p: 3}}>{props.children}</Box>
      </Box>
    </Drawer>
  );
}
