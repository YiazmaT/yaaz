"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {UnityOfMeasure} from "../types";
import {Form} from "../components/form";
import {UnityOfMeasureFiltersComponent} from "../components/filters";
import {MobileViewProps} from "./types";
import {flexGenerator} from "@/src/utils/flex-generator";

export function MobileView(props: MobileViewProps) {
  const {unityOfMeasure} = props;
  const {translate} = useTranslate();
  const theme = useTheme();

  function renderRow(item: UnityOfMeasure, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{...flexGenerator("r.center.space-between")}}>
          <Box sx={{...flexGenerator("c"), minWidth: 0, gap: 0.5}}>
            <Typography variant="subtitle1" fontWeight={600}>
              {item.unity}
            </Typography>
            {!item.active && <Chip label={translate("unityOfMeasure.inactive")} size="small" color="error" sx={{alignSelf: "flex-start"}} />}
          </Box>
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <Tooltip title={translate(item.active ? "unityOfMeasure.tooltipDeactivate" : "unityOfMeasure.tooltipActivate")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  unityOfMeasure.handleToggleActive(item);
                }}
              >
                {item.active ? (
                  <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                ) : (
                  <ToggleOffIcon sx={{color: theme.palette.grey[400]}} fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            {actions}
          </Box>
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<UnityOfMeasure>
        title="unityOfMeasure.title"
        apiRoute="/api/stock/unity-of-measure/paginated-list"
        renderRow={renderRow}
        onEdit={unityOfMeasure.handleEdit}
        hideEdit={(row) => !row.active}
        onDelete={unityOfMeasure.handleDelete}
        filters={unityOfMeasure.filters.showInactives ? {showInactives: "true"} : undefined}
        headerContent={<UnityOfMeasureFiltersComponent onFilterChange={unityOfMeasure.handleFilterChange} />}
      />

      <Fab
        color="primary"
        size="small"
        onClick={unityOfMeasure.handleCreate}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 20,
        }}
      >
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <Form unityOfMeasure={unityOfMeasure} />
    </Box>
  );
}
