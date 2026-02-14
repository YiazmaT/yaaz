This is a generic ERP for small business underconstruction.

FOLLOW THIS RULES STRICTLY!: ADD THEN TO YOU CONTEXT AND NEVER COMPACT.

# General rules to follow:

- NO AI COMMENTS IN THE MIDDLE OF THE CODE;
- Everything MUST BE mobile friendly, there's a custom layout only for mobile;
- If I ask you to fix something, fix on mobile and desktop versions. But if I say specifly mobile or desktop, only work on what i said;
- Use functions instead of const;
- Always use yarn;
- Always named exports, except if it's a nextjs file rule (page.tsx, layout.tsx, route.tsx, etc ...);
- Always put the interfaces of a specific context on a separeted file called types.ts;
- Never destruct props at a component, always use props.something;
- Always use material ui components when possible (import them from: "@mui/material");
- Icons should be used from material as well;
- When creating files use the - pattern with all letters in minuscule (new-file-blabla.tsx);
- When creating a component that receives children as props, always use PropsWithChildren;
- If you are going to create a new function that already exists in another component/context, extract it and import im both;
- Keep the files formated with the prettier rules;
- Avois useEffects, use it only if it's extremely necessary;
- You can add new libs, just ask first;

# How translation works:

- Any text this will be visible to client MUST be translated (THIS ISCLUDES API ERRORS!);
- There's a hook: const {translate} = useTranslate();
- When you give this translate function a key, it will be translated;
- The keys and texts should be written at: /src/locales where each language will have their own json file, but for now there will only be brazilian portuguese;
- Keys are ALWAYS in english, and they arey builded according to the position in the json object. Example: {"global":{"banana": "Banana"}}, if you call translate('global.banana') it will return Banana;
- Be careful to not create a key that overlaps another key with children. Example: if there's {"global":{fruits: {"banana": "Banana"}}}, you should never create a new key that's called only global.fruits alone, otherwise it will break the global.fruits.banana key;
- The key that starts with global, should be use to generic and simple words or phrases. If you are doing something specific, create a new subkey. For example, if you are working at stock module and you need give a name to a specific field, you can create stock.fields.test, if you need an error speficic for stock, use stock.errors.something;

# Database

- ALL TABLES MUST HAVE tenant_id, THIS IS A WHITELABEL THAT SHARES THE SAME DATABASE.
- This project uses prisma as orm, you can check the tables at /prisma/schema.prisma;
- Decimal fields should not have limits, always use @db.Decimal for decimal fields;

# Styling

- Take a look at /src/theme , if the color you need is not there, add it there and import it from there;
- when you need to use flex, call the function flexGenerator to save some lines;
- if you need to format a Date to display, use `formatDate` from `src/lib/format-date.ts`. Call `formatDate(date)` for date only or `formatDate(date, true)` to include time (HH:mm:ss);

# Module structure

- This project has different modules. (login, stock, finance, etc ...);
- Every module has it's own folder at: /src/pages-content;
- When developing something at a module that's used on multiple files inside the same module, extract to a new component (/src/pages-content/module-name/components/new-component-name/index.tsx);
- If a component is going to be used in multiple modules, extract to /src/components instead;

# Backend

- ALL QUERIES MUST INCLUDE tenant_id.
- Inside src/page-content/... all the endpoints dto's must be created inside the dto.ts file, if it don't exist create it;
- Numeric fields must be casted before returning to front, do it at prisma.extensions.ts;
- All authenticated endpoints must use `withAuth` from `src/lib/route-handler.ts`;
- `withAuth(module, route, handler)` handles auth, try/catch, and logCritical automatically;
- Handler receives a destructured context object `{auth, success, error, log}` — only destructure what you need;
  - `auth` has `user`, `tenant_id`, `tenant` (already validated);
  - `success(action, data?, logContent?)` — logs and returns `{data}` with status 200. If `logContent` is provided, logs that instead of `data` (useful for update routes that log `{before, after}`);
  - `error(message, status, content?)` — logs the error and returns `{error: message}` with the given status;
  - `log(action, params?)` — standalone logging, only use when `success()` can't be used (PDF routes, special responses);
