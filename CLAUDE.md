This is a generic ERP for small businesses, currently under construction.

FOLLOW THESE RULES STRICTLY! ADD THEM TO YOUR CONTEXT AND NEVER COMPACT.

# Yaaz — Internal Admin Subsystem

Yaaz is a fully isolated internal admin subsystem for the product owner to manage tenants. It lives entirely under `/yaaz/*` routes and shares the same Next.js app and providers as the intranet, but is strictly separated at every level:

- **Routes:** all pages live at `app/(intranet)/yaaz/`. Public pages under `(public)/`, authenticated pages under `(authenticated)/`;
- **Auth:** separate JWT secret (`YAAZ_JWT_SECRET`), separate httpOnly cookie (`yaaz_token`), separate DB table (`yaaz_user` — no `tenant_id`);
- **User context:** `yaazUser` lives inside `TenantContext` (use `useYaazUser()`). Auth actions (`yaazLogin`, `yaazLogout`) live inside `AuthContext` (use `useYaazAuth()`);
- **Layout:** reuses `AuthenticatedLayout` — the layout detects yaaz mode via `!!yaazUser && pathname.startsWith("/yaaz")` and automatically switches menu items, logout function, and home route;
- **Theme:** always uses default env colors (`NEXT_PUBLIC_PRIMARY_COLOR`, `NEXT_PUBLIC_SECONDARY_COLOR`) — `TenantThemeProvider` forces defaults for all `/yaaz/*` paths;
- **API routes:** live at `app/api/yaaz/`. All endpoints use `withYaazAuth` from `src/lib/yaaz/yaaz-route-handler.ts` instead of `withAuth`. No `tenant_id` in context — logging is pino-only;
- **Database rule exception:** `yaaz_user` is the only table without `tenant_id` — it is a global admin table. All other tables still require `tenant_id`;

# General rules to follow:

- NO AI COMMENTS IN THE MIDDLE OF THE CODE;
- Everything MUST BE mobile-friendly. There is a custom layout specifically for mobile;
- If asked to fix something, fix it on both mobile and desktop versions. If the request specifies only mobile or only desktop, work exclusively on what was specified;
- Use functions instead of const;
- Always use yarn;
- Always use named exports, except for Next.js file conventions (page.tsx, layout.tsx, route.tsx, etc.);
- Always put the interfaces of a specific context in a separate file called types.ts;
- Never destructure props inside a component — always use props.something;
- Always use Material UI components when possible (import from: "@mui/material");
- Icons must also be imported from Material UI;
- When creating files, use kebab-case with all lowercase letters (e.g., new-file-blabla.tsx);
- When creating a component that receives children as props, always use PropsWithChildren;
- If you need to create a function that already exists in another component or context, extract it and import it in both;
- Keep files formatted according to the Prettier rules;
- Avoid useEffects — use them only when absolutely necessary;
- You can add new libraries, but ask first;

# How translation works:

- Any text visible to the client MUST be translated (THIS INCLUDES API ERRORS!);
- There is a hook: const {translate} = useTranslate();
- Passing a key to this function returns the translated string;
- Keys and texts are defined at: /src/locales, where each language has its own JSON file. For now, only Brazilian Portuguese is supported;
- Keys are ALWAYS in English and are built according to their position in the JSON object. Example: {"global":{"banana": "Banana"}} — calling translate('global.banana') returns "Banana";
- Never create a key that is also a parent: if `global.fruits.banana` exists, `global.fruits` must not be a leaf value;
- Keys starting with global should be used for generic and simple words or phrases. For module-specific content, create a new subkey. For example, if working in the stock module and naming a specific field, use stock.fields.fieldName; for a stock-specific error, use stock.errors.something;

# Database

- ALL TABLES MUST HAVE tenant_id — THIS IS A WHITELABEL THAT SHARES THE SAME DATABASE;
- This project uses Prisma as the ORM. Check tables at /prisma/schema.prisma;
- Decimal fields must not have limits — always use @db.Decimal for decimal fields;

# Styling

- Check /src/theme first. If the color you need is not there, add it there and import it from there;
- When using flex, call the flexGenerator function to reduce boilerplate;
- To format a Date for display, use `formatDate` from `src/lib/format-date.ts`. Call `formatDate(date)` for date only, or `formatDate(date, true)` to include time (HH:mm:ss);

# Module structure

