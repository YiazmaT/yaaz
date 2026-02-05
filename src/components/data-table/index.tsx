"use client";

import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, useTheme} from "@mui/material";
import {useEffect, useState} from "react";
import {Loader} from "@/src/components/loader";
import {SearchInput} from "@/src/components/search-input";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {ApiResponse, DataTableProps} from "./types";

export function DataTable<T = any>(props: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(props.defaultRowsPerPage ?? 25);
  const {translate} = useTranslate();
  const api = useApi();
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, search, props.filters]);

  async function fetchData() {
    setLoading(true);
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const filterParams = props.filters
      ? Object.entries(props.filters)
          .filter(([, value]) => value !== undefined && value !== "")
          .map(([key, value]) => `&${key}=${encodeURIComponent(value!)}`)
          .join("")
      : "";
    const result = await api.fetch<ApiResponse<T>>("GET", `${props.apiRoute}?page=${page + 1}&limit=${rowsPerPage}${searchParam}${filterParams}`, {
      hideLoader: true,
    });
    if (result) {
      setData(result.data);
      setTotal(result.total);
    } else {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  }

  function handleChangePage(_: unknown, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  function handleRowClick(row: T) {
    if (props.onRowClick) {
      props.onRowClick(row);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  return (
    <Paper
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "none",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {!props.hideSearch && (
        <Box sx={{py: 2, borderBottom: `1px solid ${theme.palette.divider}`}}>
          <SearchInput onSearch={handleSearch} sx={{width: 400}} />
        </Box>
      )}
      <Box sx={{flex: 1, overflow: "hidden", position: "relative"}}>
        <TableContainer sx={{height: "100%", overflow: "auto"}}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {props.columns.map((column, index) => (
                  <TableCell
                    key={index}
                    align={column.align ?? "left"}
                    sx={{
                      width: column.width,
                      fontWeight: 600,
                      backgroundColor: "#fafbfc",
                      borderBottom: "2px solid #e0e0e0",
                    }}
                  >
                    {translate(column.headerKey)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={props.columns.length} align="center">
                    <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    hover={!!props.onRowClick}
                    onClick={() => handleRowClick(row)}
                    sx={{
                      cursor: props.onRowClick ? "pointer" : "default",
                      transition: "background-color 0.2s ease",
                      "&:hover": props.onRowClick ? {backgroundColor: "rgba(0, 0, 0, 0.02)"} : {},
                    }}
                  >
                    {props.columns.map((column, colIndex) => (
                      <TableCell key={colIndex} align={column.align ?? "left"}>
                        {column.render ? column.render(row) : String((row as any)[column.field] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              top: 57,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <Loader size={80} />
          </Box>
        )}
      </Box>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${theme.palette.divider}`}}>
        <Box>{props.footerLeftContent}</Box>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={props.rowsPerPageOptions ?? [5, 10, 25, 50, 100]}
          labelRowsPerPage={translate("global.rowsPerPage")}
          labelDisplayedRows={({from, to, count}) => `${from}-${to} ${translate("global.of")} ${count}`}
        />
      </Box>
    </Paper>
  );
}
