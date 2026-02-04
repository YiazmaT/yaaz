"use client";
import {Box, Button, Card, CardContent, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import {useTranslate} from "@/src/contexts/translation-context";
import {StockLevelsResultProps} from "./types";

export function StockLevelsResult(props: StockLevelsResultProps) {
  const {translate} = useTranslate();

  function handleDownloadPdf() {
    const params = new URLSearchParams();
    params.append("data", JSON.stringify(props.data));
    params.append("generatedAt", new Date().toISOString());
    params.append("type", props.filters.type?.value ?? "all");
    params.append("belowMinimumOnly", String(props.filters.belowMinimumOnly));

    window.open(`/api/reports/stock/stock-levels/pdf?${params.toString()}`, "_blank");
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "critical":
        return "error";
      case "low":
        return "warning";
      default:
        return "success";
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case "ingredient":
        return translate("global.ingredients");
      case "product":
        return translate("global.products");
      case "package":
        return translate("global.packages");
      default:
        return type;
    }
  }

  return (
    <Card
      sx={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        borderRadius: 2,
        transition: "box-shadow 0.3s ease",
        "&:hover": {boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)"},
      }}
    >
      <CardContent sx={{p: 3}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
          <Typography variant="h6" sx={{fontWeight: 600}}>
            {translate("reports.types.stockLevels")}
          </Typography>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>
            {translate("reports.downloadPdf")}
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{maxHeight: 400}}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}}>{translate("reports.columns.name")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}}>{translate("reports.columns.type")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.currentStock")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.minStock")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}}>{translate("reports.columns.unit")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="center">{translate("reports.columns.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{getTypeLabel(row.type)}</TableCell>
                  <TableCell align="right">{row.currentStock}</TableCell>
                  <TableCell align="right">{row.minStock}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell align="center">
                    <Chip label={translate(`reports.status.${row.status}`)} color={getStatusColor(row.status)} size="small" />
                  </TableCell>
                </TableRow>
              ))}
              {props.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