- Every module has its own folder at: /src/pages-content;
- When developing something inside a module that is used across multiple files within the same module, extract it to a new component at /src/pages-content/module-name/components/new-component-name/index.tsx;
- If a component will be used across multiple modules, extract it to /src/components instead;

# Backend

- ALL QUERIES MUST INCLUDE tenant_id;
- Inside src/pages-content/..., all endpoint DTOs must be created inside the dto.ts file. If it does not exist, create it;
- Numeric fields must be cast before returning to the frontend — do this at prisma.extensions.ts;
- All authenticated endpoints must use `withAuth` from `src/lib/route-handler.ts`;
- `withAuth(module, route, permission, handler)` handles auth, permission check, try/catch, and logCritical automatically;
- The handler receives a destructured context object `{auth, success, error, log}` — only destructure what you need:
  - `auth` has `user`, `tenant_id`, `tenant` (already validated);
  - `success(action, data?, logContent?)` — logs and returns `{data}` with status 200. If `logContent` is provided, it is logged instead of `data` (useful for update routes that log `{before, after}`);
  - `error(message, status, content?)` — logs the error and returns `{error: message}` with the given status;
  - `log(action, params?)` — standalone logging; only use when `success()` cannot be used (PDF routes, special responses);
- Response patterns:
  - Normal success: `return success("create", entity)` → responds `{data: entity}`;
  - Update with before/after log: `return success("update", entity, {before: old, after: entity})` → responds `{data: entity}`, logs `{before, after}`;
  - Warning flows (stock/price): return `NextResponse.json({success: false, stockWarnings, ...})` directly — the frontend checks `result?.success === false`;
  - Paginated lists: `return success("get", {data, total, page, limit})`;
  - PDF routes: keep `log()` + `return new NextResponse(html, {headers: {"Content-Type": "text/html; charset=utf-8"}})`;
- Create a `const ROUTE = "/api/ingredient/paginated-list";` constant with the route of the endpoint;
- Whenever possible, bring all data at once and formatted through the Postgres query — avoid manipulating data in JavaScript. If the ORM cannot return the data directly, use raw query strings;

# Permissions

- Users belong to a **UserGroup** that holds a set of per-module permissions (`user_group_permission` table — row presence = allowed, row absence = denied);
- **Admins** and **owners** bypass all permission checks;
- Users with no group are blocked from all protected routes;
- Permissions are read from the DB on every request inside `authenticateRequest` and injected into `auth.permissions`;
- **Read routes (`paginated-list`, `list`, `get`, `stock-history`, `cost-history`, dashboard, reports, pdf, etc.) always use `null` — never blocked server-side.** Reason: reference data is needed across modules (e.g. payment methods in the sales form, categories in the bills form). The frontend blocks screen access via `can(key, action)`;
- Write routes (`create`, `edit`, `delete`, `toggle-active`, `pay`, `add-stock`, etc.) declare `KEY` and `ACTION` constants and pass them as the 3rd argument to `withAuth`. The 3rd argument has three forms:
  - `{key: KEY, action: ACTION}` — module permission check; admins/owners bypass automatically:
    ```ts
    const KEY = "sales";
    const ACTION = "create"; // "create" | "edit" | "delete"
    return withAuth(LogModule.SALE, ROUTE, {key: KEY, action: ACTION}, async ({auth, ...}) => {
    ```
  - `"admin"` — admin/owner exclusive (all settings routes: user, user-group):
    ```ts
    return withAuth(LogModule.USER, ROUTE, "admin", async ({auth, ...}) => {
    ```
  - `null` — any authenticated user, no role check (logout, upload, change-password);
