"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {PaymentMethodForm} from "../components/form";
import {PaymentMethodFiltersComponent} from "../components/filters";
import {usePaymentMethods} from "../use-payment-methods";
import {PaymentMethod} from "../types";
import {Can} from "@/src/contexts/ability-context";
import {useAbility} from "@casl/react";
import {AbilityContext} from "@/src/contexts/ability-context";

export function PaymentMethodsMobile() {
  const {translate} = useTranslate();
  const paymentMethods = usePaymentMethods();
  const ability = useAbility(AbilityContext);
  const canEdit = ability.can("edit", "finance.payment_method");
  const canDelete = ability.can("delete", "finance.payment_method");

  function renderRow(item: PaymentMethod, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              {!item.active && <Chip label={translate("finance.paymentMethod.inactive")} size="small" color="error" />}
              <Typography variant="subtitle1" fontWeight={600}>
                {item.name}
              </Typography>
            </Box>
            {item.bank_account_name && (
              <Typography variant="body2" color="text.secondary">
                {item.bank_account_name}
              </Typography>
            )}
          </Box>
          <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
            {canEdit && (
              <Tooltip title={translate(item.active ? "finance.paymentMethod.tooltipDeactivate" : "finance.paymentMethod.tooltipActivate")}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    paymentMethods.handleToggleActive(item);
                  }}
                >
                  {item.active ? (
                    <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                  ) : (
                    <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {actions}
          </Box>
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<PaymentMethod>
        title="finance.paymentMethod.title"
        apiRoute="/api/finance/payment-method/paginated-list"
        renderRow={renderRow}
        onEdit={canEdit ? paymentMethods.handleEdit : undefined}
        hideEdit={(row) => !row.active}
        onDelete={canDelete ? paymentMethods.handleDelete : undefined}
        filters={paymentMethods.filters.showInactives ? {showInactives: "true"} : undefined}
        headerContent={<PaymentMethodFiltersComponent onFilterChange={paymentMethods.handleFilterChange} />}
      />
      <Can I="create" a="finance.payment_method">
        <Fab color="primary" size="small" onClick={paymentMethods.handleCreate} sx={{position: "fixed", bottom: 20, right: 20, zIndex: 20}}>
          <AddIcon sx={{color: "white"}} />
        </Fab>
      </Can>
      <PaymentMethodForm paymentMethods={paymentMethods} />
    </Box>
  );
}
