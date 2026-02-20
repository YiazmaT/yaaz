"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {Nfe} from "../../types";
import {NfeModal} from "./nfe-modal";
import {NfeFileModal} from "./file-modal";
import {useNfe} from "./use-nfe";

export function NfeDesktop() {
  const {translate} = useTranslate();
  const nfe = useNfe();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<Nfe>
            apiRoute="/api/finance/nfe/paginated-list"
            columns={nfe.generateConfig()}
            renderOpositeSearch={
              <Button variant="contained" onClick={nfe.handleCreate}>
                {translate("global.include")}
              </Button>
            }
          />
        </Box>
      </Box>
      <NfeModal nfe={nfe} />
      <NfeFileModal nfe={nfe.fileNfe} onClose={nfe.closeFileModal} onFileChange={nfe.handleFileChange} />
    </>
  );
}
