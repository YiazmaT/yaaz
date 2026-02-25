This is a generic ERP for small businesses, currently under construction.

FOLLOW THESE RULES STRICTLY! ADD THEM TO YOUR CONTEXT AND NEVER COMPACT.

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
- Be careful not to create a key that overlaps another key that has children. Example: if {"global":{"fruits":{"banana": "Banana"}}} exists, never create a key named only global.fruits, as it would break the global.fruits.banana key;
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

- This project has different modules (login, stock, finance, etc.);
- Every module has its own folder at: /src/pages-content;
- When developing something inside a module that is used across multiple files within the same module, extract it to a new component at /src/pages-content/module-name/components/new-component-name/index.tsx;
- If a component will be used across multiple modules, extract it to /src/components instead;

# Backend

- ALL QUERIES MUST INCLUDE tenant_id;
- Inside src/pages-content/..., all endpoint DTOs must be created inside the dto.ts file. If it does not exist, create it;
- Numeric fields must be cast before returning to the frontend — do this at prisma.extensions.ts;
- All authenticated endpoints must use `withAuth` from `src/lib/route-handler.ts`;
- `withAuth(module, route, handler)` handles auth, try/catch, and logCritical automatically;
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

# Component structure

- The beginning of a component must follow this order: square bracket imports (e.g., const [showModal, setShowModal] = useState(false);), then curly bracket imports (e.g., const {translate} = useTranslate();), then no-bracket imports (e.g., theme = useTheme();), then memos, then useEffects, then functions, and finally the return statement. This order can be flexible when one value depends on another;

# Useful components

- When displaying an image, use the ImagePreview component;
- When you need a modal or dialog, use GenericModal from /src/components/generic-modal. Never use MUI Dialog or Modal directly;
- When you need a side drawer (forms, etc.), use GenericDrawer from /src/components/generic-drawer. Never use MUI Drawer directly;

# Forms

- Forms use yup + react-hook-form;
- Inside /src/components/form-fields/ there are form field components. Each component has 2 versions: one for general use and one for use inside a form context;
- The general-use version accepts value and onChange props and can be used anywhere;
- The form-context version is designed to work with a FormContextProvider and typically has a name starting with "Form" (e.g., FormTextInput). This version also has a grid prop that implements Material UI's Grid;
- If you need a new component, create it, but always provide both versions;
- Use /src/components/form-fields/text-input as a base reference when creating a new one;
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
- logCritical (catch blocks) is handled by `withAuth` automatically;
- Add new modules to the LogModule enum as you create them;
- Content guidelines:
  - create: full created entity via `success("create", entity)`;
  - update: entity returned, before/after logged via `success("update", entity, {before: old, after: entity})`;
  - delete: full deleted entity via `success("delete", entity)`;
  - get: full response via `success("get", data)`;
  - error: via `error("translationKey", status, debugData?)`;
  - important: special cases via `success("important", undefined, logData)`;
- Examples:
  - `return success("create", ingredient);`
  - `return success("update", ingredient, {before: existingIngredient, after: ingredient});`
  - `return success("delete", ingredient);`
  - `return success("get", {data, total, page, limit});`
  - `return error("api.errors.missingRequiredFields", 400);`
  - `return error("api.errors.uploadFailed", 400, uploadResult);`

# Existing Utils

- To format money, use formatCurrency from utils;
- To get a text color that contrasts with a background color, use blackOrWhite from utils;
- To validate an email, use validEmailRegex from utils;
- To get tenant or user information, use useTenant — this data is also available in cookies;
- To display an entity name (product, ingredient, package, client), use the `buildName` function from the respective module's `utils.ts` (e.g., `import {buildName} from "@/src/pages-content/products/utils"`). This ensures a consistent format across dropdowns, selectors, mobile cards, dashboard, etc. Desktop table name columns are the exception — they keep the raw name since there is a dedicated code column;
