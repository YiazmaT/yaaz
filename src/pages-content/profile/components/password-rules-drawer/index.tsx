"use client";
import {Box, Button, CircularProgress, Drawer, IconButton, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {useToaster} from "@/src/contexts/toast-context";
import {FormContextProvider} from "@/src/contexts/form-context";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {PASSWORD_RULES} from "@/src/lib/password-rules";
import {PasswordRulesDrawerProps} from "./types";

export function PasswordRulesDrawer({open, onClose}: PasswordRulesDrawerProps) {
  const [loading, setLoading] = useState(false);
  const {translate} = useTranslate();
  const {successToast} = useToaster();
  const api = useApi();

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {currentPassword: "", newPassword: "", confirmPassword: ""},
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");
  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allRulesPassed && passwordsMatch;

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(data: {currentPassword: string; newPassword: string; confirmPassword: string}) {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.fetch("POST", "/api/settings/user/change-password", {
        body: {currentPassword: data.currentPassword, newPassword: data.newPassword, confirmPassword: data.confirmPassword},
        hideLoader: true,
      });
      successToast(translate("profile.passwordChanged"));
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={handleClose} PaperProps={{sx: {width: {xs: "100%", sm: 400}, p: 3}}}>
      <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
        <Typography variant="h6" fontWeight={600}>
          {translate("profile.changePassword")}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <FormContextProvider control={control} errors={errors}>
        <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
          <FormTextInput fieldName="currentPassword" label="profile.currentPassword" isPassword />
          <FormTextInput fieldName="newPassword" label="setupPassword.password" isPassword />
          <FormTextInput fieldName="confirmPassword" label="setupPassword.confirmPassword" isPassword />
        </Box>
      </FormContextProvider>

      <Box sx={{mt: 2, display: "flex", flexDirection: "column", gap: 0.5}}>
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(newPassword);
          return (
            <Box key={rule.key} sx={{display: "flex", alignItems: "center", gap: 1}}>
              {passed ? (
                <CheckCircleIcon sx={{fontSize: 18, color: "success.main"}} />
              ) : (
                <RadioButtonUncheckedIcon sx={{fontSize: 18, color: "text.disabled"}} />
              )}
              <Typography variant="body2" color={passed ? "success.main" : "text.secondary"}>
                {translate(`setupPassword.rules.${rule.key}`)}
              </Typography>
            </Box>
          );
        })}
        <Box sx={{display: "flex", alignItems: "center", gap: 1, mt: 0.5}}>
          {passwordsMatch ? (
            <CheckCircleIcon sx={{fontSize: 18, color: "success.main"}} />
          ) : (
            <RadioButtonUncheckedIcon sx={{fontSize: 18, color: "text.disabled"}} />
          )}
          <Typography variant="body2" color={passwordsMatch ? "success.main" : "text.secondary"}>
            {translate("setupPassword.errors.passwordMismatch") /* reuse label */}
          </Typography>
        </Box>
      </Box>

      <Button variant="contained" fullWidth disabled={!canSubmit || loading} onClick={handleSubmit(onSubmit)} sx={{mt: 3}}>
        {loading ? <CircularProgress size={22} /> : translate("profile.changePassword")}
      </Button>
    </Drawer>
  );
}
