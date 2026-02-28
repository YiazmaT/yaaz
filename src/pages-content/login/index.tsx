"use client";
import {Button, Grid} from "@mui/material";
import Cookies from "js-cookie";
import {useEffect, useState} from "react";
import {useAuth} from "@/src/contexts/auth-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {CheckBox} from "@/src/components/form-fields/check-box";
import {ForgotPasswordModal} from "./components/forgot-password-modal/forgot-password-modal";
import {LoginForm} from "./components/login-form/login-form";

export function LoginScreen() {
  const [saveMe, setSaveMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [savedLogin, setSavedLogin] = useState("");
  const {login} = useAuth();
  const {translate} = useTranslate();

  useEffect(() => {
    setSavedLogin(Cookies.get("saveMe") ?? "");
  }, []);

  async function submit(loginValue: string, password: string) {
    if (saveMe) Cookies.set("saveMe", loginValue, {expires: 365 * 100, path: "/"});
    await login(loginValue, password);
  }

  return (
    <>
      <LoginForm
        gradientId="login_loader_gradient"
        onSubmit={submit}
        defaultLoginValue={savedLogin}
        footer={
          <Grid size={12} sx={{textAlign: "center", mt: 1}}>
            <Button variant="text" fullWidth onClick={() => setForgotOpen(true)}>
              {translate("forgotPassword.link")}
            </Button>
          </Grid>
        }
      >
        <Grid size={12}>
          <CheckBox label="global.rememberMe" value={saveMe} onChange={setSaveMe} />
        </Grid>
      </LoginForm>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
