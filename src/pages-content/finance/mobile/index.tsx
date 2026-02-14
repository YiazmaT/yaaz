"use client";
import {useState} from "react";
import {Box, Tab, Tabs, Typography} from "@mui/material";
import {useTranslate} from "@/src/contexts/translation-context";
import {FinanceTab} from "../types";
import {BillsMobile} from "../components/bills/mobile";
import {BankAccountsMobile} from "../components/bank-accounts/mobile";
import {CategoriesMobile} from "../components/categories/mobile";

export function MobileView() {
  const [tab, setTab] = useState<FinanceTab>(FinanceTab.BILLS);
  const {translate} = useTranslate();

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
      <Box sx={{p: 2, pb: 0}}>
        <Typography variant="h5" fontWeight={600} sx={{mb: 1}}>
          {translate("finance.title")}
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label={translate("finance.tabs.bills")} />
          <Tab label={translate("finance.tabs.bank")} />
          <Tab label={translate("finance.tabs.categories")} />
        </Tabs>
      </Box>
      <Box sx={{flex: 1, minHeight: 0, overflow: "auto"}}>
        {tab === FinanceTab.BILLS && <BillsMobile />}
        {tab === FinanceTab.BANK && <BankAccountsMobile />}
        {tab === FinanceTab.CATEGORIES && <CategoriesMobile />}
      </Box>
    </Box>
  );
}
