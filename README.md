<strong>**DO NOT DISTRIBUTE OR PUBLICLY POST SOLUTIONS TO THESE LABS. MAKE ALL FORKS OF THIS REPOSITORY WITH SOLUTION CODE PRIVATE. PLEASE REFER TO THE STUDENT CODE OF CONDUCT AND ETHICAL EXPECTATIONS FOR COLLEGE OF INFORMATION TECHNOLOGY STUDENTS FOR SPECIFICS. **</strong>

# FeatherLiteBooks

**A lightweight ERP and accounting web application for small business owners to manage inventory, sales (invoicing), expenses, and basic accounting. FeatherLiteBooks aims to replace spreadsheets and complex enterprise software by offering clarity and efficiency.**

Developed by: Zachary R. Gamble
Repository: GitLab (Private/Link to be added)

---

## Table of Contents

- [Core Principles & Design Goals](#core-principles--design-goals)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Running Tests (TDD Workflow)](#running-tests-tdd-workflow)
- [Linting and Formatting](#linting-and-formatting)
- [Type Checking](#type-checking)
- [Directory Structure](#directory-structure)
- [Supabase Integration](#supabase-integration)
- [Figma Mockup Mapping](#figma-mockup-mapping)
- [Further Development Notes](#further-development-notes)

---

**Project-Specific Guidance Incorporated:**

-   "The application targets small business owners; the UI should be extremely intuitive, clean, and avoid complex financial jargon, aligning with the 'FeatherLite' branding."
-   "A core architectural requirement is a clear distinction between public-facing screens (Landing, Login, Signup) and authenticated screens which will form the main application."
-   "Authenticated sections should primarily use a **Top Tab Navigator** for main modules: Dashboard, Inventory, Invoices (Sales), Expenses, and Reports."
-   "The Settings screen is accessible within the authenticated part of the app."
-   "All textual references to 'FlowBooks' from mockups have been corrected to 'FeatherLiteBooks'."
-   "List screens (e.g., Inventory, Invoices, Expenses) include structural placeholders for Search and Filter functionalities."
-   "The 'New Invoice' screen includes a mechanism for selecting a Customer/Client."
-   "The scaffolding demonstrates a clear pattern for CRUD (Create, Read, Update, Delete) operations (e.g., for Inventory)."
-   "Example Supabase calls are tailored to FeatherLiteBooks entities."

---

## Project Setup

1.  **Clone the repository (if applicable).**
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up Environment Variables:** See the [Environment Variables](#environment-variables) section below.
4.  **Generate Supabase Types (Highly Recommended):**
    After setting up your Supabase project and defining your tables, run the following command to generate TypeScript types for your database schema. Update `YOUR_PROJECT_ID` in `package.json` first.
    ```bash
    npm run supabase:types
    # or
    yarn supabase:types
    ```
    This will populate `src/types/supabase.ts`.

---

## Environment Variables

This project uses environment variables to manage sensitive information like API keys.

1.  Create a `.env` file in the root of the project by copying the `.env.example` file:
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and replace the placeholder values with your actual credentials. **DO NOT commit the `.env` file to version control.**

    **Required Variables:**

    -   `EXPO_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
    -   `EXPO_PUBLIC_SUPABASE_ANON_KEY`: The anonymous public key for your Supabase project.

    Refer to `secrets.md` for more details on the structure.

---

## Running the Application

-   **Start the development server (Expo Go):**
    ```bash
    npm start
    # or
    yarn start
    ```
    Then, scan the QR code with the Expo Go app on your iOS or Android device, or run on an emulator/simulator.

-   **Run on Android:**
    ```bash
    npm run android
    # or
    yarn android
    ```

-   **Run on iOS:**
    ```bash
    npm run ios
    # or
    yarn ios
    ```

-   **Run on Web (Metro Bundler):**
    ```bash
    npm run web
    # or
    yarn web
    ```

---

## Running Tests (TDD Workflow)

This project is set up with Jest and React Native Testing Library.

-   **Run all tests:**
    ```bash
    npm test
    # or
    yarn test
    ```

-   **Run tests in watch mode (recommended for TDD):**
    ```bash
    npm run test:watch
    # or
    yarn test:watch
    ```

Test files are co-located with their corresponding source files (e.g., `Button.test.tsx` next to `Button.tsx`).

---

## Linting and Formatting

-   **ESLint:** For code linting.
    ```bash
    npm run lint # Check for linting errors
    npm run lint:fix # Attempt to automatically fix linting errors
    ```
-   **Prettier:** For code formatting.
    ```bash
    npm run format # Format all eligible files
    ```

These tools are also configured to run with Husky pre-commit hooks if `husky` is installed and set up.

---

## Type Checking

-   **TypeScript:** For static type checking.
    ```bash
    npm run typecheck
    # or
    yarn typecheck
    ```
    This command will check for TypeScript errors without emitting JavaScript files.

---

## Directory Structure

The `src` directory is organized as follows:

-   `src/api/`: For wrapping Supabase client methods, custom API calls (e.g., `inventoryService.ts`, `invoiceService.ts`).
-   `src/assets/`: Images, fonts.
-   `src/auth/`: Dedicated for Supabase authentication components, hooks, context, and services.
-   `src/components/`: Reusable UI components.
    -   `common/`: Generic components (Button, Card, Input, ListItem).
    -   `layout/`: Layout structure components (ScreenContainer, Header).
    -   `forms/`: Form-specific components (FormInput, DatePicker).
-   `src/config/`: App-wide configuration, Supabase client initialization (`supabase.ts`).
-   `src/constants/`: App strings, theme colors, route names.
-   `src/hooks/`: Custom React hooks (e.g., `useAuth.ts`, `useSupabase.ts`).
-   `src/navigation/`: React Navigation setup (`AppNavigator.tsx`, `AuthNavigator.tsx`, `PublicNavigator.tsx`, `AppTabs.tsx`).
-   `src/screens/`: UI for different application screens.
    -   `public/`: Screens accessible without authentication (LandingScreen).
    -   `auth/`: Authentication-related screens (LoginScreen, SignupScreen, ForgotPasswordScreen).
    -   `app/`: Authenticated screens (Dashboard, Inventory, Invoices, Expenses, Reports, Settings, Profile).
-   `src/services/`: Other external service integrations, complex business logic.
-   `src/state/`: State management (`AuthContext.tsx`; notes on Zustand/Redux for other state).
-   `src/types/`: Global TypeScript types (`supabase.ts` for auto-generated types, `index.ts` for app-specific types).
-   `src/utils/`: Helper functions (e.g., `formatters.ts`, `validation.ts`).

Test files (`*.test.tsx`) are co-located with their source files.

---

## Supabase Integration

-   **Client Initialization:** The Supabase client is initialized in `src/config/supabase.ts` using environment variables.
-   **Authentication:** Managed via `src/auth/AuthContext.tsx`. It provides hooks and methods for sign-up, sign-in, sign-out, and session management.
-   **Database Operations:** Example CRUD operations can be found in `src/api/`. These services use the Supabase client to interact with your database tables.
-   **Row Level Security (RLS):** REMEMBER TO ENABLE RLS on your Supabase tables and define policies to secure your data. The scaffold assumes RLS will be used.
-   **Types:** Run `npm run supabase:types` to generate TypeScript definitions from your Supabase schema into `src/types/supabase.ts`.

---

## Figma Mockup Mapping

This section maps the generated screen components to the provided Figma mockups (`ApplicationFigmaDoc.pdf`):

-   `src/screens/public/LandingScreen.tsx`: Implements **Page 1** (Landing Page).
-   `src/screens/auth/LoginScreen.tsx`: Implements **Page 2** (Login Screen, name corrected to FeatherLiteBooks).
-   `src/screens/app/DashboardScreen.tsx`: Implements **Page 3** (Dashboard).
-   `src/screens/app/inventory/InventoryListScreen.tsx`: Implements **Page 4** (Inventory List).
-   `src/screens/app/inventory/InventoryFormScreen.tsx`: Implements **Page 5** (Add Inventory Form).
-   `src/screens/app/invoices/InvoiceListScreen.tsx`: Implements **Page 6** (Invoices List).
-   `src/screens/app/invoices/InvoiceFormScreen.tsx`: Implements **Page 7** (New Invoice Form, includes client selection).
-   `src/screens/app/expenses/ExpenseListScreen.tsx`: Implements **Page 8** (Expenses List).
-   `src/screens/app/expenses/ExpenseFormScreen.tsx`: Implements **Page 9** (New Expense Form).
-   `src/screens/app/ReportsScreen.tsx`: Implements **Page 10** (Reports Configuration/Display).
-   `src/screens/app/SettingsScreen.tsx`: Implements **Page 11** (Settings).

Other screens like `SignupScreen`, `ForgotPasswordScreen`, and detail screens are based on these designs and common app patterns.

---

## Further Development Notes

-   **State Management:** For global state beyond authentication (e.g., complex form states, shared data across tabs), consider using Zustand or Redux Toolkit. A placeholder `README.md` is in `src/state/`.
-   **Assets:** Add your project-specific assets (logo, fonts) to `src/assets/`.
-   **Error Handling:** Implement more robust error handling and user feedback mechanisms.
-   **Accessibility (a11y):** Ensure components and screens are developed with accessibility in mind.

---

This `README.md` provides a starting point. Please update it as the project evolves.

## SUPPLEMENTAL RESOURCES  
1.	How to clone a project to IntelliJ using Git?

> Ensure that you have Git installed on your system and that IntelliJ is installed using [Toolbox](https://www.jetbrains.com/toolbox-app/). Make sure that you are using version 2022.3.2. Once this has been confirmed, click the clone button and use the 'IntelliJ IDEA (HTTPS)' button. This will open IntelliJ with a prompt to clone the proejct. Save it in a safe location for the directory and press clone. IntelliJ will prompt you for your credentials. Enter in your WGU Credentials and the project will be cloned onto your local machine.  

2. How to create a branch and start Development?

- GitLab method
> Press the '+' button located near your branch name. In the dropdown list, press the 'New branch' button. This will allow you to create a name for your branch. Once the branch has been named, you can select 'Create Branch' to push the branch to your repository.

- IntelliJ method
> In IntelliJ, Go to the 'Git' button on the top toolbar. Select the new branch option and create a name for the branch. Make sure checkout branch is selected and press create. You can now add a commit message and push the new branch to the local repo.

## SUPPORT
If you need additional support, please navigate to the course page and reach out to your course instructor.

## FUTURE USE
Take this opportunity to create or add to a simple resume portfolio to highlight and showcase your work for future use in career search, experience, and education!
