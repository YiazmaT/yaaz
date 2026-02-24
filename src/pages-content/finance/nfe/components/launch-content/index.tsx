"use client";
import {Box, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import Decimal from "decimal.js";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {NfeLaunchContentProps} from "./types";

const ITEM_TYPE_ORDER = ["ingredient", "product", "package"] as const;

export function NfeLaunchContent({items, mode = "launch"}: NfeLaunchContentProps) {
  const {translate} = useTranslate();
  const isDelete = mode === "delete";

  const grouped = {
    ingredient: items.filter((i) => i.item_type === "ingredient"),
    product: items.filter((i) => i.item_type === "product"),
    package: items.filter((i) => i.item_type === "package"),
  };

  const sectionLabel: Record<string, string> = {
    ingredient: translate("global.ingredients"),
    product: translate("global.products"),
    package: translate("global.packages"),
  };

  return (
    <Box sx={{width: "100%", mt: 2}}>
      {ITEM_TYPE_ORDER.map((type) => {
        const group = grouped[type];
        if (group.length === 0) return null;

        return (
          <Box key={type} sx={{mb: 3}}>
            <Typography variant="subtitle2" fontWeight={700} sx={{mb: 0.5}}>
              {sectionLabel[type]}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{translate("finance.nfe.items.name")}</TableCell>
                  <TableCell align="right">{translate("finance.nfe.launchPreview.currentStock")}</TableCell>
                  <TableCell align="right">{translate(isDelete ? "finance.nfe.launchPreview.removing" : "finance.nfe.launchPreview.adding")}</TableCell>
                  <TableCell align="right">{translate("finance.nfe.launchPreview.finalStock")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.map((item) => {
                  const unity = item.unity ? `(${item.unity})` : "";
                  const current = new Decimal(item.stock);
                  const delta = new Decimal(item.quantity);
                  const final = isDelete ? current.minus(delta) : current.plus(delta);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                          <ImagePreview url={item.image ?? null} alt={item.name} width={30} height={30} borderRadius={1} />
                          <Typography variant="body2">{item.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {current.toDecimalPlaces(2).toString()} {unity}
                      </TableCell>
                      <TableCell align="right" sx={{color: isDelete ? "error.main" : "success.main", fontWeight: 600}}>
                        {isDelete ? "-" : "+"}{delta.toDecimalPlaces(2).toString()} {unity}
                      </TableCell>
                      <TableCell align="right" sx={{fontWeight: 600}}>
                        {final.toDecimalPlaces(2).toString()} {unity}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        );
      })}
    </Box>
  );
}
