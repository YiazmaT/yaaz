"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {useTranslate} from "@/src/contexts/translation-context";
import {Form} from "../components/form";
import {UnityOfMeasureFiltersComponent} from "../components/filters";
import {UnityOfMeasure} from "../types";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {unityOfMeasure} = props;
  const {translate} = useTranslate();

  return (
    <>
      <ScreenCard title="unityOfMeasure.title">
        <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
          <UnityOfMeasureFiltersComponent onFilterChange={unityOfMeasure.handleFilterChange} />
          <Box sx={{flex: 1, minHeight: 0}}>
            <DataTable<UnityOfMeasure>
              apiRoute="/api/stock/unity-of-measure/paginated-list"
              columns={unityOfMeasure.generateConfig()}
              filters={unityOfMeasure.filters.showInactives ? {showInactives: "true"} : undefined}
              renderOpositeSearch={
                <Button variant="contained" onClick={unityOfMeasure.handleCreate}>
                  {translate("global.include")}
                </Button>
              }
            />
          </Box>
        </Box>
      </ScreenCard>

      <Form unityOfMeasure={unityOfMeasure} />
    </>
  );
}
