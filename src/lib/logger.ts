import pino from "pino";
import {prisma} from "@/src/lib/prisma";

const pinoLogger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export enum LogType {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
  DEBUG = "debug",
  SUCCESS = "success",
  CRITICAL_ERROR = "critical_error",
}

export enum LogSource {
  API = "api",
}

export enum LogModule {
  LOGIN = "login",
  USER = "user",
  INGREDIENT = "ingredient",
  PACKAGE = "package",
  PRODUCT = "product",
  SALE = "sale",
  DASHBOARD = "dashboard",
  REPORTS = "reports",
  TENANT = "tenant",
  CLIENT = "client",
}

interface LogParams {
  type: LogType;
  message?: string;
  userId?: string;
  tenantId?: string;
  source: LogSource;
  module: LogModule;
  route?: string;
  content?: Record<string, any>;
  error?: any;
}

async function sendDiscordNotification(params: LogParams): Promise<void> {
  const webhookUrl = process.env.DISCORD_CRITICAL_ERRORS_WEBHOOK;

  if (!webhookUrl) {
    pinoLogger.warn("Discord webhook URL not configured for critical errors");
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    const errorStack = params.error?.stack || "No stack trace available";

    const embed = {
      title: "🚨 Critical Error Alert",
      color: 0xff0000,
      fields: [
        {
          name: "Module",
          value: params.module,
          inline: true,
        },
        {
          name: "Source",
          value: params.source,
          inline: true,
        },
        {
          name: "User ID",
          value: params.userId || "N/A",
          inline: true,
        },
        ...(params.route
          ? [
              {
                name: "Route",
                value: params.route,
                inline: false,
              },
            ]
          : []),
        {
          name: "Message",
          value: params.message || "No message provided",
          inline: false,
        },
        {
          name: "Error Stack",
          value: `\`\`\`\n${errorStack.substring(0, 1000)}\n\`\`\``,
          inline: false,
        },
      ],
      timestamp,
      footer: {
        text: `${process.env.NEXT_PUBLIC_COMPANY_NAME || "Bakery ERP"} - ${process.env.NODE_ENV || "unknown"}`,
      },
    };

    if (params.content && Object.keys(params.content).length > 0) {
      embed.fields.push({
        name: "Additional Context",
        value: `\`\`\`json\n${JSON.stringify(params.content, null, 2).substring(0, 1000)}\n\`\`\``,
        inline: false,
      });
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Error Logger",
        embeds: [embed],
      }),
    });
  } catch (error) {
    pinoLogger.error({err: error}, "Failed to send Discord notification");
  }
}

async function saveToDatabase(params: LogParams): Promise<void> {
  if (!params.tenantId) {
    pinoLogger.debug("Skipping database log - no tenant_id provided");
    return;
  }

  try {
    const hasContent = params.content && Object.keys(params.content).length > 0;

    const errorData =
      params.type === LogType.CRITICAL_ERROR && params.error
        ? {
            name: params.error.name,
            message: params.error.message,
            stack: params.error.stack,
          }
        : null;

    await prisma.log.create({
      data: {
        tenant_id: params.tenantId,
        type: params.type,
        message: params.message || null,
        user_id: params.userId || null,
        source: params.source,
        module: params.module,
        route: params.route || null,
        ...(hasContent ? {content: params.content} : {}),
        ...(errorData ? {error: errorData} : {}),
      },
    });
  } catch (error) {
    pinoLogger.error({err: error}, "Failed to save log to database");
  }
}

async function log(params: LogParams): Promise<void> {
  try {
    const pinoLogData = {
      type: params.type,
      message: params.message,
      userId: params.userId,
      tenantId: params.tenantId,
      source: params.source,
      module: params.module,
      route: params.route,
      content: params.content,
      ...(params.error ? {err: params.error} : {}),
    };

    switch (params.type) {
      case LogType.CRITICAL_ERROR:
        pinoLogger.error(pinoLogData, params.message || "Critical error occurred");
        break;
      case LogType.ERROR:
        pinoLogger.error(pinoLogData, params.message || "Error occurred");
        break;
      case LogType.WARNING:
        pinoLogger.warn(pinoLogData, params.message || "Warning");
        break;
      case LogType.DEBUG:
        pinoLogger.debug(pinoLogData, params.message || "Debug");
        break;
      case LogType.SUCCESS:
        pinoLogger.info(pinoLogData, params.message || "Success");
        break;
      case LogType.INFO:
      default:
        pinoLogger.info(pinoLogData, params.message || "Info");
        break;
    }

    saveToDatabase(params).catch((err) => {
      pinoLogger.error({err}, "Failed in saveToDatabase");
    });

    if (params.type === LogType.CRITICAL_ERROR) {
      sendDiscordNotification(params).catch((err) => {
        pinoLogger.error({err}, "Failed in sendDiscordNotification");
      });
    }
  } catch (error) {
    console.error("Logger completely failed:", error);
  }
}

export function logCreate(params: Omit<LogParams, "type">): Promise<void> {
  if (process.env.LOGGING_CREATE === "false") return Promise.resolve();
  return log({...params, type: LogType.SUCCESS});
}

export function logUpdate(params: Omit<LogParams, "type">): Promise<void> {
  if (process.env.LOGGING_UPDATE === "false") return Promise.resolve();
  return log({...params, type: LogType.SUCCESS});
}

export function logDelete(params: Omit<LogParams, "type">): Promise<void> {
  if (process.env.LOGGING_DELETE === "false") return Promise.resolve();
  return log({...params, type: LogType.SUCCESS});
}

export function logGet(params: Omit<LogParams, "type">): Promise<void> {
  if (process.env.LOGGING_GET === "false") return Promise.resolve();
  return log({...params, type: LogType.SUCCESS});
}

export function logImportant(params: Omit<LogParams, "type">): Promise<void> {
  return log({...params, type: LogType.SUCCESS});
}

export function logError(params: Omit<LogParams, "type">): Promise<void> {
  return log({...params, type: LogType.ERROR});
}

export function logCritical(params: Omit<LogParams, "type">): Promise<void> {
  return log({...params, type: LogType.CRITICAL_ERROR});
}
