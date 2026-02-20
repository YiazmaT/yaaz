"use client";
import {Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {Loader} from "@/src/components/loader";
import {useTranslate} from "@/src/contexts/translation-context";
import {CoreTableProps} from "./types";

export function DefaultTable<T = any>(props: CoreTableProps<T>) {
  const {translate} = useTranslate();

  const headerCellSx = {
    fontWeight: 600,
    backgroundColor: "#fafbfc",
    borderBottom: "2px solid #e0e0e0",
  };

  return (
    <Box sx={{position: "relative"}}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {props.columns.map((column, index) => (
                <TableCell key={index} align={column.align ?? "left"} sx={{...headerCellSx, width: column.width}}>
                  {translate(column.headerKey)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!props.loading && props.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={props.columns.length} align="center">
                  <Typography color="text.secondary">{translate(props.emptyMessageKey ?? "global.noDataFound")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              props.data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  hover={!!props.onRowClick}
                  onClick={() => props.onRowClick?.(row)}
                  sx={{
                    cursor: props.onRowClick ? "pointer" : "default",
                    transition: "background-color 0.2s ease",
                    "&:hover": props.onRowClick ? {backgroundColor: "rgba(0, 0, 0, 0.02)"} : {},
                  }}
                >
                  {props.columns.map((column, colIndex) => (
                    <TableCell key={colIndex} align={column.align ?? "left"}>
                      {column.render ? column.render(row, rowIndex) : String((row as any)[column.field] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {props.footerRow}
          </TableBody>
        </Table>
      </TableContainer>
      {props.loading && (
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
  );
}
