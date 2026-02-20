"use client";

import {Box, Paper, TablePagination, useTheme} from "@mui/material";
import {useState} from "react";
import {SearchInput} from "@/src/components/search-input";
import {DefaultTable} from "@/src/components/core-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApiQuery} from "@/src/hooks/use-api";
import {ApiResponse, DataTableProps} from "./types";
import {flexGenerator} from "@/src/utils/flex-generator";

export function DataTable<T = any>(props: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(props.defaultRowsPerPage ?? 25);
  const {translate} = useTranslate();
  const theme = useTheme();

  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const filterParams = props.filters
    ? Object.entries(props.filters)
        .filter(([, value]) => value !== undefined && value !== "")
        .map(([key, value]) => `&${key}=${encodeURIComponent(value!)}`)
        .join("")
    : "";
  const route = `${props.apiRoute}?page=${page + 1}&limit=${rowsPerPage}${searchParam}${filterParams}`;

  const {data: result, isFetching} = useApiQuery<ApiResponse<T>>({
    queryKey: [props.apiRoute, {page, limit: rowsPerPage, search, ...props.filters}],
    route,
  });

  const data = result?.data ?? [];
  const total = result?.total ?? 0;

  function handleChangePage(_: unknown, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <Box sx={{...flexGenerator("r.center.space-between"), py: 2, borderBottom: `1px solid ${theme.palette.divider}`}}>
          <SearchInput onSearch={handleSearch} sx={{width: 400}} />
          {props.renderOpositeSearch}
        </Box>
      )}
      <Box sx={{flex: 1, overflow: "hidden"}}>
        <DefaultTable<T> data={data} columns={props.columns} loading={isFetching} onRowClick={props.onRowClick} />
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
