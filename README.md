# ExpenseFlowGlobal: AI-Powered Expense Reconciliation

ExpenseFlowGlobal is a full-stack web application designed to streamline expense management through intelligent, AI-driven automation. It allows users to upload receipt images, automatically extracts key information using Google's Gemini AI, and provides powerful tools for multi-currency expense reconciliation and analysis.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [The Solution: ExpenseFlowGlobal](#the-solution-expenseflowglobal)
- [Live Demo](#live-demo)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)

## Problem Statement

Managing expenses, especially across different countries and currencies, is a tedious and error-prone process. Traditional methods involve:

- **Manual Data Entry:** Spending hours manually typing out details from dozens of receipts.
- **Complex Currency Conversion:** Struggling with historical exchange rates to accurately report expenses in a base currency.
- **Data Silos:** Lacking a centralized, searchable repository for all expense records.
- **Delayed Insights:** Difficulty in tracking spending trends and analyzing expense categories without significant manual effort.

These challenges lead to lost productivity, inaccurate financial reporting, and a frustrating user experience for both individuals and businesses.

## The Solution: ExpenseFlowGlobal

ExpenseFlowGlobal addresses these challenges directly by offering a seamless, automated, and intelligent platform. Our solution digitizes and simplifies the entire expense management workflow, from receipt capture to final analysis. By leveraging cutting-edge AI for data extraction and real-time APIs for currency conversion, we empower users to manage their global expenses with unprecedented ease and accuracy.

## Live Demo

https://expense-flow-global.vercel.app/

<img src="https://raw.githubusercontent.com/ChinmayInamdar/expense-flow-global/main/img.png" alt="ExpenseFlowGlobal Dashboard" width="800">

## Detailed System Architecture

ExpenseFlowGlobal is engineered as a full-stack, serverless web application using Next.js. The architecture is designed for scalability, type-safety, and a seamless developer experience. It decouples the frontend, backend logic, data persistence, and external AI/data services into distinct, manageable layers.

<img src="https://raw.githubusercontent.com/ChinmayInamdar/expense-flow-global/main/sys.png" alt="ExpenseFlowGlobal Dashboard" width="800">

### Architectural Breakdown

#### 1. Presentation Layer (Client)

**Framework:** Built with React and Next.js 14 (App Router). It leverages React Server Components (RSC) for initial page loads and static content, and Client Components for interactivity.

**UI Components:** A comprehensive component library from shadcn/ui provides the building blocks. These are unstyled components from Radix UI combined with styling from Tailwind CSS.

**State Management:** Client-side state is managed using standard React Hooks (useState, useEffect). Global authentication state is managed via a custom useAuth hook and React Context, with the user session persisted in localStorage.

**Data Flow:** User interactions trigger fetch calls from client components to the Next.js API Routes. For file uploads, react-dropzone is used to handle file selection, and the native FormData API is used to construct the multipart request.

#### 2. Application Layer (Next.js Backend)

**Environment:** This layer is composed of Next.js API Routes, which are deployed as individual Vercel Serverless Functions. This model ensures that the backend is scalable and cost-effective, as resources are only consumed during request execution.

**Responsibilities:**

- `/api/auth/*`: Handles user authentication (sign-in, sign-up). It interfaces with the database via Prisma to verify credentials or create new users.
- `/api/process-receipt`: The core AI endpoint. It receives FormData containing an image file and the user's API key. It converts the file to a buffer, sends it to the Google Gemini API for processing, receives the structured JSON data, and then persists a new Receipt record in the database.
- `/api/reconcile-all`: Orchestrates the currency conversion process. It receives a list of receipt IDs, fetches each receipt's data from the database, calls the Frankfurter.app API to get the correct historical exchange rate, calculates the converted total, and updates the Receipt record while creating a new ReconciliationRecord for auditing.
- `/api/users/[id]`: A standard RESTful endpoint for managing user profiles, including avatar uploads.

#### 3. Data Layer (Persistence)

**Database:** PostgreSQL is used as the primary relational database, providing robust and reliable data storage.

**ORM (Object-Relational Mapper):** Prisma serves as the bridge between the Node.js application layer and the PostgreSQL database. Its key roles are:

- **Schema Definition:** `prisma/schema.prisma` is the single source of truth for the database schema, defining the User, Receipt, and ReconciliationRecord models and their relations.
- **Type-Safety:** Prisma Client is automatically generated from the schema, providing a fully type-safe API for all database queries. This eliminates an entire class of runtime errors.
- **Migrations:** Prisma's migration toolkit (`prisma migrate`) manages database schema changes in a predictable and version-controlled manner.

#### 4. External Services Layer

**Google Gemini API:** The intelligent core of the application. The `gemini-1.5-flash` model is used for its powerful multimodal capabilities. A detailed prompt instructs the model to act as an expert OCR system and return data in a predefined, structured JSON format. The user's API key is passed directly to this service for authentication.

**Frankfurter.app API:** A free and reliable API for historical and current foreign exchange rates. It is crucial for the reconciliation feature, as it allows the system to convert expenses using the exact rate on the day of the transaction.

### Detailed Data Flow Walkthroughs

#### A. Receipt Upload & Processing Flow

1. **Client:** The user drags an image file onto the UploadSection component. `react-dropzone` captures the file.
2. **Client:** On clicking "Extract Data," a FormData object is created containing the image file and the user-provided Google API key.
3. **Client → Server:** A POST request is sent to the `/api/process-receipt` endpoint.
4. **Server:** The API route parses the FormData. The image is read into a Buffer.
5. **Server → External:** The image buffer is sent to the Google Gemini API along with a carefully crafted prompt.
6. **External → Server:** Gemini processes the image, extracts the data, and returns a structured JSON payload.
7. **Server:** The API route parses the JSON. It then uses Prisma Client to create a new Receipt record in the PostgreSQL database, storing the extracted details and the raw JSON for auditing.
8. **Server → Client:** The API route returns a success response with the newly created receipt ID.
9. **Client:** A toast notification confirms success, and the UI is updated.

#### B. Currency Reconciliation Flow

1. **Client:** The user navigates to the `/reconcile` page and clicks "Run Reconciliation."
2. **Client → Server:** A POST request is sent to `/api/reconcile-all`, containing an array of receiptIds that need conversion and the target baseCurrency.
3. **Server:** The API route iterates through each receiptId.
4. **Server (Loop):** For each ID, it uses Prisma Client to fetch the full receipt details (original amount, currency, transaction date) from the PostgreSQL database.
5. **Server → External (Loop):** It makes a GET request to the Frankfurter.app API, passing the transaction date and currencies.
6. **External → Server (Loop):** The API returns the historical exchange rate for that specific day.
7. **Server (Loop):** The backend calculates the converted_total. It then uses Prisma Client to perform two database operations:
   - UPDATE the existing Receipt record with the converted_total.
   - CREATE a new ReconciliationRecord to log the successful attempt, including the exchange rate used.
8. **Server → Client:** After processing all IDs, the server returns a summary of the results.
9. **Client:** The UI is updated to reflect the new "Converted" status of the receipts, and the history table is populated.

## Key Features

- **AI-Powered OCR:** Utilizes Google Gemini to accurately extract structured data from receipt images, including merchant name, date, line items, and total amount.
- **Multi-Currency Reconciliation:** Fetches historical exchange rates from the Frankfurter API to convert expenses from any currency to a user-defined base currency (e.g., INR).
- **Interactive Dashboard:** Provides a high-level overview of expenses with key statistics, spending trends, and recent activity.
- **Secure Authentication & Profile Management:** Complete user authentication flow with profile updates, including secure avatar uploads.
- **Batch Processing:** A user-friendly drag-and-drop interface for uploading multiple receipts at once.
- **Detailed Expense & Reconciliation History:** Comprehensive, searchable, and filterable tables for all processed expenses and conversion logs.
- **Responsive & Themed UI:** Built with shadcn/ui and Tailwind CSS, the application is fully responsive and supports both light and dark modes.

## Tech Stack

| Category       | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Framework      | Next.js (App Router)                                  |
| Language       | TypeScript                                            |
| Styling        | Tailwind CSS, shadcn/ui                               |
| Database       | PostgreSQL, Prisma (ORM)                              |
| AI / OCR       | Google Gemini                                         |
| External APIs  | Frankfurter.app (Currency Rates)                      |
| State Mgt.     | React Hooks (useState, useEffect, useContext)         |
| Deployment     | Vercel                                                |
| UI Components  | Radix UI, Lucide React, Recharts                      |
| Form Mgt.      | React Hook Form                                       |
| Notifications  | react-hot-toast (useToast hook)                       |



This project is licensed under the MIT License - see the LICENSE file for details.
Contact

For questions or support, please reach out to your-email@example.com
