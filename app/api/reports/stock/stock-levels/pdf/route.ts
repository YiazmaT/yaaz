import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {generatePdfHtml} from "@/src/lib/pdf-template";
import {getTenant} from "@/src/lib/tenant";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/reports/stock/stock-levels/pdf";

const TYPE_LABELS: Record<string, string> = {
  ingredient: "Insumo",
  product: "Produto",
  package: "Embalagem",
};

const STATUS_LABELS: Record<string, string> = {
  ok: "OK",
  low: "Baixo",
  critical: "Crítico",
};

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.REPORTS, ROUTE);
  if (auth.error) return auth.error;

  try {
    const tenant = await getTenant(auth.tenant_id);
    const {searchParams} = new URL(req.url);
    const dataStr = searchParams.get("data") || "[]";
    const generatedAt = searchParams.get("generatedAt") || "";
    const type = searchParams.get("type") || "all";
    const belowMinimumOnly = searchParams.get("belowMinimumOnly") === "true";

    const data = JSON.parse(dataStr);

    const rows = data
      .map(
        (row: any) => `
      <tr class="status-${row.status}">
        <td>${row.name}</td>
        <td>${TYPE_LABELS[row.type] || row.type}</td>
        <td class="right">${row.currentStock}</td>
        <td class="right">${row.minStock}</td>
        <td>${row.unit}</td>
        <td class="center">${STATUS_LABELS[row.status] || row.status}</td>
      </tr>
    `
      )
      .join("");

    const typeLabel = type === "all" ? "Todos" : TYPE_LABELS[type] || type;

    const content = `
      <h2>Níveis de Estoque</h2>
      <p class="filter-info">Tipo: ${typeLabel} | Apenas abaixo do mínimo: ${belowMinimumOnly ? "Sim" : "Não"}</p>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th class="right">Estoque Atual</th>
            <th class="right">Estoque Mínimo</th>
            <th>Unidade</th>
            <th class="center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    const html = generatePdfHtml({title: "Níveis de Estoque", content, generatedAt, tenant});

    logGet({module: LogModule.REPORTS, source: LogSource.API, userId: auth.user!.id, tenantId: auth.tenant_id, content: {type, belowMinimumOnly}, route: ROUTE});

    return new NextResponse(html, {
      status: 200,
      headers: {"Content-Type": "text/html; charset=utf-8"},
    });
  } catch (error) {
    await logCritical({module: LogModule.REPORTS, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
