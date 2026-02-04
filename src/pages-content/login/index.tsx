"use client";
import {Box, Button, Grid} from "@mui/material";
import {useLoginFormConfig} from "./form-config";
import Cookies from "js-cookie";
import Image from "next/image";
import {useEffect, useState} from "react";
import {yupResolver} from "@hookform/resolvers/yup";
import {useAuth} from "@/src/contexts/auth-context";
import {useForm} from "react-hook-form";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {CheckBox} from "@/src/components/form-fields/check-box";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {flexGenerator} from "@/src/utils/flex-generator";
import {primaryColor, secondaryColor} from "@/src/theme";

export function LoginScreen() {
  const [saveMe, setSaveMe] = useState(true);
  const {login} = useAuth();
  const {translate} = useTranslate();
  const {defaultValues, schema} = useLoginFormConfig();

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    setValue("login", Cookies.get("saveMe") ?? "");
  }, []);

  async function submit(data: typeof defaultValues) {
    if (saveMe)
      Cookies.set("saveMe", data.login, {
        expires: 365 * 100,
        path: "/",
      });
    await login(data.login, data.password);
  }

  return (
    <Box
      sx={{
        ...flexGenerator("c.center.center"),
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: {xs: "transparent", md: "white"},
          padding: {xs: 2, md: 4},
          borderRadius: {xs: 0, md: 2},
          boxShadow: {xs: 0, md: `0px 8px 32px ${secondaryColor}CC`},
          border: {xs: "none", md: "2px solid transparent"},
          backgroundImage: {
            xs: "none",
            md: `linear-gradient(white, white), linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          },
          backgroundOrigin: {xs: "border-box", md: "border-box"},
          backgroundClip: {xs: "padding-box", md: "padding-box, border-box"},
        }}
      >
        <FormContextProvider control={control} errors={errors}>
          <form onSubmit={handleSubmit(submit)}>
            <Grid container spacing={1}>
              <Grid size={12} sx={{...flexGenerator("c.center.center")}}>
                <Box sx={{...flexGenerator("c.center.center"), backgroundColor: primaryColor, borderRadius: "100%", width: 300, height: 300}}>
                  <Image alt={process.env.NEXT_PUBLIC_COMPANY_NAME!} src="/assets/banner.png" width={200} height={200} />
                </Box>
              </Grid>
              <FormTextInput fieldName="login" label="global.email" grid size={12} />
              <FormTextInput fieldName="password" label="global.password" grid size={12} isPassword />
              <Grid size={12}>
                <CheckBox label="global.rememberMe" value={saveMe} onChange={setSaveMe} />
              </Grid>
              <Button variant="contained" type="submit" fullWidth>
                {translate("global.login")}
              </Button>
            </Grid>
          </form>
        </FormContextProvider>
      </Box>
    </Box>
  );
}
