import {Resend} from "resend";
import {serverTranslate} from "@/src/lib/server-translate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordSetupEmail(params: {
  to: string;
  userName: string;
  tenantName: string;
  tenantLogo: string | null;
  setupUrl: string;
}) {
  const {to, userName, tenantName, tenantLogo, setupUrl} = params;
  const t = (key: string, vars?: Record<string, string>) => serverTranslate(`email.passwordSetup.${key}`, vars);
  const systemLogoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/assets/icon.png`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: t("subject", {tenantName}),
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${systemLogoUrl}" alt="${process.env.NEXT_PUBLIC_COMPANY_NAME}" width="80" height="80" style="display: inline-block;" />
        </div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          ${tenantLogo ? `<img src="${tenantLogo}" alt="${tenantName}" height="32" style="object-fit: contain; vertical-align: middle;" />` : ""}
          <h2 style="color: #1a1a1a; margin: 0;">${t("title", {tenantName})}</h2>
        </div>
        <p style="color: #444;">${t("greeting", {userName})}</p>
        <p style="color: #444;">${t("body")}</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${setupUrl}" style="background: #1976d2; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            ${t("button")}
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">${t("expiry")}</p>
      </div>
    `,
  });
}
