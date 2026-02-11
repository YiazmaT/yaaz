import {authenticateRequest} from "@/src/lib/auth";
import {LogModule, LogSource, logCreate, logUpdate, logDelete, logGet, logImportant, logError, logCritical} from "@/src/lib/logger";
import {Tenant} from "@/src/pages-content/tenants/types";
import {NextResponse} from "next/server";

type LogAction = "create" | "update" | "delete" | "get" | "important" | "error" | "critical";

interface LogCallParams {
  content?: Record<string, any>;
  message?: string;
  error?: any;
  userId?: string;
  tenantId?: string;
}

export type LogFn = (action: LogAction, params?: LogCallParams) => Promise<void>;
export type ErrorFn = (message: string, status: number, content?: Record<string, any>) => NextResponse;

export interface AuthContext {
  user: {id: string; name: string; tenant_id: string; [key: string]: any};
  tenant_id: string;
  tenant: Tenant;
}

const logFnMap: Record<LogAction, (params: any) => Promise<void>> = {
  create: logCreate,
  update: logUpdate,
  delete: logDelete,
  get: logGet,
  important: logImportant,
  error: logError,
  critical: logCritical,
};

function createRouteLogger(module: LogModule, route: string, auth?: {user?: {id: string}; tenant_id?: string}): LogFn {
  return function (action: LogAction, params?: LogCallParams) {
    return logFnMap[action]({
      module,
      source: LogSource.API,
      route,
      userId: params?.userId ?? auth?.user?.id,
      tenantId: params?.tenantId ?? auth?.tenant_id,
      content: params?.content,
      message: params?.message,
      error: params?.error,
    });
  };
}

function createErrorFn(module: LogModule, route: string, auth?: {user?: {id: string}; tenant_id?: string}): ErrorFn {
  return function (message: string, status: number, content?: Record<string, any>) {
    logError({module, source: LogSource.API, route, userId: auth?.user?.id, tenantId: auth?.tenant_id, message, content});
    return NextResponse.json({error: message}, {status});
  };
}

export async function withAuth(
  module: LogModule,
  route: string,
  handler: (auth: AuthContext, log: LogFn, error: ErrorFn) => Promise<NextResponse>,
): Promise<NextResponse> {
  const auth = await authenticateRequest(module, route);
  if (auth.error) return auth.error;

  const log = createRouteLogger(module, route, auth);
  const error = createErrorFn(module, route, auth);

  try {
    return await handler(auth as unknown as AuthContext, log, error);
  } catch (err) {
    await log("critical", {error: err});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
