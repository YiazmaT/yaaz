"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {MobileList} from "@/src/components/mobile-list";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {Client} from "../types";
import {Form} from "../components/form";
import {MobileViewProps} from "./types";
import {formatCPF, formatCNPJ} from "@/src/utils/cpf-cnpj";
import {flexGenerator} from "@/src/utils/flex-generator";

export function MobileView(props: MobileViewProps) {
  const {clients} = props;
  const {translate} = useTranslate();
  const theme = useTheme();

  function renderRow(item: Client, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", gap: 2}}>
          <ImagePreview url={item.image} alt={item.name} width={64} height={64} borderRadius={1} />
          <Box sx={{...flexGenerator("c"), minWidth: 0}}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {item.name}
            </Typography>
            {item.description && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {item.description}
              </Typography>
            )}
            {item.email && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {item.email}
              </Typography>
            )}
            {item.phone && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {item.phone}
              </Typography>
            )}
            {item.isCompany && item.cnpj && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {formatCNPJ(item.cnpj)}
              </Typography>
            )}
            {!item.isCompany && item.cpf && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {formatCPF(item.cpf)}
              </Typography>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            ...flexGenerator("r.center.space-between"),
            gap: 1,
            marginTop: 1,
            paddingTop: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Chip
            label={item.isCompany ? translate("clients.company") : translate("clients.person")}
            size="small"
            color={item.isCompany ? "primary" : "default"}
            variant="outlined"
            sx={{mt: 0.5, width: "fit-content"}}
          />
          {actions}
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<Client>
        title="clients.title"
        apiRoute="/api/client/paginated-list"
        renderRow={renderRow}
        onView={clients.handleView}
        onEdit={clients.handleEdit}
        onDelete={clients.handleDelete}
      />

      <Fab
        color="primary"
        size="small"
        onClick={clients.handleCreate}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 20,
        }}
      >
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <Form clients={clients} imageSize={150} />
    </Box>
  );
}