- Unauthorized access is logged and returns 403 `"Você não tem permissão para acessar essa rota!"`;
- **Module keys** are defined directly in `src/layouts/authenticated/menus.tsx` — add `permission: {key, actions}` to a menu item and it is automatically included in `MODULE_DEFINITIONS` (`src/lib/permissions.ts`) and the user-group form. No other file needs changing;
- **Client-side (CASL):** the frontend uses `@casl/ability` + `@casl/react` for permission-aware UI. Setup:
  - `AbilityContext` + `Can` component live in `src/contexts/ability-context.tsx`;
  - `AbilityProvider` wraps the entire intranet app in `app/(intranet)/providers.tsx` — reads `user` and `permissions` from `TenantContext`, builds a `MongoAbility` (admin/owner → `manage all`, others → one rule per permission row);
  - The default context value is `manage all`, so Yaaz routes (no `AbilityProvider`) are unaffected;
  - **In table-config hooks:** call `useAbility(AbilityContext)` to get `canEdit` / `canDelete`, then pass `onEdit={canEdit ? props.onEdit : undefined}` and gate mutating `customActions` with `hidden: () => !canEdit`;
  - **In desktop index files:** wrap "Incluir" buttons with `<Can I="create" a="MODULE_KEY">` and AddStock buttons with `<Can I="edit" a="MODULE_KEY">`;
  - **In mobile index files:** wrap create FABs with `<Can I="create" a="MODULE_KEY">`, AddStock FABs with `<Can I="edit" a="MODULE_KEY">`, pass `MobileList onEdit` / `onDelete` conditionally, and gate inline edit-action icon buttons (ToggleActive, StockChange, etc.) with `{canEdit && ...}`;
  - **Never gate** read-only actions: PDF downloads, history modals, file views, statement drawers, receipt views;
  - Permissions are also cached in a plain cookie (`user_permissions`) and refreshed on mount by `AuthSyncProvider` via `/api/auth/me`;

# Component structure

Component body order (flexible when one value depends on another):
1. State: `const [show, setShow] = useState(false)`
2. Destructured hooks: `const {translate} = useTranslate()`
3. Bare hooks: `const theme = useTheme()`
4. Memos
5. Effects
6. Functions
7. `return` statement

# Useful components

Always check `/src/components` before reaching for a raw MUI component or building from scratch. Use custom components whenever something close exists. Only fall back to raw MUI primitives when nothing in `/src/components` fits.

## Layout & Screen

- **ScreenCard** (`/src/components/screen-card`) — standard page wrapper card with title and optional "Include" action button. Use this as the outer shell for every authenticated desktop screen that lists data;

## Data Display

- **DataTable** (`/src/components/data-table`) — paginated desktop table with built-in search, filters, and `useApiQuery` integration. Props: `apiRoute`, `columns`, `filters` (object of extra query params), `defaultRowsPerPage`. Invalidate its cache with `queryClient.invalidateQueries({queryKey: [apiRoute]})`;
- **MobileList** (`/src/components/mobile-list`) — mobile equivalent of DataTable. Same API shape: `apiRoute`, `columns`, `filters`. Use alongside DataTable so every list screen is mobile-friendly;
- **CoreTable** (`/src/components/core-table`) — the base table that DataTable uses internally. Only use this directly when you need full manual control over data fetching;
- **ImagePreview** (`/src/components/image-preview`) — displays an image with a tooltip enlargement on hover; shows a grey placeholder icon if `url` is null. Props: `url`, `width`, `height`, `alt`, `borderRadius`. Always use this instead of a raw `<img>` or MUI `Box` component when displaying entity images;
- **DataColumns** (`/src/components/data-columns`) — exports `ImagePreviewColumn`, `ActionsColumn`, and `TableButton` helpers for building table column definitions. Use these to keep column configs consistent;
- **LinkifyText** (`/src/components/linkify-text`) — Typography that auto-converts URLs in a string to clickable links. Use whenever displaying user-entered text that may contain URLs;

## Modals & Drawers

- **GenericModal** (`/src/components/generic-modal`) — standard modal/dialog with title and close button. **Never use MUI Dialog or Modal directly**;
- **GenericDrawer** (`/src/components/generic-drawer`) — slide-in side drawer with title and close button, used for create/edit/details forms. **Never use MUI Drawer directly**;

## Search & Filters

- **SearchInput** (`/src/components/search-input`) — debounced search field with gradient styling. Used internally by DataTable/MobileList but can also be used standalone;
- **FilterDrawer** (`/src/components/filter-drawer`) — collapsible drawer for filter fields with active-filter indicators and apply/clear actions. Use this whenever a screen needs filters beyond the basic search;

## Loaders

- **TopLoader** (`/src/components/top-loader`) — thin progress bar shown during route transitions. Already mounted globally — do not add it again;
- **Loader** (`/src/components/loader`) — full-screen circular progress with tenant logo overlay. Use for full-page loading states;
- **SmallLoader** (`/src/components/small-loader`) — compact inline circular progress. Use for local/inline loading states;

## Selectors (complex multi-select domain components)

