"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {Sale} from "../types";
import {Form} from "../components/form";
import {SalesFilters} from "../components/filters";
import {DesktopViewProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";

export function DesktopView(props: DesktopViewProps) {
  const {translate} = useTranslate();
  const {sales} = props;

  return (
    <>
      <ScreenCard title="sales.title">
        <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
          <SalesFilters onFilterChange={sales.handleFilterChange} />
          <Box sx={{flex: 1, minHeight: 0}}>
            <DataTable<Sale>
              apiRoute="/api/sale/paginated-list"
              columns={sales.generateConfig()}
              filters={sales.filters}
              renderOpositeSearch={
                <Button variant="contained" onClick={sales.handleCreate}>
                  {translate("global.include")}
                </Button>
              }
            />
          </Box>
        </Box>
      </ScreenCard>

      <Form sales={sales} />
    </>
  );
}
