"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {Client} from "../types";
import {Form} from "../components/form";
import {ClientsFiltersComponent} from "../components/filters";
import {DesktopViewProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";

export function DesktopView(props: DesktopViewProps) {
  const {translate} = useTranslate();
  const {clients} = props;

  return (
    <>
      <ScreenCard title="clients.title" includeButtonFunction={clients.handleCreate}>
        <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
          <ClientsFiltersComponent onFilterChange={clients.handleFilterChange} />
          <Box sx={{flex: 1, minHeight: 0}}>
            <DataTable<Client>
              apiRoute="/api/client/paginated-list"
              columns={clients.generateConfig()}
              filters={clients.filters.showInactives ? {showInactives: "true"} : undefined}
              renderOpositeSearch={
                <Button variant="contained" onClick={clients.handleCreate}>
                  {translate("global.include")}
                </Button>
              }
            />
          </Box>
        </Box>
      </ScreenCard>

      <Form clients={clients} imageSize={200} />
    </>
  );
}
