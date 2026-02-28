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
  const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "#A20103";
  const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR ?? "#060606";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: t("subject", {tenantName}),
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 2px; border-radius: 10px;">
          <div style="background: #ffffff; border-radius: 8px; padding: 32px; text-align: center;">
            ${tenantLogo ? `<div style="margin-bottom: 16px;"><img src="${tenantLogo}" alt="${tenantName}" height="60" style="object-fit: contain;" /></div>` : ""}
            <h2 style="color: #1a1a1a; margin: 0 0 16px 0;">${t("title", {tenantName})}</h2>
            <p style="color: #444; margin: 0 0 8px 0;">${t("greeting", {userName})}</p>
            <p style="color: #444; margin: 0 0 24px 0;">${t("body")}</p>
            <div style="margin: 0 0 32px 0;">
              <a href="${setupUrl}" style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                ${t("button")}
              </a>
            </div>
            <p style="color: #888; font-size: 12px; margin: 0 0 24px 0;">${t("expiry")}</p>
            <div>
              <img src="${systemLogoUrl}" alt="${process.env.NEXT_PUBLIC_COMPANY_NAME}" width="80" height="80" style="display: inline-block;" />
            </div>
          </div>
        </div>
      </div>
    `,
  });
}
