import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {NfeCreatePayload, NfeItemPayload} from "@/src/pages-content/finance/components/nfe/dto";

const ROUTE = "/api/finance/nfe/create";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const jsonData: NfeCreatePayload = JSON.parse(formData.get("data") as string);
    const file = formData.get("file") as File | null;
    const {description, supplier, nfeNumber, date, items, stockAdded, bankDeducted, bankAccountId} = jsonData;

    if (!description || !date || !items || !Array.isArray(items) || items.length === 0 || (bankDeducted && !bankAccountId)) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const totalAmount = items.reduce((sum: Decimal, item: NfeItemPayload) => {
      return sum.plus(new Decimal(item.quantity).times(new Decimal(item.unitPrice)));
    }, new Decimal(0));

    let fileUrl: string | null = null;
    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return error("finance.nfe.errors.invalidFileType", 400);
      }
      const uploadResult = await uploadToR2(file, "nfe-files", auth.tenant_id);
      if (!uploadResult.success) {
        if (uploadResult.error === "FILE_TOO_LARGE") return error("global.errors.fileTooLarge", 400);
        return error("api.errors.uploadFailed", 400);
      }
      fileUrl = uploadResult.url!;
    }

    const maxCode = await prisma.nfe.aggregate({where: {tenant_id: auth.tenant_id}, _max: {code: true}});
    const nextCode = (maxCode._max.code || 0) + 1;
    const nfe = await prisma.nfe.create({
      data: {
        tenant_id: auth.tenant_id,
        code: nextCode,
        description,
        supplier: supplier || null,
        nfe_number: nfeNumber || null,
        date: new Date(date),
        total_amount: totalAmount.toDecimalPlaces(2).toString(),
        file_url: fileUrl,
        stock_added: !!stockAdded,
        bank_deducted: !!bankDeducted,
        bank_account_id: bankDeducted ? bankAccountId : null,
        creator_id: auth.user.id,
        items: {
          create: items.map((item: NfeItemPayload) => {
            const itemTotal = new Decimal(item.quantity).times(new Decimal(item.unitPrice));
            return {
              tenant_id: auth.tenant_id,
              item_type: item.itemType,
              ingredient_id: item.itemType === "ingredient" ? item.itemId : null,
              product_id: item.itemType === "product" ? item.itemId : null,
              package_id: item.itemType === "package" ? item.itemId : null,
              quantity: item.quantity.toString(),
              unit_price: item.unitPrice.toString(),
              total_price: itemTotal.toDecimalPlaces(2).toString(),
            };
          }),
        },
      },
      include: {items: true},
    });

    if (stockAdded) {
      const ops = [];

      for (const item of items) {
        const qty = new Decimal(item.quantity);
        const price = new Decimal(item.unitPrice);

        switch (item.itemType) {
          case "ingredient":
            ops.push(prisma.ingredient.update({where: {id: item.itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: qty.toNumber()}}}));
            ops.push(
              prisma.ingredientCost.create({
                data: {
                  tenant_id: auth.tenant_id,
                  ingredient_id: item.itemId,
                  quantity: qty.toString(),
                  price: price.toString(),
                  creator_id: auth.user.id,
                },
              }),
            );
            break;
          case "product":
            ops.push(
              prisma.product.update({where: {id: item.itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: Math.round(qty.toNumber())}}}),
            );
            break;
          case "package":
            ops.push(prisma.package.update({where: {id: item.itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: qty.toNumber()}}}));
            ops.push(
              prisma.packageCost.create({
                data: {
                  tenant_id: auth.tenant_id,
                  package_id: item.itemId,
                  quantity: qty.toString(),
                  price: price.toString(),
                  creator_id: auth.user.id,
                },
              }),
            );
            break;
        }
      }

      if (ops.length > 0) await prisma.$transaction(ops);
    }

    if (bankDeducted && bankAccountId) {
      const account = await prisma.bankAccount.findUnique({where: {id: bankAccountId, tenant_id: auth.tenant_id}});
      if (!account) return error("api.errors.notFound", 404);

      const bankTx = await prisma.bankTransaction.create({
        data: {
          tenant_id: auth.tenant_id,
          bank_account_id: bankAccountId,
          type: "nfe_payment",
          amount: totalAmount.toDecimalPlaces(2).toNumber(),
          description: `NFE #${nextCode} - ${description}`,
          date: new Date(date),
          creator_id: auth.user.id,
        },
      });

      await prisma.$transaction([
        prisma.nfe.update({where: {id: nfe.id, tenant_id: auth.tenant_id}, data: {bank_transaction_id: bankTx.id}}),
        prisma.bankAccount.update({
          where: {id: bankAccountId, tenant_id: auth.tenant_id},
          data: {balance: {decrement: totalAmount.toDecimalPlaces(2).toNumber()}},
        }),
      ]);
    }

    return success("create", nfe);
  });
}
