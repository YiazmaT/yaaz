"use client";
import {Box, Button, CircularProgress, Grid, Typography, useTheme} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Image from "next/image";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {useTranslate} from "@/src/contexts/translation-context";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useForm} from "react-hook-form";
import {flexGenerator} from "@/src/utils/flex-generator";
import {TenantInfo} from "./types";
import {PASSWORD_RULES} from "@/src/lib/password-rules";

const MODE_CONFIG = {
  setup: {
    apiPath: "setup-password",
    title: "setupPassword.title",
    subtitle: "setupPassword.subtitle",
    submit: "setupPassword.submit",
    success: "setupPassword.success",
    invalidLink: "setupPassword.errors.invalidLink",
  },
  reset: {
    apiPath: "reset-password",
    title: "resetPassword.title",
    subtitle: "resetPassword.subtitle",
    submit: "resetPassword.submit",
    success: "resetPassword.success",
    invalidLink: "resetPassword.errors.invalidLink",
  },
};

export function SetPasswordScreen({mode}: {mode: keyof typeof MODE_CONFIG}) {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const {translate} = useTranslate();
  const theme = useTheme();
  const router = useRouter();
  const config = MODE_CONFIG[mode];
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const tenantId = searchParams.get("tenantId");
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allRulesPassed && passwordsMatch;

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {password: "", confirmPassword: ""},
  });

  useEffect(() => {
    setPassword(watch("password"));
    setConfirmPassword(watch("confirmPassword"));
  }, [watch("password"), watch("confirmPassword")]);

  useEffect(() => {
    if (!userId || !tenantId) {
      setLoadError(translate(config.invalidLink));
      return;
    }

    fetch(`/api/public/password-link-info?userId=${userId}&tenantId=${tenantId}&mode=${mode}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setLoadError(translate(json.error));
        else setTenantInfo(json.data);
      })
      .catch(() => setLoadError(translate(config.invalidLink)));
  }, [userId, tenantId]);

  async function onSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/public/${config.apiPath}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({userId, tenantId, password, confirmPassword}),
      });
      const json = await res.json();
      if (json.error) {
        setSubmitError(translate(json.error));
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setSubmitError(translate("api.errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{...flexGenerator("c.center.center"), minHeight: "100vh", width: "100%"}}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: {xs: "transparent", md: "white"},
          padding: {xs: 2, md: 4},
          borderRadius: {xs: 0, md: 2},
          boxShadow: {xs: 0, md: `0px 8px 32px ${secondaryColor}CC`},
          border: {xs: "none", md: "2px solid transparent"},
          backgroundImage: {
            xs: "none",
            md: `linear-gradient(white, white), linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          },
          backgroundOrigin: "border-box",
          backgroundClip: {xs: "padding-box", md: "padding-box, border-box"},
        }}
      >
        <Grid container spacing={2} sx={{...flexGenerator("c.center.center")}}>
          {tenantInfo && (
            <Grid size={12} sx={{...flexGenerator("c.center.center"), flexDirection: "column", gap: 1}}>
              {tenantInfo.tenantLogo && (
                <Image alt={tenantInfo.tenantName} src={tenantInfo.tenantLogo} width={120} height={60} style={{objectFit: "contain"}} />
              )}
              <Typography variant="h6" fontWeight={700} textAlign="center">
                {tenantInfo.tenantName}
              </Typography>
            </Grid>
          )}

          {loadError ? (
            <Grid size={12}>
              <Typography color="error" textAlign="center">
                {loadError}
              </Typography>
            </Grid>
          ) : success ? (
            <Grid size={12}>
              <Typography color="success.main" textAlign="center">
                {translate(config.success)}
              </Typography>
            </Grid>
          ) : tenantInfo ? (
            <>
              <Grid size={12}>
                <Typography variant="h6" textAlign="center">
                  {translate(config.title)}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {translate(config.subtitle)}
                </Typography>
              </Grid>

              <FormContextProvider control={control} errors={errors}>
                <FormTextInput fieldName="password" label="setupPassword.password" isPassword />
                <FormTextInput fieldName="confirmPassword" label="setupPassword.confirmPassword" isPassword />
              </FormContextProvider>

              <Grid size={12}>
                <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, mt: 1}}>
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
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
                </Box>
              </Grid>

              {submitError && (
                <Grid size={12}>
                  <Typography color="error" variant="body2" textAlign="center">
                    {submitError}
                  </Typography>
                </Grid>
              )}

              <Grid size={12}>
                <Button variant="contained" fullWidth disabled={!canSubmit || loading} onClick={handleSubmit(onSubmit)}>
                  {loading ? <CircularProgress size={24} /> : translate(config.submit)}
                </Button>
              </Grid>

              <Grid size={12} sx={{...flexGenerator("c.center.center")}}>
                <Image alt={process.env.NEXT_PUBLIC_COMPANY_NAME!} src="/assets/icon.png" width={100} height={100} />
              </Grid>
            </>
          ) : (
            <Grid size={12} sx={{...flexGenerator("c.center.center")}}>
              <CircularProgress />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
