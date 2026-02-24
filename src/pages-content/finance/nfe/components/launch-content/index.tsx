"use client";
import {Box, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import Decimal from "decimal.js";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {NfeLaunchContentProps} from "./types";

const ITEM_TYPE_ORDER = ["ingredient", "product", "package"] as const;

export function NfeLaunchContent({items}: NfeLaunchContentProps) {
  const {translate} = useTranslate();

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
                  <TableCell align="right">{translate("finance.nfe.launchPreview.adding")}</TableCell>
                  <TableCell align="right">{translate("finance.nfe.launchPreview.finalStock")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.map((item) => {
                  const entity = item.ingredient ?? item.product ?? item.package;
                  const unity = entity?.unity_of_measure?.unity ? `(${entity?.unity_of_measure?.unity})` : "";
                  const current = new Decimal(String(entity?.stock ?? 0));
                  const adding = new Decimal(String(item.quantity));
                  const final = current.plus(adding);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                          <ImagePreview url={entity?.image ?? null} alt={entity?.name ?? ""} width={30} height={30} borderRadius={1} />
                          <Typography variant="body2">{entity?.name ?? "-"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {current.toDecimalPlaces(2).toString()} {unity}
                      </TableCell>
                      <TableCell align="right" sx={{color: "success.main", fontWeight: 600}}>
                        +{adding.toDecimalPlaces(2).toString()} {unity}
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
