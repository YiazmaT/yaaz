"use client";
import {Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {FormContextProvider} from "@/src/contexts/form-context";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {useTranslate} from "@/src/contexts/translation-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useForm} from "react-hook-form";
import {useState} from "react";
import {ForgotPasswordModalProps} from "./types";

export function ForgotPasswordModal({open, onClose}: ForgotPasswordModalProps) {
  const {translate} = useTranslate();
  const {successToast} = useToaster();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {login: ""},
  });

  function handleClose() {
    reset();
    setError(null);
    onClose();
  }

  async function onSubmit(data: {login: string}) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/forgot-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({login: data.login}),
      });
      const json = await res.json();

      if (json.error) {
        const vars = json.data ? Object.fromEntries(Object.entries(json.data).map(([k, v]) => [k, String(v)])) : undefined;
        setError(translate(json.error, vars));
      } else {
        handleClose();
        successToast(translate(json.message));
      }
    } catch {
      setError(translate("api.errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        {translate("forgotPassword.title")}
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{display: "flex", flexDirection: "column", gap: 2, pt: 1}}>
          <Typography variant="body2" color="text.secondary">
            {translate("forgotPassword.subtitle")}
          </Typography>
          <FormContextProvider control={control} errors={errors}>
            <FormTextInput fieldName="login" label="global.email" grid size={12} />
          </FormContextProvider>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          <Button variant="contained" fullWidth disabled={loading} onClick={handleSubmit(onSubmit)}>
            {loading ? <CircularProgress size={22} /> : translate("forgotPassword.submit")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
