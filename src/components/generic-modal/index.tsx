"use client";
import {PropsWithChildren} from "react";
import {Box, CardHeader, Dialog, DialogContent, IconButton, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {flexGenerator} from "@/src/utils/flex-generator";
import {useTranslate} from "@/src/contexts/translation-context";
import {GenericModalProps} from "./types";

export function GenericModal(props: PropsWithChildren<GenericModalProps>) {
  const {translate} = useTranslate();

  return (
    <Dialog
      open={props.open}
      maxWidth={props.maxWidth ?? "sm"}
      fullWidth
      onClose={(_, reason) => {
        if (reason === "backdropClick") return;
        props.onClose();
      }}
    >
      <Box sx={{...flexGenerator("r.center.space-between")}}>
        <CardHeader title={translate(props.title)} />
        {!props.hideCloseButton && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              cursor: "pointer",
              marginRight: 2,
            }}
            onClick={props.onClose}
          >
            <Typography sx={{marginRight: 1}}>[esc]</Typography>
            <IconButton>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      <DialogContent sx={{paddingTop: 0}}>{props.children}</DialogContent>
    </Dialog>
  );
}
