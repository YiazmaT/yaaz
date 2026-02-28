import moment from "moment";
import {serverTranslate} from "./server-translate";
import {Tenant} from "../pages-content/yaaz/tenants/types";

const DEFAULT_PRIMARY_COLOR = process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "#A20103";
const DEFAULT_COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "YaaZ";
const DEFAULT_LOGO_URL = "/assets/icon.png";

interface PdfTemplateProps {
  title: string;
  content: string;
  generatedAt: string;
  tenant: Tenant | null;
  footerText?: string;
}

export function generatePdfHtml(props: PdfTemplateProps): string {
  const t = serverTranslate;
  const primaryColor = props.tenant?.primary_color || DEFAULT_PRIMARY_COLOR;
  const companyName = props.tenant?.name || DEFAULT_COMPANY_NAME;
  const logoUrl = props.tenant?.logo || DEFAULT_LOGO_URL;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title} - ${companyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; padding: 20px; color: #333; }
    .header { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #333; }
    .header-logo { width: 50px; height: 50px; object-fit: contain; }
    .header-info { text-align: center; }
    .header h1 { font-size: 18px; margin-bottom: 5px; }
    .header .date { font-size: 11px; color: #666; }
    h2 { font-size: 14px; margin-bottom: 10px; color: #333; }
    .filter-info { font-size: 11px; color: #666; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; font-size: 11px; }
    td { font-size: 11px; }
    .right { text-align: right; }
    .center { text-align: center; }
    .total-row { background-color: #f9f9f9; }
    .status-critical td { background-color: #ffebee; }
    .status-low td { background-color: #fff3e0; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; }
    @page { margin: 0; }
    @media print { body { padding: 10mm; } .no-print { display: none; } }
    .print-button { position: fixed; top: 10px; right: 10px; padding: 10px 20px; background-color: ${primaryColor}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .print-button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">${t("global.pdf.printOrSave")}</button>

  <div class="header">
    <img src="${logoUrl}" alt="Logo" class="header-logo" />
    <div class="header-info">
      <h1>${companyName}</h1>
      <p class="date">${t("global.pdf.generatedAt")}: ${moment(props.generatedAt).format("DD/MM/YYYY HH:mm")}</p>
    </div>
  </div>

  ${props.content}

  <div class="footer">
    <p>${props.footerText ?? t("global.pdf.footer")}</p>
  </div>
</body>
</html>
  `;
}
