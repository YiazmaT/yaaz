"use client";
import {Grid} from "@mui/material";
import Cookies from "js-cookie";
import {useEffect, useState} from "react";
import {useYaazAuth} from "@/src/contexts/auth-context";
import {CheckBox} from "@/src/components/form-fields/check-box";
import {LoginForm} from "@/src/pages-content/login/components/login-form/login-form";

export function YaazLoginScreen() {
  const [saveMe, setSaveMe] = useState(true);
  const [savedLogin, setSavedLogin] = useState("");
  const {login} = useYaazAuth();

  useEffect(() => {
    setSavedLogin(Cookies.get("saveMeYaaz") ?? "");
  }, []);

  async function submit(loginValue: string, password: string) {
    if (saveMe) Cookies.set("saveMeYaaz", loginValue, {expires: 365 * 100, path: "/"});
    await login(loginValue, password);
  }

  return (
    <LoginForm gradientId="yaaz_login_loader_gradient" onSubmit={submit} defaultLoginValue={savedLogin}>
      <Grid size={12}>
        <CheckBox label="global.rememberMe" value={saveMe} onChange={setSaveMe} />
      </Grid>
    </LoginForm>
  );
}
