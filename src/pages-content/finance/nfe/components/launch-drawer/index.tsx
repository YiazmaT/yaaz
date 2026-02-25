"use client";
import {Box, Button, Chip, Divider, Typography} from "@mui/material";
import Decimal from "decimal.js";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {LaunchPreviewItem} from "../launch-content/types";
import {NfeLaunchDrawerProps} from "./types";

const ITEM_TYPE_ORDER = ["ingredient", "product", "package"] as const;

export function NfeLaunchDrawer({open, mode, items, onConfirm, onClose}: NfeLaunchDrawerProps) {
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

  function renderItem(item: LaunchPreviewItem) {
    const current = new Decimal(item.stock);
    const delta = new Decimal(item.quantity);
    const final = isDelete ? current.minus(delta) : current.plus(delta);
    const unity = item.unity || "";

    const fmt = (n: Decimal) => n.toNumber().toLocaleString("pt-BR", {maximumFractionDigits: 4});

    return (
      <Box key={item.id} sx={{display: "flex", alignItems: "center", gap: 1.5, py: 1}}>
        <ImagePreview url={item.image ?? null} alt={item.name} width={36} height={36} borderRadius={1} />
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {item.name}
          </Typography>
          <Box sx={{display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", mt: 0.25}}>
            <Typography variant="caption" color="text.secondary">
              {fmt(current)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              →
            </Typography>
            <Typography variant="caption" fontWeight={700} color={isDelete ? "error.main" : "success.main"}>
              {fmt(final)}
            </Typography>
            {unity && (
              <Typography variant="caption" color="text.secondary">
                {unity}
              </Typography>
            )}
            <Chip
              label={`${isDelete ? "-" : "+"}${fmt(delta)}`}
              size="small"
              color={isDelete ? "error" : "success"}
              sx={{height: 18, fontSize: 10, ml: 0.5}}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <GenericDrawer title={isDelete ? "finance.nfe.deleteConfirmWithStock" : "finance.nfe.launch"} show={open} onClose={onClose}>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{flex: 1}}>
          <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            {translate(isDelete ? "finance.nfe.deleteConfirmWithStock" : "finance.nfe.launchConfirm")}
          </Typography>

          {ITEM_TYPE_ORDER.map((type) => {
            const group = grouped[type];
            if (group.length === 0) return null;

            return (
              <Box key={type} sx={{mb: 2}}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{textTransform: "uppercase", letterSpacing: 0.5}}>
                  {sectionLabel[type]}
                </Typography>
                <Divider sx={{mt: 0.5, mb: 0.5}} />
                {group.map(renderItem)}
              </Box>
            );
          })}
        </Box>

        <Box sx={{pt: 2}}>
          <Button variant="contained" color={isDelete ? "error" : "primary"} fullWidth onClick={onConfirm}>
            {translate("global.confirm")}
          </Button>
        </Box>
      </Box>
    </GenericDrawer>
  );
}
