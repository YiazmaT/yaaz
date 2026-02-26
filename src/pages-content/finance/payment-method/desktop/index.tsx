"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {PaymentMethodForm} from "../components/form";
import {PaymentMethodFiltersComponent} from "../components/filters";
import {usePaymentMethods} from "../use-payment-methods";
import {PaymentMethod} from "../types";

export function PaymentMethodsDesktop() {
  const {translate} = useTranslate();
  const paymentMethods = usePaymentMethods();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <PaymentMethodFiltersComponent onFilterChange={paymentMethods.handleFilterChange} />
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<PaymentMethod>
            apiRoute="/api/finance/payment-method/paginated-list"
            columns={paymentMethods.generateConfig()}
            filters={paymentMethods.filters.showInactives ? {showInactives: "true"} : undefined}
            renderOpositeSearch={
              <Button variant="contained" onClick={paymentMethods.handleCreate}>
                {translate("global.include")}
              </Button>
            }
          />
        </Box>
      </Box>
      <PaymentMethodForm paymentMethods={paymentMethods} />
    </>
  );
}
