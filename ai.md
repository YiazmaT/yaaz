This is a bakery ERP underconstruction.

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
- if you need to format a Date to display, use moment(date).format("DD/MM/YYYY");

# Module structure

- This project has different modules. (login, stock, finance, etc ...);
- Every module has it's own folder at: /src/pages-content;
- When developing something at a module that's used on multiple files inside the same module, extract to a new component (/src/pages-content/module-name/components/new-component-name/index.tsx);
- If a component is going to be used in multiple modules, extract to /src/components instead;

# Backend

- ALL QUERIES MUST INCLUDE tenant_id. you can get it from authenticateRequest function.
- Inside src/page-content/... all the endpoints dto's must be created inside the dto.ts file, if it don't exist create it;
- Numeric fields must be casted before returning to front, do it at prisma.extensions.ts;
- All endpoint must be authenticated with authenticateRequest, this function also returns the user, and the user id must be used on every log call;
- create a `const ROUTE = "/api/ingredient/paginated-list";` with the route of the endpoint, in order to use in the logging options;
- Whenever possible, bring all the data at once and formated thorugh the postgres query, avoid manipulating data on javascript. If you can't bring the data from orm directly, use query string;

# Component beauty

- The beginning of the component must be imports that you square brackets (ex: const [showModal, setShowModal] = useState(false);), then curly brackets (ex: const {translate} = useTranslate();), then no brackets import (ex: theme = useTheme();), then memos, then useEffects, then functions and finally return component. This rule can be flexible if something depends on something else;

# Useful components

- When dispalying an Image, use the component ImagePreview;

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
- For api calls, always use the hook useApi, NO RAW FETCH;
- If you need to confirm something from the user, use the confirm-modal-context.tsx;
- All database entities should have (example fields), and they MUST be updated at edits/creates endpoints:
  creator_id String? @db.Uuid
  creation_date DateTime @default(now())
  creator User? @relation("IngredientCreator", fields: [creator_id], references: [id], onDelete: SetNull)
  last_edit_date DateTime?
  last_editor_id String? @db.Uuid
  last_editor User? @relation("IngredientEditor", fields: [last_editor_id], references: [id], onDelete: SetNull)

# Logging

- Use the logger from /src/lib/logger for everything that needs to be logged;
- Import: `import {logCreate, logUpdate, logDelete, logGet, logError, logImportant, logCritical} from "@/src/lib/logger";`
- Always use enums: LogModule, LogSource;
- Use convenience functions: logCreate, logUpdate, logDelete, logGet, logError, logImportant, logCritical;
- logCritical sends Discord notifications automatically and saves full error stack to database (should only be used in catch blocks);
- Add new modules to LogModule enum as you create them;
- Always include: module, source;
- Include route for API routes (ex: route: "/api/login");
- Include userId when user is authenticated;
- Include content with everything possible:{
  logCreate is used for logging endpoints that create something, the content should be the entire content created;
  logUpdate is used for logging endpoints that update something, the content should have the previous content and the new content;
  logDelete is used for logging endpoints that delete something, the content should be the entire content deleted;
  logGet is used for logging endpoints that get something, the content should be the entire content returned;
  logError is used to log non critical errors, content should have the most possible amount of that that can lead to that error;
  logImportant is used in especial cases that don't fit the rest, like login/logout;
  logCritical is used to log catch cases only.
  }
- ALWAYS await logCritical in catch blocks before returning error response;
- NEVER await other log calls (fire-and-forget pattern);
- Use translation keys for messages when applicable (ex: message: "api.errors.loginOrPasswordIncorrect");
- ALWAYS try to fit the entire log call in a single line, only break the line if the prettier max line width is exceeded;
- Examples from codebase:
  - Error: `logError({module: LogModule.LOGIN, source: LogSource.API, message: "api.errors.loginOrPasswordIncorrect", content: {email, password}, route: "/api/login", tenantId: auth.tenant_id,});`
  - Success: `logImportant({module: LogModule.LOGIN, source: LogSource.API, content: {token}, userId: user.id, route: "/api/login", tenantId: auth.tenant_id,});`
  - Critical: `await logCritical({module: LogModule.LOGIN, source: LogSource.API, error, route: "/api/login", tenantId: auth.tenant_id,});`
  - create: `logCreate({module: LogModule.INGREDIENT, source: LogSource.API, content: ingredient, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id,});`
  - update: `logUpdate({module: LogModule.INGREDIENT, source: LogSource.API, content: {before: existingIngredient, after: ingredient}, route: ROUTE,userId: auth.user!.id, tenantId: auth.tenant_id,});`
  - delete: `logDelete({module: LogModule.INGREDIENT, source: LogSource.API, content: {ingredient}, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id,});`
  - get: `logGet({module: LogModule.INGREDIENT, source: LogSource.API, content: response, userId: auth.user!.id, route: ROUTE, tenantId: auth.tenant_id,});`
