import {Resend} from "resend";
import {serverTranslate} from "@/src/lib/server-translate";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHtml(params: {
  tenantLogo: string | null;
  tenantName: string;
  title: string;
  greeting: string;
  body: string;
  buttonHref: string;
  buttonLabel: string;
  expiry: string;
}) {
  const {tenantLogo, tenantName, title, greeting, body, buttonHref, buttonLabel, expiry} = params;
  const systemLogoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/assets/icon.png`;
  const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "#A20103";
  const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR ?? "#060606";

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 2px; border-radius: 10px;">
        <div style="background: #ffffff; border-radius: 8px; padding: 32px; text-align: center;">
          ${tenantLogo ? `<div style="margin-bottom: 16px;"><img src="${tenantLogo}" alt="${tenantName}" height="60" style="object-fit: contain; display: block; margin: 0 auto 8px auto;" /><p style="color: #444; font-weight: bold; margin: 0;">${tenantName}</p></div>` : ""}
          <h2 style="color: #1a1a1a; margin: 0 0 16px 0;">${title}</h2>
          <p style="color: #444; margin: 0 0 8px 0;">${greeting}</p>
          <p style="color: #444; margin: 0 0 24px 0;">${body}</p>
          <div style="margin: 0 0 32px 0;">
            <a href="${buttonHref}" style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              ${buttonLabel}
            </a>
          </div>
          <p style="color: #888; font-size: 12px; margin: 0 0 24px 0;">${expiry}</p>
          <div>
            <img src="${systemLogoUrl}" alt="${process.env.NEXT_PUBLIC_COMPANY_NAME}" width="80" height="80" style="display: block; margin: 0 auto 8px auto;" />
            <p style="color: #888; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_COMPANY_NAME}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function sendPasswordSetupEmail(params: {
  to: string;
  userName: string;
  tenantName: string;
  tenantLogo: string | null;
  setupUrl: string;
}) {
  const {to, userName, tenantName, tenantLogo, setupUrl} = params;
  const t = (key: string, vars?: Record<string, string>) => serverTranslate(`email.passwordSetup.${key}`, vars);

  const {error} = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: t("subject", {tenantName}),
    html: buildEmailHtml({
      tenantLogo,
      tenantName,
      title: t("title", {tenantName}),
      greeting: t("greeting", {userName}),
      body: t("body"),
      buttonHref: setupUrl,
      buttonLabel: t("button"),
      expiry: t("expiry"),
    }),
  });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
}

export async function sendPasswordResetEmail(params: {
  to: string;
  userName: string;
  tenantName: string;
  tenantLogo: string | null;
  resetUrl: string;
}) {
  const {to, userName, tenantName, tenantLogo, resetUrl} = params;
  const t = (key: string, vars?: Record<string, string>) => serverTranslate(`email.passwordReset.${key}`, vars);

  const {error} = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: t("subject", {tenantName}),
    html: buildEmailHtml({
      tenantLogo,
      tenantName,
      title: t("title", {tenantName}),
      greeting: t("greeting", {userName}),
      body: t("body"),
      buttonHref: resetUrl,
      buttonLabel: t("button"),
      expiry: t("expiry"),
    }),
  });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
}