- Response patterns:
  - Normal success: `return success("create", entity)` → responds `{data: entity}`;
  - Update with before/after log: `return success("update", entity, {before: old, after: entity})` → responds `{data: entity}`, logs `{before, after}`;
  - Warning flows (stock/price): return `NextResponse.json({success: false, stockWarnings, ...})` directly — frontend checks `result?.success === false`;
  - Paginated lists: `return success("get", {data, total, page, limit})`;
  - PDF routes: keep `log()` + `return new NextResponse(html, {headers: {"Content-Type": "text/html; charset=utf-8"}})`;
- Create a `const ROUTE = "/api/ingredient/paginated-list";` with the route of the endpoint;
- Whenever possible, bring all the data at once and formated through the postgres query, avoid manipulating data on javascript. If you can't bring the data from orm directly, use query string;

# Component beauty

- The beginning of the component must be imports that you square brackets (ex: const [showModal, setShowModal] = useState(false);), then curly brackets (ex: const {translate} = useTranslate();), then no brackets import (ex: theme = useTheme();), then memos, then useEffects, then functions and finally return component. This rule can be flexible if something depends on something else;

# Useful components

- When dispalying an Image, use the component ImagePreview;
- When you need a modal/dialog, use GenericModal from /src/components/generic-modal. Never use MUI Dialog or Modal directly;
- When you need a side drawer (forms, etc), use GenericDrawer from /src/components/generic-drawer. Never use MUI Drawer directly;

# Forms ... Oh boy we are going to see a lot of these around here.

- Basically, yup + react-hook-form;
- Inside /src/components/form-fields/ is where the magic begins ... every component here has 2 forms. One is for general use and the other one is to be used inside a form;
- General use is pretty simple, you can use the component wherever you want, just give value and onChange, be happy;
- The other version is to be used with a FormContextProvider, normally the name starts with "Form" (ex: FormTextInput). This version also has a grid prop, that implements Material Ui's grid.
- If you need a new component, feel free to make it, but always remember to make this 2 versions.
- You can stop here and check the component /src/components/form-fields/text-input use this as a base for creating a new one.
- Whenever you need some different action from a form component, first check if it doesn't already exists in the props.
- Every new form should have a dedicated file for configuring defaultValues and schema (create a new file, in the same scope called form-config.ts, following hook style).
- Schema should only have fields that have rules (required for example), but default values should have every field.
- Stop here and check login component, it's simple and can be used as base example. (/src/pages-content/login);
- All forms must have Grid from material ui with spacing={1} by default;
- For api calls, always use the hooks inside src/hooks/use-api.ts, NO RAW FETCH; this project uses @tanstack/react-query;
- If you need to confirm something from the user, use the confirm-modal-context.tsx;
- All database entities should have (example fields), and they MUST be updated at edits/creates endpoints:
  creator_id String? @db.Uuid
  creation_date DateTime @default(now())
  creator User? @relation("IngredientCreator", fields: [creator_id], references: [id], onDelete: SetNull)
  last_edit_date DateTime?
  last_editor_id String? @db.Uuid
  last_editor User? @relation("IngredientEditor", fields: [last_editor_id], references: [id], onDelete: SetNull)

# Logging

- All logging is handled through `success()`, `error()`, and `log()` from `withAuth` — module, source, route, userId, tenantId are pre-filled;
- logCritical (catch blocks) is handled by `withAuth` automatically;
- Add new modules to LogModule enum as you create them;
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
- whenever you need to format money, use formatCurrency from utils;
- whenever you need to add a text in contrast to a color, use blackOrWhite from utils;
- whenever you need to validate an email, use validEmailRegex from utils;
- whenever you need to get tenant or user informations, get it from useTenant, you also have this info at cookies;
- whenever you need to display an entity name (product, ingredient, package, client), use the `buildName` function from the respective module's `utils.ts` (e.g. `import {buildName} from "@/src/pages-content/products/utils"`). This ensures a consistent format across dropdowns, selectors, mobile cards, dashboard, etc. Desktop table name columns are the exception — they keep the raw name since there's a dedicated code column;