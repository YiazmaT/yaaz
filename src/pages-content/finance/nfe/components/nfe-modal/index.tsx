"use client";
import {useRef, useMemo} from "react";
import {Box, Button, Checkbox, Divider, FormControlLabel, Grid, TableCell, TableRow, Typography} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";
import Decimal from "decimal.js";
import {GenericModal} from "@/src/components/generic-modal";
import {DefaultTable} from "@/src/components/core-table";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {useApiQuery} from "@/src/hooks/use-api";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {IngredientsSelector} from "@/src/components/selectors/ingredients-selector";
import {ProductsSelector} from "@/src/components/selectors/products-selector";
import {PackagesSelector} from "@/src/components/selectors/packages-selector";
import {CompositionIngredient} from "@/src/components/selectors/ingredients-selector/types";
import {Product} from "@/src/pages-content/stock/products/types";
import {CompositionPackage} from "@/src/components/selectors/packages-selector/types";
import {flexGenerator} from "@/src/utils/flex-generator";
import {NfeFormItem} from "../../form-config";
import {useNfeItemsTableConfig} from "../../desktop/table-config";
import {NfeModalProps} from "./types";
import {BankAccount} from "../../../bank-accounts/types";

const ACCEPT = "image/*,.pdf";

export function NfeModal(props: NfeModalProps) {
  const {nfe} = props;
  const {translate} = useTranslate();
  const {data: accountsData} = useApiQuery<BankAccount[]>({route: "/api/finance/bank-account/list", queryKey: ["/api/finance/bank-account/list"]});
  const formatCurrency = useFormatCurrency();
  const accounts = accountsData || [];
  const isCreate = nfe.formType === "create";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const file = nfe.watch("file");
  const items = nfe.watch("items");
  const stockAdded = nfe.watch("stockAdded");
  const bankDeducted = nfe.watch("bankDeducted");
  const selectedAccount = nfe.watch("bankAccount") as BankAccount | null;

  const {generateItemsConfig} = useNfeItemsTableConfig({
    onRemove: (index) => {
      nfe.setValue(
        "items",
        items.filter((_: NfeFormItem, i: number) => i !== index),
        {shouldValidate: true},
      );
    },
  });

  const totalAmount = useMemo(() => {
    return items.reduce((sum: Decimal, item: NfeFormItem) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return sum.plus(new Decimal(qty).times(price));
    }, new Decimal(0));
  }, [items]);

  const balanceAfterDeduction = useMemo(() => {
    if (!selectedAccount) return null;
    return Number(selectedAccount.balance) - totalAmount.toNumber();
  }, [selectedAccount, totalAmount]);

  function addItem(option: {id: string; name: string; image?: string | null}, itemType: "ingredient" | "product" | "package") {
    const alreadyExists = items.some((i: NfeFormItem) => i.itemId === option.id && i.itemType === itemType);
    if (alreadyExists) return;

    const newItem: NfeFormItem = {
      id: crypto.randomUUID(),
      itemType,
      itemId: option.id,
      name: option.name,
      image: option.image,
      quantity: "1",
      unitPrice: "0",
    };
    nfe.setValue("items", [...items, newItem], {shouldValidate: true});
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    nfe.setValue("file", f);
  }

  function removeFile() {
    nfe.setValue("file", null);
  }

  const footerRow =
    items.length > 0 ? (
      <TableRow>
        <TableCell colSpan={4} align="right">
          <Typography variant="subtitle2" fontWeight={600}>
            {translate("finance.nfe.fields.totalAmount")}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="subtitle2" fontWeight={600}>
            {formatCurrency(totalAmount.toDecimalPlaces(2).toString())}
          </Typography>
        </TableCell>
        <TableCell />
      </TableRow>
    ) : undefined;

  return (
    <GenericModal title={isCreate ? "finance.nfe.createTitle" : "finance.nfe.editTitle"} open={nfe.showModal} onClose={nfe.closeModal} maxWidth="lg">
      <FormContextProvider control={nfe.control} errors={nfe.errors} formType={nfe.formType}>
        <form id="nfe-form" onSubmit={nfe.handleSubmit(nfe.submit)}>
          <Grid container spacing={2} sx={{marginTop: 2}}>
            <FormTextInput fieldName="description" label="finance.nfe.fields.description" size={4} />
            <FormTextInput fieldName="supplier" label="finance.nfe.fields.supplier" size={3} />
            <FormTextInput fieldName="nfeNumber" label="finance.nfe.fields.nfeNumber" size={2} />
            <FormDatePicker fieldName="date" label="finance.nfe.fields.date" size={3} />
          </Grid>

          <Divider sx={{my: 2}} />

          <Typography variant="subtitle2" sx={{mb: 1}}>
            {translate("finance.nfe.items.add")}
          </Typography>
          <Grid container spacing={2} sx={{mb: 2}}>
            <Grid size={4}>
              <IngredientsSelector
                value={[]}
                onChange={() => {}}
                onSelect={(ingredient: CompositionIngredient) => addItem(ingredient, "ingredient")}
              />
            </Grid>
            <Grid size={4}>
              <ProductsSelector value={[]} onChange={() => {}} onSelect={(product: Product) => addItem(product, "product")} />
            </Grid>
            <Grid size={4}>
              <PackagesSelector value={[]} onChange={() => {}} onSelect={(pkg: CompositionPackage) => addItem(pkg, "package")} />
            </Grid>
          </Grid>

          <DefaultTable<NfeFormItem> data={items} columns={generateItemsConfig()} emptyMessageKey="finance.nfe.items.noItems" footerRow={footerRow} />

          {nfe.errors.items && typeof nfe.errors.items.message === "string" && (
            <Typography variant="caption" color="error" sx={{mt: 1, display: "block"}}>
              {nfe.errors.items.message}
            </Typography>
          )}

          <Divider sx={{my: 2}} />

          {isCreate && (
            <>
              <input ref={fileInputRef} type="file" accept={ACCEPT} hidden onChange={handleFileSelected} />
              <Box sx={{mb: 2}}>
                {file ? (
                  <Box sx={{...flexGenerator("r.center.space-between"), p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1}}>
                    <Box sx={{...flexGenerator("r.center"), gap: 1, minWidth: 0}}>
                      <AttachFileIcon fontSize="small" color="primary" />
                      <Typography variant="body2" noWrap>
                        {file.name}
                      </Typography>
                    </Box>
                    <Button size="small" onClick={removeFile} startIcon={<ClearIcon />}>
                      {translate("global.actions.remove")}
                    </Button>
                  </Box>
                ) : (
                  <Button variant="outlined" startIcon={<AttachFileIcon />} onClick={() => fileInputRef.current?.click()} size="small">
                    {translate("finance.nfe.fields.attachFile")}
                  </Button>
                )}
              </Box>
            </>
          )}

          <Grid container spacing={2}>
            <Grid size={6}>
              <FormControlLabel
                control={<Checkbox checked={stockAdded} onChange={(_, checked) => nfe.setValue("stockAdded", checked)} />}
                label={translate("finance.nfe.fields.addStock")}
              />
            </Grid>
            <Grid size={6}>
              <FormControlLabel
                control={<Checkbox checked={bankDeducted} onChange={(_, checked) => nfe.setValue("bankDeducted", checked)} />}
                label={translate("finance.nfe.fields.deductBank")}
              />
            </Grid>
          </Grid>

          {bankDeducted && (
            <Grid container spacing={2} sx={{mt: 1}}>
              <FormDropdown<BankAccount>
                fieldName="bankAccount"
                label="finance.nfe.fields.bankAccount"
                options={accounts}
                uniqueKey="id"
                buildLabel={(o) => `${o.name} (${formatCurrency(String(o.balance))})`}
                size={6}
              />
              {balanceAfterDeduction !== null && (
                <Grid size={6} sx={{display: "flex", alignItems: "center"}}>
                  <Typography
                    variant="body2"
                    sx={{color: balanceAfterDeduction < 0 || Number(selectedAccount?.balance) < 0 ? "error.main" : "text.secondary"}}
                  >
                    {translate("finance.nfe.fields.balanceAfterDeduction")}: {formatCurrency(String(balanceAfterDeduction))}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}

          <Box sx={{...flexGenerator("r.center.center"), gap: 1, mt: 3}}>
            <Button variant="contained" type="submit" form="nfe-form">
              {translate("global.confirm")}
            </Button>
            <Button onClick={nfe.closeModal} variant="outlined">
              {translate("global.cancel")}
            </Button>
          </Box>
        </form>
      </FormContextProvider>
    </GenericModal>
  );
}
