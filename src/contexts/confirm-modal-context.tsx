"use client";
import {noop} from "lodash";
import {createContext, PropsWithChildren, useContext, useState} from "react";
import {flexGenerator} from "../utils/flex-generator";
import {Box, Button, Card, CardContent, CardHeader, Modal, Typography, IconButton} from "@mui/material";
import {useTranslate} from "./translation-context";
import CloseIcon from "@mui/icons-material/Close";

interface IOpenConfirmModalProps {
  message?: string;
  content?: React.ReactNode;
  title?: string;
  hideCloseButton?: boolean;
  hideCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface IConfirmModalProps {
  open: (values: IOpenConfirmModalProps) => void;
}

const defaultModalValues: IOpenConfirmModalProps = {
  message: "",
  content: null,
  title: "global.attention",
  hideCloseButton: false,
  hideCancel: false,
  onConfirm: noop,
  onCancel: noop,
};

const ConfirmModalContext = createContext<IConfirmModalProps>({open: noop});

export function ConfirmModalContextProvider(props: PropsWithChildren) {
  const [showModal, setShowModal] = useState(false);
  const [modalValues, setModalValues] = useState<IOpenConfirmModalProps>(defaultModalValues);
  const {translate} = useTranslate();

  function open(values: IOpenConfirmModalProps) {
    setShowModal(true);
    setModalValues({...defaultModalValues, ...values});
  }

  function close() {
    defaultModalValues.onCancel?.();
    setShowModal(false);
    setModalValues(defaultModalValues);
  }

  function confirm() {
    modalValues.onConfirm?.();
    close();
  }

  return (
    <ConfirmModalContext.Provider value={{open}}>
      <Modal open={showModal} onClose={close} sx={{...flexGenerator("r.center.center")}}>
        <Card sx={{width: 400}}>
          <Box sx={{...flexGenerator("r.center.space-between")}}>
            <CardHeader title={translate(modalValues.title)} />
            {!modalValues.hideCloseButton && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  cursor: "pointer",
                  marginRight: 2,
                }}
                onClick={close}
              >
                <Typography sx={{marginRight: 1}}>[esc]</Typography>
                <IconButton>
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <CardContent sx={{maxHeight: "80vh", overflow: "auto", paddingTop: 0, ...flexGenerator("c.center.center")}}>
            {modalValues.message !== "" && <Typography>{translate(modalValues.message)}</Typography>}
            {modalValues.content}
          </CardContent>
          <Box
            sx={{
              ...flexGenerator("r.center.center"),
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            <Button onClick={confirm} variant="contained" sx={{marginLeft: 5, marginRight: 5}}>
              {translate("global.confirm")}
            </Button>
            {!modalValues.hideCancel && (
              <Button onClick={close} variant="outlined" sx={{marginRight: 5}}>
                {translate("global.cancel")}
              </Button>
            )}
          </Box>
        </Card>
      </Modal>
      {props.children}
    </ConfirmModalContext.Provider>
  );
}

export function useConfirmModal() {
  const {open} = useContext(ConfirmModalContext);
  return {show: open};
}
