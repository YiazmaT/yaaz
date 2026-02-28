"use client";
import {Box, Dialog, DialogContent, InputBase, List, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useEffect, useRef, useState} from "react";
import {useTranslate} from "@/src/contexts/translation-context";
import {useNavigate} from "@/src/hooks/use-navigate";
import {MenuItem} from "../../types";
import {FlatRoute, SearchModalProps} from "./types";

export function SearchModal({open, onClose, menuItems}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const {translate} = useTranslate();
  const {navigate} = useNavigate();
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const flatRoutes = flattenMenuItems(menuItems);

  const results = flatRoutes.filter((r) => {
    if (!query) return true;
    const label = r.labelKeys.map((k) => translate(k)).join(" / ");
    return normalizeStr(label).includes(normalizeStr(query));
  });

  function handleSelect(route: string) {
    navigate(route);
    handleClose();
  }

  function handleClose() {
    setQuery("");
    setSelectedIndex(-1);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex].route);
    }
  }

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[selectedIndex] as HTMLElement;
    item?.scrollIntoView({block: "nearest"});
  }, [selectedIndex]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{p: 0}}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <SearchIcon sx={{color: "text.secondary", mr: 1.5, flexShrink: 0}} />
          <InputBase
            inputRef={inputRef}
            fullWidth
            placeholder={translate("navSearch.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{fontSize: 16}}
          />
        </Box>

        <List ref={listRef} sx={{maxHeight: 360, overflow: "auto", py: 0}}>
          {results.length === 0 ? (
            <Box sx={{p: 3, textAlign: "center"}}>
              <Typography variant="body2" color="text.secondary">
                {translate("navSearch.noResults")}
              </Typography>
            </Box>
          ) : (
            results.map((r, i) => {
              const label = r.labelKeys.map((k) => translate(k)).join(" / ");
              const isSelected = i === selectedIndex;
              return (
                <ListItemButton
                  key={r.route}
                  onClick={() => handleSelect(r.route)}
                  onAuxClick={(e) => {
                    if (e.button === 1) {
                      e.preventDefault();
                      window.open(r.route, "_blank");
                    }
                  }}
                  selected={isSelected}
                  sx={{
                    "&:hover": {backgroundColor: `${theme.palette.primary.main}11`},
                    "&.Mui-selected": {backgroundColor: `${theme.palette.primary.main}18`},
                    "&.Mui-selected:hover": {backgroundColor: `${theme.palette.primary.main}28`},
                  }}
                >
                  <ListItemIcon sx={{minWidth: 36, color: isSelected ? theme.palette.primary.main : "text.secondary"}}>{r.icon}</ListItemIcon>
                  <ListItemText primary={label} slotProps={{primary: {variant: "body2"}}} />
                </ListItemButton>
              );
            })
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}

function flattenMenuItems(items: MenuItem[], parentName?: string): FlatRoute[] {
  const result: FlatRoute[] = [];
  for (const item of items) {
    if (item.route) {
      result.push({
        route: item.route,
        icon: item.icon,
        labelKeys: parentName ? [parentName, item.name] : [item.name],
      });
    }
    if (item.children) {
      result.push(...flattenMenuItems(item.children, item.name));
    }
  }
  return result;
}

function normalizeStr(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
