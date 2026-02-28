import {authenticateYaazRequest} from "@/src/lib/yaaz-auth";
import {LogModule, LogSource, logCreate, logUpdate, logDelete, logGet, logImportant, logError, logCritical} from "@/src/lib/logger";
import {NextResponse} from "next/server";

type LogAction = "create" | "update" | "delete" | "get" | "important" | "error" | "critical";

interface LogCallParams {
  content?: Record<string, any>;
  message?: string;
  error?: any;
  userId?: string;
}

export type YaazLogFn = (action: LogAction, params?: LogCallParams) => Promise<void>;
export type YaazErrorFn = (message: string, status: number, content?: Record<string, any>, responseData?: any) => NextResponse;
export type YaazSuccessFn = (action: LogAction, data?: any, logContent?: any) => NextResponse;

export interface YaazAuthContext {
  user: {id: string; name: string; admin: boolean; [key: string]: any};
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

function createYaazRouteLogger(module: LogModule, route: string, auth?: {user?: {id: string}}): YaazLogFn {
  return function (action: LogAction, params?: LogCallParams) {
    return logFnMap[action]({
      module,
      source: LogSource.API,
      route,
      userId: params?.userId ?? auth?.user?.id,
      content: params?.content,
      message: params?.message,
      error: params?.error,
    });
  };
}

function createYaazErrorFn(module: LogModule, route: string, auth?: {user?: {id: string}}): YaazErrorFn {
  return function (message: string, status: number, content?: Record<string, any>, responseData?: any) {
    logError({module, source: LogSource.API, route, userId: auth?.user?.id, message, content});
    return NextResponse.json({error: message, ...(responseData !== undefined && {data: responseData})}, {status});
  };
}

export interface YaazRouteContext {
  auth: YaazAuthContext;
  success: YaazSuccessFn;
  error: YaazErrorFn;
  log: YaazLogFn;
}

export async function withYaazAuth(
  module: LogModule,
  route: string,
  handler: (ctx: YaazRouteContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  const auth = await authenticateYaazRequest(module, route);
  if (auth.error) return auth.error;

  const log = createYaazRouteLogger(module, route, auth);
  const error = createYaazErrorFn(module, route, auth);

  const success: YaazSuccessFn = (action, data, logContent) => {
    log(action, {content: logContent !== undefined ? logContent : data});
    return NextResponse.json(data !== undefined ? {data} : {}, {status: 200});
  };

  try {
    return await handler({auth: auth as unknown as YaazAuthContext, success, error, log});
  } catch (err) {
    await log("critical", {error: err});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
