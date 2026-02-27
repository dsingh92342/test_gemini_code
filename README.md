<div align="center">

![Udhar Khata Pro Banner](https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=250&section=header&text=Udhar%20Khata%20Pro&fontSize=50&fontAlignY=38&desc=Smart%20Credit%20Management&descAlignY=55&descSize=20)

# 📒 Udhar Khata Pro

A lightweight, mobile-first digital khata (ledger) for tracking informal credit and debt transactions with ease.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Features](#-key-features) • [Installation](#%EF%B8%8F-installation) • [How to Use](#-how-to-use) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 Overview

**Udhar Khata Pro** replaces traditional paper-based "khata" books with a digital, intuitive, and privacy-focused solution. Designed primarily for small shopkeepers, freelancers, and individuals, it helps you effortlessly track who owes you money ("Udhar") and whom you owe ("Vasuli"). 

All your data is stored securely in your browser's local storage—**no backend, no forced logins, complete privacy.**

## ✨ Key Features

- **📊 Smart Dashboard:** Get a real-time summary of your "Net Balance", "Total to Pay", and "Total to Get".
- **👥 Customer Management:** Easily add and search for customers by name or phone number.
- **💸 Transaction Ledger:** Record detailed transactions with amounts, descriptions, and automatic date stamping.
- **✏️ Edit & Delete:** Made a mistake? Seamlessly edit or delete past transactions.
- **📱 WhatsApp Integration:** Send a pre-formatted reminder message directly to your customer's WhatsApp with one click.
- **💾 Data Portability:** Export your entire database as a JSON file for backup, and import it back anytime.
- **🎨 Modern UI/UX:** A beautiful, responsive, mobile-first interface designed with modern CSS and Lucide icons.

## 📸 Screenshots

*(Replace these placeholders with actual screenshots of your app once deployed)*

<div align="center">
  <img src="https://via.placeholder.com/250x500.png?text=Dashboard+View" width="250" alt="Dashboard" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://via.placeholder.com/250x500.png?text=Customer+Ledger" width="250" alt="Ledger" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://via.placeholder.com/250x500.png?text=Add+Transaction" width="250" alt="Add Transaction" />
</div>

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) powered by [Vite](https://vitejs.dev/)
- **Styling:** Custom Vanilla CSS with CSS Variables & Flexbox/Grid
- **Icons:** [Lucide React](https://lucide.dev/icons/)
- **Storage:** Browser `localStorage` (Custom `useLocalStorage` hook)

## ⚙️ Installation

To run this project locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dsingh92342/test_gemini_code.git
   cd test_gemini_code
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🚀 How to Use

1. **Add a Customer:** Tap the floating `+` button at the bottom right to add a new person.
2. **Record Transaction:** Click on the customer's name, then choose either **GAVE MONEY** or **GOT MONEY**.
3. **Send Reminder:** Inside a customer's ledger, click the green **Remind** button to open WhatsApp.
4. **Backup Data:** Use the **Download** icon in the top header to save your data to your device.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/dsingh92342/test_gemini_code/issues) if you want to contribute.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  Made with ❤️ using React & Vite
</div>
