import {formatCurrency} from "@/src/utils/format-currency";
import {translate} from "@/src/lib/translate";

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: {name: string; value: string; inline?: boolean}[];
  timestamp?: string;
  footer?: {text: string};
}

interface SendDiscordMessageParams {
  webhookUrl: string;
  username?: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

async function sendDiscordMessage(params: SendDiscordMessageParams): Promise<boolean> {
  if (!params.webhookUrl) {
    console.warn("Discord webhook URL not provided");
    return false;
  }

  try {
    const response = await fetch(params.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: params.username || "Pão de Mato",
        content: params.content,
        embeds: params.embeds,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send Discord message:", error);
    return false;
  }
}

interface SaleItem {
  product: {name: string; price: string | number};
  quantity: number;
}

interface SalePackageItem {
  package: {name: string};
  quantity: number;
}

interface NewSaleNotificationParams {
  total: number;
  items: SaleItem[];
  packages?: SalePackageItem[];
  paymentMethod: string;
}

export async function notifyNewSale(params: NewSaleNotificationParams): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_NEW_SALE_WEBHOOK;

  if (!webhookUrl) {
    console.warn("DISCORD_NEW_SALE_WEBHOOK not configured");
    return false;
  }

  const itemsList = params.items
    .map((item) => `• ${item.quantity}x ${item.product.name} (${formatCurrency(Number(item.product.price))})`)
    .join("\n");

  const packagesList = params.packages
    ?.map((pkg) => `• ${pkg.quantity}x ${pkg.package.name}`)
    .join("\n");

  const fields = [
    {
      name: translate("sales.discord.total"),
      value: `**${formatCurrency(params.total)}**`,
      inline: true,
    },
    {
      name: translate("sales.discord.payment"),
      value: params.paymentMethod,
      inline: true,
    },
  ];

  if (itemsList) {
    fields.push({
      name: translate("sales.discord.items"),
      value: itemsList,
      inline: false,
    });
  }

  if (packagesList) {
    fields.push({
      name: translate("sales.discord.packages"),
      value: packagesList,
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    title: translate("sales.discord.newSaleTitle"),
    color: 0x4caf50,
    fields,
    timestamp: new Date().toISOString(),
    footer: {
      text: process.env.NEXT_PUBLIC_COMPANY_NAME || "Pão de Mato",
    },
  };

  return sendDiscordMessage({
    webhookUrl,
    username: "Vendas",
    embeds: [embed],
  });
}
