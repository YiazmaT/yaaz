"use client";
import {ReactNode} from "react";
import {Box, CardContent, Fab, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {MobileList} from "@/src/components/mobile-list";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {Tenant} from "../types";
import {Form} from "../components/form";
import {MobileViewProps} from "./types";
import {flexGenerator} from "@/src/utils/flex-generator";

export function MobileView(props: MobileViewProps) {
  const {tenants} = props;
  const {translate} = useTranslate();
  const theme = useTheme();

  function renderRow(item: Tenant, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", gap: 2}}>
          <ImagePreview url={item.logo} alt={item.name} width={64} height={64} borderRadius={1} />
          <Box sx={{...flexGenerator("c"), minWidth: 0}}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {item.name}
            </Typography>
            {item.primary_color && (
              <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                <Box sx={{width: 16, height: 16, borderRadius: 0.5, backgroundColor: item.primary_color, border: "1px solid #ccc"}} />
                <Typography variant="caption" color="text.secondary">
                  {translate("tenants.fields.primaryColor")}
                </Typography>
              </Box>
            )}
            {item.secondary_color && (
              <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                <Box sx={{width: 16, height: 16, borderRadius: 0.5, backgroundColor: item.secondary_color, border: "1px solid #ccc"}} />
                <Typography variant="caption" color="text.secondary">
                  {translate("tenants.fields.secondaryColor")}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
            marginTop: 1,
            paddingTop: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {actions}
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<Tenant>
        title="tenants.title"
        apiRoute="/api/tenant/paginated-list"
        renderRow={renderRow}
        onView={tenants.handleView}
        onEdit={tenants.handleEdit}
      />

      <Fab color="primary" size="small" onClick={tenants.handleCreate} sx={{position: "fixed", bottom: 20, right: 20, zIndex: 20}}>
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <Form tenants={tenants} imageSize={150} />
    </Box>
  );
}