- **IngredientsSelector** (`/src/components/selectors/ingredients-selector`) — multi-select for adding ingredients with quantity and unit cost inputs. Use in any form that composes ingredients;
- **PackagesSelector** (`/src/components/selectors/packages-selector`) — same pattern for packages, with type filtering;
- **ProductsSelector** (`/src/components/selectors/products-selector`) — same pattern for products, with price-change alerts and duplicate increment support;

## Form Fields

All form field components have two exports: a plain version (accepts `value`/`onChange`, usable anywhere) and a `Form*` version (integrates with `FormContextProvider` + react-hook-form `Controller`, adds a MUI Grid wrapper). Always use the `Form*` version inside forms.

All `Form*` components share these props: `fieldName`, `control`, `errors`, `disabled`, `grid` (bool, default true), `size` (Grid columns, default 12), `additionalOnChange`.

- **FormTextInput** — standard text field; supports `isPassword` (toggle visibility) and `multiline`;
- **FormIntegerInput** — integer number field with Brazilian locale formatting and spinner buttons;
- **FormDecimalInput** — decimal number field with configurable `step`; supports `errorAsIcon` for compact error display;
- **FormCurrencyInput** — currency field pre-formatted in BRL (R$); supports `errorAsIcon`;
- **FormMaskedTextInput** — text field with a custom mask (use `9` as digit placeholder);
- **FormDropdown** — autocomplete/select with static options; supports custom `renderOption`;
- **FormAsyncDropdown** — autocomplete with server-side search, debouncing, and infinite scroll pagination; props: `apiRoute`, `uniqueKey`, `buildLabel`, `renderOption`;
- **FormDatePicker** — HTML5 date input with optional `min`/`max` constraints;
- **FormDateTimePicker** — HTML5 datetime-local input with optional `min`/`max` constraints;
- **FormImageInput** — image upload with preview and size validation (default 5 MB);
- **FormColorPicker** — hex color picker with a visual swatch that opens a popover palette and a manual text input; stores value as `#RRGGBB`;
- **FormRadioGroup** — radio button group from a static options array;
- **CheckBox** — checkbox (no `Form*` variant; use `value`/`onChange` directly);

# Forms

- Forms use yup + react-hook-form;
- If you need a new form field component, create both a plain version and a `Form*` version; use `/src/components/form-fields/text-input` as reference;
- Before adding custom behavior to a form component, check whether the required prop already exists;
- Every new form should have a dedicated configuration file in the same scope called form-config.ts, following the hook style, with defaultValues and schema defined there;
- The schema should only include fields that have validation rules (e.g., required). Default values should include every field;
- Use /src/pages-content/login as a simple base example for forms;
- All forms must use Material UI Grid with spacing={1} by default;
- For API calls, always use the hooks from src/hooks/use-api.ts. NO RAW FETCH — this project uses @tanstack/react-query;
- If you need to prompt the user for confirmation, use confirm-modal-context.tsx;
- All database entities should have the following audit fields, and they MUST be updated in create/edit endpoints:
  creator_id String? @db.Uuid
  creation_date DateTime @default(now())
  creator User? @relation("IngredientCreator", fields: [creator_id], references: [id], onDelete: SetNull)
  last_edit_date DateTime?
  last_editor_id String? @db.Uuid
  last_editor User? @relation("IngredientEditor", fields: [last_editor_id], references: [id], onDelete: SetNull)

# Logging

- All logging is handled through `success()`, `error()`, and `log()` from `withAuth` — module, source, route, userId, and tenantId are pre-filled automatically;
- `withAuth` handles logCritical (catch blocks) automatically;
- Add new modules to the LogModule enum as you create them;
- Log call by action:
  - create: `return success("create", entity);`
  - update: `return success("update", entity, {before: old, after: entity});`
  - delete: `return success("delete", entity);`
  - get: `return success("get", {data, total, page, limit});`
  - error: `return error("api.errors.key", status, debugData?);`
  - important: `return success("important", undefined, logData);`

# Existing Utils

- To format money, use formatCurrency from utils;
- To get a text color that contrasts with a background color, use blackOrWhite from utils;
- To validate an email, use validEmailRegex from utils;
- To get tenant or user information, use useTenant — this data is also available in cookies;
- To display an entity name (product, ingredient, package, client), use the `buildName` function from the respective module's `utils.ts` (e.g., `import {buildName} from "@/src/pages-content/products/utils"`). This ensures a consistent format across dropdowns, selectors, mobile cards, dashboard, etc. Desktop table name columns are the exception — they keep the raw name since there is a dedicated code column;

# Audit Module

