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
- [Task Requirements](#task-requirements)
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

## Further Development Notes

-   **State Management:** For global state beyond authentication (e.g., complex form states, shared data across tabs), consider using Zustand or Redux Toolkit. A placeholder `README.md` is in `src/state/`.
-   **Assets:** Add your project-specific assets (logo, fonts) to `src/assets/`.
-   **Error Handling:** Implement more robust error handling and user feedback mechanisms.
-   **Accessibility (a11y):** Ensure components and screens are developed with accessibility in mind.

---

## Task Requirements

B.  Design and develop a fully functional full stack (mobile or web) software product that addresses your identified business problem or organizational need. Include each of the following attributes, as they are the minimum required elements for the application:

●  **code including inheritance, polymorphism, and encapsulation**

    *   For encapsulation, the API services (like `src/api/expenseService.ts`) neatly bundle up the database interaction logic, so the rest of the app doesn't need to worry about the nitty-gritty of Supabase calls. Similarly, the React components (like `src/screens/app/expenses/ExpenseFormScreen.tsx`) keep their own state and logic tucked away, and custom hooks like `useAuth` (`src/auth/AuthContext.tsx`) hide complex authentication details behind a simple interface.

    *   Inheritance is shown in `src/types/index.ts`. I created `BaseRecord` and `UserSpecificRecord` interfaces that other more specific types (like `Client`, `Expense`, `InventoryItem`) extend. This means they automatically get common fields like `id`, `created_at`, and `user_id`, which keeps types clean and organized.

    *   Polymorphism is demonstrated with the `getDisplayInformation` function in `src/utils/displayUtils.ts`. This single function can cleverly handle different types of records (like a `Client` or an `Expense`). It figures out what kind of record it's dealing with and then returns display information that's specific to that type.


●  **search functionality with multiple row results and displays**

    *   You can see the search functionality in action on the list screens, for instance, the `ExpenseListScreen.tsx`. There's a search bar where users can type what they're looking for. As they type, the app filters the list of expenses on the fly, checking fields like name, category, and vendor. The matching expenses are then shown in a clear, scrollable list, with each item neatly displaying its key details.

●  **a database component with the functionality to securely add, modify, and delete the data**

    *   The database is powered by Supabase (which uses PostgreSQL). I've set up API services in the `src/api/` folder (like `clientService.ts` and `expenseService.ts`) that handle all the adding, updating, and deleting of data. For example, `createExpense(data)` adds a new expense, and `deleteInventoryItem(itemId)` removes an inventory item. To keep things secure, I use Supabase's Row Level Security, so users can only touch their own data. Plus, API keys are stored safely as environment variables, and all communication with Supabase is encrypted over HTTPS.

●  **ability to generate reports with multiple columns, multiple rows, date-time stamps, and title**

    *   The app can generate PDF reports, as seen with the "Export Dashboard to PDF" feature on the `DashboardScreen.tsx`. These reports have a clear title (like "Dashboard Summary"), a timestamp showing when they were generated, and display multiple pieces of information (like Total Revenue, Total Expenses) in a structured way with several rows and columns. I use `jsPDF` for web reports and `react-native-html-to-pdf` for native app reports.

●  **validation functionality**

    *   I make sure user inputs are valid before saving them. Take the `ExpenseFormScreen.tsx` for example: before submitting a new expense, the `validateForm` function checks if all required fields are filled out (like name and category) and if the data is in the right format (e.g., amount is a positive number, date is YYYY-MM-DD). If there's an issue, an error message pops up to let the user know, and the form won't submit until the errors are fixed. This approach is used for all forms.

●  **industry-appropriate security features**

    *   Security is a priority. I use Supabase Auth for secure user sign-up, login, and session management. Access to data is controlled by Supabase's Row Level Security, meaning users can only see and edit their own information. Sensitive API keys are kept out of the main code and stored in environment variables. All communication with Supabase is encrypted using HTTPS. I also validate user input on the client-side as a first defense, and Supabase handles secure password hashing so we never store plain text passwords.


●  **design elements that make the application scalable**

    *   I've designed the app with scalability in mind. The code is broken down into logical modules (like `api`, `components`, `screens`), which makes it easier to manage and grow. I use reusable React components for the UI, which keeps things consistent and efficient. Using Supabase (a Backend as a Service) means I don't have to manage a lot of server infrastructure myself, and Supabase can scale as needed. Database interactions are handled through a service layer, so if I ever needed to change how I get data, it's easier to update. I also favor functional components and handle data fetching carefully to keep the app responsive.

●  **a user-friendly, functional GUI**

    *   I've focused on making the app easy and pleasant to use. Navigation is straightforward, with clear distinctions between public and private areas of the app, and top tabs for quick access to main sections like Dashboard and Expenses. Common UI elements like buttons and cards look and behave consistently. Screen layouts are designed to be intuitive, whether you're viewing a list, a detailed item, or filling out a form. The app also gives feedback like loading spinners and error messages. I've also considered how it looks on different screen sizes, especially for the web version, and used standard components that have good basic accessibility.
 

C.  Create each of the following forms of documentation for the software product you have developed:

●  a design document including a class diagram and design diagram

●  link to where the web app is hosted with HTML code (if applicable)

●  link to the GitLab repository of the code indicating the version included in this submission

●  user guide for setting up and running the application for maintenance purposes

●  user guide for running the application from a user perspective
 

D.  Explain how the software product was tested, including the following:

●  a test plan for a unit test, including screenshots

●  unit test scripts

●  the results of the unit tests based on the provided test plan, including screenshots

●  summaries of changes resulting from completed tests