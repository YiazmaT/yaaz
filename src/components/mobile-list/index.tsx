"use client";
import {useEffect, useState} from "react";
import {Box, Card, TablePagination, Typography, useTheme} from "@mui/material";
import {Loader} from "@/src/components/loader";
import {SearchInput} from "@/src/components/search-input";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {MobileListActions} from "./mobile-list-actions";
import {ApiResponse, MobileListProps} from "./types";

export function MobileList<T = any>(props: MobileListProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(props.defaultRowsPerPage ?? 25);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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

  function handleChangePage(event: unknown, newPage: number) {
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

  function renderActions(row: T) {
    return <MobileListActions row={row} onView={props.onView} onEdit={props.onEdit} hideEdit={props.hideEdit?.(row)} onDelete={props.onDelete} />;
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
      <Box
        sx={{
          padding: 2,
          paddingBottom: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h6" fontWeight={600} color="primary" sx={{marginBottom: props.hideSearch && !props.headerContent ? 0 : 1}}>
          {translate(props.title)}
        </Typography>
        {props.headerContent}
        {!props.hideSearch && <SearchInput onSearch={handleSearch} fullWidth />}
      </Box>

      <Box
        sx={{
          backgroundColor: "white",
          borderBottom: `1px solid ${theme.palette.divider}`,
          overflowX: "hidden",
        }}
      >
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={props.rowsPerPageOptions ?? [5, 10, 25, 50, 100]}
          labelRowsPerPage={translate("global.size")}
          labelDisplayedRows={({from, to, count}) => `${from}-${to} ${translate("global.of")} ${count}`}
          sx={{
            "& .MuiTablePagination-toolbar": {
              minHeight: 40,
              paddingLeft: 1,
              paddingRight: 1,
              justifyContent: "flex-end",
            },
            "& .MuiTablePagination-spacer": {
              display: "none",
            },
          }}
        />
      </Box>

      <Box sx={{flex: 1, overflow: "hidden", position: "relative"}}>
        {loading ? (
          <Box sx={{position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Loader size={80} />
          </Box>
        ) : (
          <Box sx={{height: "100%", overflow: "auto", padding: 2}}>
            {data.length === 0 ? (
              <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
              </Box>
            ) : (
              data.map((row, index) => (
                <Card
                  key={index}
                  sx={{
                    marginBottom: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    borderRadius: 2,
                    cursor: props.onRowClick ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    "&:hover": props.onRowClick
                      ? {
                          backgroundColor: theme.palette.action.hover,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }
                      : {},
                  }}
                  onClick={() => handleRowClick(row)}
                >
                  {props.renderRow(row, renderActions(row))}
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
