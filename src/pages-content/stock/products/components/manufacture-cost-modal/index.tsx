"use client";
import {Box, Skeleton, TableCell, TableRow, Typography} from "@mui/material";
import {useApiQuery} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {flexGenerator} from "@/src/utils/flex-generator";
import {GenericModal} from "@/src/components/generic-modal";
import {DefaultTable} from "@/src/components/core-table";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ManufactureCostItem, ManufactureCostModalProps} from "./types";

export function ManufactureCostModal(props: ManufactureCostModalProps) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();

  const {data: result, isLoading} = useApiQuery<{items: ManufactureCostItem[]; total: number}>({
    queryKey: ["manufacture-cost", props.product?.id],
    route: `/api/stock/product/${props.product?.id}/manufacture-cost`,
    enabled: props.open && !!props.product?.id,
  });

  const columns: DataTableColumn<ManufactureCostItem>[] = [
    {
      field: "name",
      headerKey: "products.manufactureCostModal.item",
      render: (row) => row.name,
    },
    {
      field: "unity",
      headerKey: "products.manufactureCostModal.unity",
      width: "80px",
      align: "center",
      render: (row) => row.unity || "-",
    },
    {
      field: "quantity",
      headerKey: "products.manufactureCostModal.quantity",
      width: "90px",
      align: "right",
      render: (row) => row.quantity,
    },
    {
      field: "unitCost",
      headerKey: "products.manufactureCostModal.unitCost",
      width: "120px",
      align: "right",
      render: (row) => formatCurrency(row.unitCost, 4),
    },
    {
      field: "totalCost",
      headerKey: "products.manufactureCostModal.totalCost",
      width: "120px",
      align: "right",
      render: (row) => formatCurrency(row.totalCost),
    },
  ];

  const footerRow =
    result && result.items.length > 0 ? (
      <TableRow>
        <TableCell colSpan={4} align="right">
          <Typography variant="subtitle2" fontWeight={600}>
            {translate("products.manufactureCostModal.total")}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="subtitle2" fontWeight={600}>
            {formatCurrency(result.total)}
          </Typography>
        </TableCell>
      </TableRow>
    ) : undefined;

  return (
    <GenericModal
      open={props.open}
      onClose={props.onClose}
      title={`${translate("products.manufactureCostModal.title")} - ${props.product?.name ?? ""}`}
      maxWidth="md"
    >
      {isLoading ? (
        <Box sx={{...flexGenerator("c"), gap: 2, padding: 2}}>
          <Skeleton variant="rectangular" height={200} />
        </Box>
      ) : (
        <DefaultTable<ManufactureCostItem>
          data={result?.items ?? []}
          columns={columns}
          emptyMessageKey="global.noDataFound"
          footerRow={footerRow}
        />
      )}
    </GenericModal>
  );
}
