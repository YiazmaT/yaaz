import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {NfeItemPayload, NfeUpdatePayload} from "@/src/pages-content/finance/nfe/dto";

const ROUTE = "/api/finance/nfe/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, async ({auth, success, error}) => {
    const {id, description, supplier, nfeNumber, date, items, stockAdded, bankDeducted, bankAccountId}: NfeUpdatePayload = await req.json();

    if (!id || !description || !date || !items || !Array.isArray(items) || items.length === 0 || (bankDeducted && !bankAccountId)) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const existing = await prisma.nfe.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {items: true},
    });
    if (!existing) return error("api.errors.notFound", 404, {id});

    const totalAmount = items.reduce((sum: Decimal, item: NfeItemPayload) => {
      return sum.plus(new Decimal(item.quantity).times(new Decimal(item.unitPrice)));
    }, new Decimal(0));

    const wasAdded = existing.stock_added;
    const willAdd = !!stockAdded;

    // Maps keyed by "itemType:itemId" (e.g. "ingredient:abc-123") to diff old vs new
    const oldItemsMap = new Map(
      existing.items.map((item) => [buildItemKey(item.item_type, item.ingredient_id || item.product_id || item.package_id || ""), item]),
    );

    const newItemsMap = new Map(items.map((item) => [buildItemKey(item.itemType, item.itemId), item]));

    const ops = [];

    // 1) Iterate old items: remove deleted ones, update changed ones
    for (const [key, oldItem] of oldItemsMap) {
      const newItem = newItemsMap.get(key);
      const oldQty = new Decimal(oldItem.quantity.toString());
      const itemId = oldItem.ingredient_id || oldItem.product_id || oldItem.package_id || "";

      // Item was removed — delete it and reverse stock if it was previously added
      if (!newItem) {
        ops.push(prisma.nfeItem.delete({where: {id: oldItem.id, tenant_id: auth.tenant_id}}));

        if (wasAdded) {
          switch (oldItem.item_type) {
            case "ingredient":
              if (oldItem.ingredient_id)
                ops.push(prisma.ingredient.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {decrement: oldQty.toNumber()}}}));
              break;
            case "product":
              if (oldItem.product_id)
                ops.push(
                  prisma.product.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {decrement: Math.round(oldQty.toNumber())}}}),
                );
              break;
            case "package":
              if (oldItem.package_id)
                ops.push(prisma.package.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {decrement: oldQty.toNumber()}}}));
              break;
          }
        }
        continue;
      }

      // Item exists in both — update quantity/price
      const newQty = new Decimal(newItem.quantity);
      const newPrice = new Decimal(newItem.unitPrice);
      const newTotal = newQty.times(newPrice);

      ops.push(
        prisma.nfeItem.update({
          where: {id: oldItem.id, tenant_id: auth.tenant_id},
          data: {
            quantity: newQty.toString(),
            unit_price: newPrice.toString(),
            total_price: newTotal.toDecimalPlaces(2).toString(),
          },
        }),
      );

      // Stock adjustment for items that exist in both old and new:
      // - wasAdded && willAdd: only adjust by the DIFFERENCE (e.g. 10->20 = +10, 20->10 = -10)
      // - wasAdded && !willAdd: user unchecked stock flag, reverse old quantity
      // - !wasAdded && willAdd: user checked stock flag, add full new quantity
      // - neither: no stock change
      if (wasAdded && willAdd) {
        const diff = newQty.minus(oldQty);
        if (!diff.isZero()) {
          switch (oldItem.item_type) {
            case "ingredient":
              if (oldItem.ingredient_id) {
                if (diff.isPositive()) {
                  ops.push(prisma.ingredient.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: diff.toNumber()}}}));
                  ops.push(
                    prisma.ingredientCost.create({
                      data: {
                        tenant_id: auth.tenant_id,
                        ingredient_id: itemId,
                        quantity: diff.toString(),
                        price: newPrice.toString(),
                        creator_id: auth.user.id,
                      },
                    }),
                  );
                } else {
                  ops.push(
                    prisma.ingredient.update({
                      where: {id: itemId, tenant_id: auth.tenant_id},
                      data: {stock: {decrement: diff.abs().toNumber()}},
                    }),
                  );
                }
              }
              break;
            case "product":
              if (oldItem.product_id) {
                if (diff.isPositive()) {
                  ops.push(
                    prisma.product.update({
                      where: {id: itemId, tenant_id: auth.tenant_id},
                      data: {stock: {increment: Math.round(diff.toNumber())}},
                    }),
                  );
                } else {
                  ops.push(
                    prisma.product.update({
                      where: {id: itemId, tenant_id: auth.tenant_id},
                      data: {stock: {decrement: Math.round(diff.abs().toNumber())}},
                    }),
                  );
                }
              }
              break;
            case "package":
              if (oldItem.package_id) {
                if (diff.isPositive()) {
                  ops.push(prisma.package.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: diff.toNumber()}}}));
                  ops.push(
                    prisma.packageCost.create({
                      data: {
                        tenant_id: auth.tenant_id,
                        package_id: itemId,
                        quantity: diff.toString(),
                        price: newPrice.toString(),
                        creator_id: auth.user.id,
                      },
                    }),
                  );
                } else {
                  ops.push(
                    prisma.package.update({
                      where: {id: itemId, tenant_id: auth.tenant_id},
                      data: {stock: {decrement: diff.abs().toNumber()}},
                    }),
                  );
                }
              }
              break;
          }
        }
      } else if (wasAdded && !willAdd) {
        switch (oldItem.item_type) {
          case "ingredient":
            if (oldItem.ingredient_id)
              ops.push(prisma.ingredient.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {decrement: oldQty.toNumber()}}}));
            break;
          case "product":
            if (oldItem.product_id)
              ops.push(
                prisma.product.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {decrement: Math.round(oldQty.toNumber())}}}),
              );
            break;
          case "package":
            if (oldItem.package_id)
              ops.push(prisma.package.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {decrement: oldQty.toNumber()}}}));
            break;
        }
      } else if (!wasAdded && willAdd) {
        switch (oldItem.item_type) {
          case "ingredient":
            if (oldItem.ingredient_id) {
              ops.push(prisma.ingredient.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: newQty.toNumber()}}}));
              ops.push(
                prisma.ingredientCost.create({
                  data: {
                    tenant_id: auth.tenant_id,
                    ingredient_id: itemId,
                    quantity: newQty.toString(),
                    price: newPrice.toString(),
                    creator_id: auth.user.id,
                  },
                }),
              );
            }
            break;
          case "product":
            if (oldItem.product_id)
              ops.push(
                prisma.product.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: Math.round(newQty.toNumber())}}}),
              );
            break;
          case "package":
            if (oldItem.package_id) {
              ops.push(prisma.package.update({where: {id: itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: newQty.toNumber()}}}));
              ops.push(
                prisma.packageCost.create({
                  data: {
                    tenant_id: auth.tenant_id,
                    package_id: itemId,
                    quantity: newQty.toString(),
                    price: newPrice.toString(),
                    creator_id: auth.user.id,
                  },
                }),
              );
            }
            break;
        }
      }
    }

    // 2) Iterate new items: create ones that didn't exist before + add stock if flag is on
    for (const [key, newItem] of newItemsMap) {
      if (oldItemsMap.has(key)) continue;

      const newQty = new Decimal(newItem.quantity);
      const newPrice = new Decimal(newItem.unitPrice);
      const newTotal = newQty.times(newPrice);

      ops.push(
        prisma.nfeItem.create({
          data: {
            tenant_id: auth.tenant_id,
            nfe_id: id,
            item_type: newItem.itemType,
            ingredient_id: newItem.itemType === "ingredient" ? newItem.itemId : null,
            product_id: newItem.itemType === "product" ? newItem.itemId : null,
            package_id: newItem.itemType === "package" ? newItem.itemId : null,
            quantity: newQty.toString(),
            unit_price: newPrice.toString(),
            total_price: newTotal.toDecimalPlaces(2).toString(),
          },
        }),
      );

      if (willAdd) {
        switch (newItem.itemType) {
          case "ingredient":
            ops.push(
              prisma.ingredient.update({where: {id: newItem.itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: newQty.toNumber()}}}),
            );
            ops.push(
              prisma.ingredientCost.create({
                data: {
                  tenant_id: auth.tenant_id,
                  ingredient_id: newItem.itemId,
                  quantity: newQty.toString(),
                  price: newPrice.toString(),
                  creator_id: auth.user.id,
                },
              }),
            );
            break;
          case "product":
            ops.push(
              prisma.product.update({
                where: {id: newItem.itemId, tenant_id: auth.tenant_id},
                data: {stock: {increment: Math.round(newQty.toNumber())}},
              }),
            );
            break;
          case "package":
            ops.push(prisma.package.update({where: {id: newItem.itemId, tenant_id: auth.tenant_id}, data: {stock: {increment: newQty.toNumber()}}}));
            ops.push(
              prisma.packageCost.create({
                data: {
                  tenant_id: auth.tenant_id,
                  package_id: newItem.itemId,
                  quantity: newQty.toString(),
                  price: newPrice.toString(),
                  creator_id: auth.user.id,
                },
              }),
            );
            break;
        }
      }
    }

    // 3) Reverse old bank transaction if it existed (will recreate below if still needed)
    if (existing.bank_deducted && existing.bank_transaction_id && existing.bank_account_id) {
      const oldAmount = new Decimal(existing.total_amount.toString());
      ops.push(
        prisma.bankAccount.update({
          where: {id: existing.bank_account_id, tenant_id: auth.tenant_id},
          data: {balance: {increment: oldAmount.toNumber()}},
        }),
      );
      ops.push(prisma.bankTransaction.delete({where: {id: existing.bank_transaction_id}}));
    }

    // 4) Update the NFE header fields
    ops.push(
      prisma.nfe.update({
        where: {id, tenant_id: auth.tenant_id},
        data: {
          description,
          supplier: supplier || null,
          nfe_number: nfeNumber || null,
          date: new Date(date),
          total_amount: totalAmount.toDecimalPlaces(2).toString(),
          stock_added: willAdd,
          bank_deducted: !!bankDeducted,
          bank_account_id: bankDeducted ? bankAccountId : null,
          bank_transaction_id: null,
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
        },
      }),
    );

    // Run all item/stock/bank operations atomically
    await prisma.$transaction(ops);

    // 5) Create new bank transaction if bank deduction is enabled (after transaction so NFE exists)
    if (bankDeducted && bankAccountId) {
      const account = await prisma.bankAccount.findUnique({where: {id: bankAccountId, tenant_id: auth.tenant_id}});
      if (!account) return error("api.errors.notFound", 404);

      const bankTx = await prisma.bankTransaction.create({
        data: {
          tenant_id: auth.tenant_id,
          bank_account_id: bankAccountId,
          type: "nfe_payment",
          amount: totalAmount.toDecimalPlaces(2).toNumber(),
          description: `NFE #${existing.code} - ${description}`,
          date: new Date(date),
          creator_id: auth.user.id,
        },
      });

      await prisma.$transaction([
        prisma.nfe.update({where: {id, tenant_id: auth.tenant_id}, data: {bank_transaction_id: bankTx.id}}),
        prisma.bankAccount.update({
          where: {id: bankAccountId, tenant_id: auth.tenant_id},
          data: {balance: {decrement: totalAmount.toDecimalPlaces(2).toNumber()}},
        }),
      ]);
    }

    const nfe = await prisma.nfe.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {items: true},
    });

    return success("update", nfe);
  });
}

function buildItemKey(type: string, id: string) {
  return `${type}:${id}`;
}
