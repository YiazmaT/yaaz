"use client";
import {useState} from "react";
import {Box, Button, Collapse, IconButton, Tooltip} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import {useTranslate} from "@/src/contexts/translation-context";
import {FilterDrawerProps} from "./types";

export function FilterDrawer(props: FilterDrawerProps) {
  const {children, hasActiveFilters, onClear, showActionButtons = false, onApply, translationPrefix = "global.filters"} = props;
  const [expanded, setExpanded] = useState(false);
  const {translate} = useTranslate();

  function handleClear() {
    onClear();
  }

  function handleApply() {
    onApply?.();
  }

  return (
    <Box sx={{mb: 1}}>
      <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
        <Tooltip title={expanded ? translate(`${translationPrefix}.close`) : translate(`${translationPrefix}.open`)}>
          <IconButton onClick={() => setExpanded(!expanded)}>
            <FilterListIcon sx={{color: hasActiveFilters ? "error.main" : "inherit"}} />
          </IconButton>
        </Tooltip>
        {hasActiveFilters && (
          <Tooltip title={translate(`${translationPrefix}.clearTooltip`)}>
            <IconButton onClick={handleClear} size="small" color="error">
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            p: 2,
            backgroundColor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {children}

          {showActionButtons && (
            <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1, mt: 2}}>
              <Button variant="outlined" onClick={handleClear}>
                {translate(`${translationPrefix}.clear`)}
              </Button>
              <Button variant="contained" onClick={handleApply}>
                {translate(`${translationPrefix}.apply`)}
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
