"use client";
import {useState} from "react";
import {Box, Tab, Tabs} from "@mui/material";
import {ScreenCard} from "@/src/components/screen-card";
import {useTranslate} from "@/src/contexts/translation-context";
import {FinanceTab} from "../types";
import {BillsDesktop} from "../components/bills";
import {BankAccountsDesktop} from "../components/bank-accounts";
import {CategoriesDesktop} from "../components/categories";

export function DesktopView() {
  const [tab, setTab] = useState<FinanceTab>(FinanceTab.BILLS);
  const {translate} = useTranslate();

  return (
    <ScreenCard title="finance.title">
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{borderBottom: 1, borderColor: "divider", mb: 2, flexShrink: 0}}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={translate("finance.tabs.bills")} />
            <Tab label={translate("finance.tabs.bank")} />
            <Tab label={translate("finance.tabs.categories")} />
          </Tabs>
        </Box>
        <Box sx={{flex: 1, minHeight: 0}}>
          {tab === FinanceTab.BILLS && <BillsDesktop />}
          {tab === FinanceTab.BANK && <BankAccountsDesktop />}
          {tab === FinanceTab.CATEGORIES && <CategoriesDesktop />}
        </Box>
      </Box>
    </ScreenCard>
  );
}