The Audit screen (`/settings/audit`) is a read-only log viewer. It lives at `src/pages-content/settings/audit/` and follows the standard desktop+mobile split.

## How it works

The user must first select a **module** (e.g. Ingredients) and then an **action type** (Create, Update, Delete) — both are required before results are shown. The table/list is only rendered when both are applied (`showResults = !!(module && action_type)`). The API filters by `type = SUCCESS` and the matching `routes[]` for the selected action.

## File structure

```
src/pages-content/settings/audit/
  constants.ts              — AUDIT_MODULES registry (single source of truth)
  types.ts                  — AuditLog, AuditFilters, AuditActionOption, AuditModuleOption, AuditTranslateFn
  utils.ts                  — getModuleLabel(module), getActionLabel(module, actionType)
  use-audit.ts              — useAudit() hook — state, filters, table config
  index.tsx                 — AuditScreen — desktop/mobile split
  desktop/
    index.tsx               — DesktopView — filter card + ScreenCard with DataTable
    table-config.tsx        — useAuditTableConfig(module, action) — base columns + extraColumns
    types.ts
  mobile/
    index.tsx               — MobileView — filter card + MobileList (grow mode)
    types.ts
  components/filters/
    index.tsx               — AuditFiltersComponent — 4-field form card
    form-config.ts          — useAuditFilterFormConfig() — schema + defaultValues (dates default to last month → today)
    types.ts
  combinations/
    ingredient-create.tsx   — getIngredientCreateColumns() + IngredientCreateContent
    ...                     — one file per module+action combination
```

## AUDIT_MODULES constant

`constants.ts` is the **single source of truth**. It is a `Record<string, {label: string; actions: AuditActionOption[]}>`:

```ts
export const AUDIT_MODULES: Record<string, {label: string; actions: AuditActionOption[]}> = {
  ingredient: {
    label: "global.ingredients",
    actions: [
      {
        action: "create",
        label: "audit.actionTypes.create",
        routes: ["/api/stock/ingredient/create"],
        columnsFactory: getIngredientCreateColumns,
        MobileContent: IngredientCreateContent,
      },
      {action: "update", label: "audit.actionTypes.update", routes: ["/api/stock/ingredient/update"]},
      {action: "delete", label: "audit.actionTypes.delete", routes: ["/api/stock/ingredient/delete"]},
    ],
  },
};
```

- `routes: string[]` — the API filters logs by these routes when the action is selected;
- `columnsFactory?: (translate: AuditTranslateFn) => DataTableColumn<AuditLog>[]` — **plain function** (not a hook) returning extra desktop columns for this combination. Called inside `useAuditTableConfig` which provides `translate`;
- `MobileContent?: ComponentType<{content: any}>` — React component rendered inside each mobile card below a divider. Receives `item.content` (the logged JSON payload);

## Adding a new module+action combination

1. Create `combinations/my-module-action.tsx` — export `getMyModuleActionColumns(translate)` and `MyModuleActionContent`;
2. Register in `AUDIT_MODULES` with the correct `routes`, `columnsFactory`, and `MobileContent`;
3. Add translation keys for the module label and action label;

## Combinations pattern

Each `combinations/` file exports:
- `get<Name>Columns(translate)` — **plain function** (not a hook), called conditionally inside `generateConfig()`;
- `<Name>Content({content: any})` — React component used by `MobileView`; may call hooks freely;
- `FIELDS` constant (`{labelKey: string; getValue: (c: any) => any}[]`) — shared between both for DRY field definitions;

Desktop column layout: image left (52×52, borderRadius 6) + inline `label: value` caption rows on the right. Mobile content mirrors this layout.

## API endpoint

`app/api/audit/paginated-list/route.ts` — `GET`, requires `"admin"` permission.

Filters: `module`, `action_type` (resolved to `routes[]` via `AUDIT_MODULES`), `date_from`, `date_to` (timezone-aware via `fromZonedTime`), `search`.

Search covers: `route`, `message`, `user.name`, and the JSONB `content` column — the last one via `$queryRaw` (`content::text ILIKE '%search%'`) because Prisma cannot do case-insensitive full-text search on JSONB natively.

## MobileList grow mode

`MobileList` accepts a `grow` prop. When `true`, the component expands to its natural height (no internal scroll) — the parent layout's `overflow: auto` becomes the scroll container. Use this whenever the page has a large top card (like the audit filter card) that would otherwise steal too much viewport from the list.
