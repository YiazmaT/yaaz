"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import moment from "moment";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {MovementResultProps} from "./types";

export function MovementResult(props: MovementResultProps) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();
  const {bills, sales, totalBills, totalSales, balance} = props.data;
  const balanceValue = parseFloat(balance);

  function handleDownloadPdf() {
    const params = new URLSearchParams();
    params.append("pdf", "true");
    params.append("generatedAt", new Date().toISOString());
    params.append("dateFrom", props.filters.dateFrom);
    params.append("dateTo", props.filters.dateTo);

    window.open(`/api/reports/finance/movement?${params.toString()}`, "_blank");
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
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1}}>
          <Typography variant="h6" sx={{fontWeight: 600}}>
            {translate("reports.types.movement")}
          </Typography>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>
            {translate("reports.downloadPdf")}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
          {translate("reports.period")}: {moment(props.filters.dateFrom).format("DD/MM/YYYY")} -{" "}
          {moment(props.filters.dateTo).format("DD/MM/YYYY")}
        </Typography>

        <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
          <Box sx={{display: "flex", gap: 3, flexWrap: "wrap"}}>
            <Box sx={{flex: 1, minWidth: 280}}>
              <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                  {translate("reports.movement.salesTable")}
                </Typography>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}}>
                        {translate("reports.movement.paymentMethod")}
                      </TableCell>
                      <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                        {translate("global.total")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.paymentMethod}</TableCell>
                        <TableCell align="right">{formatCurrency(row.total)}</TableCell>
                      </TableRow>
                    ))}
                    {sales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="body2" color="text.secondary">
                            {translate("global.noDataFound")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  {sales.length > 0 && (
                    <TableFooter>
                      <TableRow sx={{backgroundColor: "#f5f5f5"}}>
                        <TableCell sx={{fontWeight: 600}}>{translate("global.total")}</TableCell>
                        <TableCell sx={{fontWeight: 600}} align="right">
                          {formatCurrency(totalSales)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{flex: 1, minWidth: 280}}>
              <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
                <TrendingDownIcon color="error" fontSize="small" />
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                  {translate("reports.movement.billsTable")}
                </Typography>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}}>
                        {translate("reports.columns.category")}
                      </TableCell>
                      <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                        {translate("global.total")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bills.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right">{formatCurrency(row.total)}</TableCell>
                      </TableRow>
                    ))}
                    {bills.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="body2" color="text.secondary">
                            {translate("global.noDataFound")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  {bills.length > 0 && (
                    <TableFooter>
                      <TableRow sx={{backgroundColor: "#f5f5f5"}}>
                        <TableCell sx={{fontWeight: 600}}>{translate("global.total")}</TableCell>
                        <TableCell sx={{fontWeight: 600}} align="right">
                          {formatCurrency(totalBills)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </TableContainer>
            </Box>
          </Box>

          <Divider />

          <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
            <AccountBalanceIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{fontWeight: 600}}>
              {translate("reports.movement.balanceTable")}
            </Typography>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{maxWidth: 400}}>
            <Table size="small">
              <TableBody>
                <TableRow hover>
                  <TableCell>{translate("reports.movement.totalRevenue")}</TableCell>
                  <TableCell align="right" sx={{color: "success.main", fontWeight: 500}}>
                    {formatCurrency(totalSales)}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>{translate("reports.movement.totalExpenses")}</TableCell>
                  <TableCell align="right" sx={{color: "error.main", fontWeight: 500}}>
                    {formatCurrency(totalBills)}
                  </TableCell>
                </TableRow>
                <TableRow sx={{backgroundColor: "#f5f5f5"}}>
                  <TableCell sx={{fontWeight: 700}}>{translate("reports.movement.balance")}</TableCell>
                  <TableCell
                    align="right"
                    sx={{fontWeight: 700, color: balanceValue >= 0 ? "success.main" : "error.main"}}
                  >
                    {formatCurrency(balance)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
