# Product Requirements Document: Udhar Management Web App

## 1. Project Overview
**Udhar Management** is a simple, intuitive web application designed for individuals and small business owners to track informal credit (Udhar) and repayments (Vasuli). It aims to replace traditional paper-based "khata" books with a digital solution that is easy to access, search, and manage.

## 2. Target Audience
- Small shopkeepers (Kirana stores, vendors).
- Friends and roommates tracking shared expenses.
- Individuals managing personal loans or debts.

## 3. Key Features

### 3.1 Core Functionality (MVP)
- **Dashboard**: A high-level view showing "Total Udhar" (Total Receivable) and "Total Vasuli" (Total Received).
- **Customer Management**:
  - Add new customers with Name and Phone Number.
  - Edit or Delete customer details.
  - Search for customers by name or phone.
- **Transaction Tracking**:
  - Record an "Udhar" (Credit/Given): Date, Amount, and Description.
  - Record a "Vasuli" (Repayment/Received): Date, Amount, and Description.
- **Customer Ledger**:
  - View a detailed history of transactions for each customer.
  - Current balance calculation for each customer.

### 3.2 Data Persistence
- **Local Storage**: All data will be stored in the browser's local storage for immediate use without a backend.
- **Export/Import**: Ability to export data as a JSON file for backup and import it back.

### 3.3 UI/UX Requirements
- **Mobile-First Design**: The interface must be fully responsive as most users will access it via mobile devices.
- **Clean Aesthetic**: Modern, minimalist UI using a card-based layout.
- **Interactive Feedback**: Visual indicators for debt (red) and credit (green).

## 4. Technical Stack
- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS (Modern CSS variables, Flexbox/Grid)
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext` if needed)
- **Icons**: Lucide React or similar lightweight library.

## 5. Future Enhancements
- **WhatsApp Integration**: Send transaction summaries or reminders via WhatsApp.
- **User Authentication**: Secure login using Firebase or Supabase.
- **PWA Support**: Installable on mobile devices for offline access.
- **PDF Generation**: Generate and download customer statements as PDF.

## 6. Success Metrics
- Fast load times (under 1 second).
- Ease of recording a transaction (fewer than 3 clicks).
- Data persistence across sessions.
