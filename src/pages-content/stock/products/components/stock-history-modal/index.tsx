"use client";
import {Box, List, ListItem, ListItemText, Skeleton, Typography} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {useApiQuery} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import moment from "moment";
import {flexGenerator} from "@/src/utils/flex-generator";
import {GenericModal} from "@/src/components/generic-modal";
import {useProductsConstants} from "../../constants";
import {StockHistoryModalProps, StockHistoryResponse, StockHistoryItem} from "./types";

export function StockHistoryModal(props: StockHistoryModalProps) {
  const {translate} = useTranslate();
  const {stockChangeReasons} = useProductsConstants();

  const {data: history = [], isLoading} = useApiQuery<StockHistoryItem[]>({
    queryKey: ["stock-history", "product", props.productId],
    route: `/api/stock/product/stock-history?productId=${props.productId}`,
    enabled: props.open && !!props.productId,
  });

  function getReasonLabel(reason: string | null): string {
    if (!reason) return "";
    const reasonObj = stockChangeReasons[reason as keyof typeof stockChangeReasons];
    return reasonObj?.label ?? reason;
  }

  return (
    <GenericModal open={props.open} onClose={props.onClose} title={`${translate("products.stockHistory.title")} - ${props.productName}`}>
      {isLoading ? (
        <Box sx={{...flexGenerator("c"), gap: 1, padding: 2}}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={60} />
          ))}
        </Box>
      ) : history.length === 0 ? (
        <Box sx={{...flexGenerator("r.center.center"), padding: 4}}>
          <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
        </Box>
      ) : (
        <List sx={{maxHeight: 400, overflow: "auto"}}>
          {history.map((item) => {
            const isAddition = item.amount > 0;
            return (
              <ListItem
                key={item.id}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  gap: 2,
                }}
              >
                <Box sx={{...flexGenerator("r.center.center")}}>
                  {isAddition ? (
                    <AddCircleOutlineIcon sx={{color: "success.main", fontSize: 28}} />
                  ) : (
                    <RemoveCircleOutlineIcon sx={{color: "error.main", fontSize: 28}} />
                  )}
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{...flexGenerator("r.center"), gap: 1}}>
                      <Typography variant="body1" fontWeight={600} sx={{color: isAddition ? "success.main" : "error.main"}}>
                        {isAddition ? "+" : ""}
                        {item.amount} {translate("products.stockChange.units")}
                      </Typography>
                      {item.type === "stock_change" && (
                        <Typography variant="body2" color="text.secondary">
                          ({item.reason
                            ? getReasonLabel(item.reason)
                            : item.comment
                            ? `${translate("products.stockHistory.stockAdditionNfe")} (${item.comment})`
                            : translate("products.stockHistory.stockAddition")})
                        </Typography>
                      )}
                      {item.type === "stock_cost" && (
                        <Typography variant="body2" color="text.secondary">
                          ({item.comment
                            ? `${translate("products.stockHistory.stockAdditionNfe")} (${item.comment})`
                            : translate("products.stockHistory.stockAddition")})
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box component="span" sx={{...flexGenerator("c")}}>
                      <Typography variant="caption" color="text.secondary">
                        {moment(item.date).format("DD/MM/YYYY HH:mm")}
                        {item.userName && ` - ${translate("products.stockHistory.by")} ${item.userName}`}
                      </Typography>
                      {item.comment && item.reason && (
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          {item.comment}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </GenericModal>
  );
}
