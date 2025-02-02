# [Excel Data Importer](https://excel-data-importer-five.vercel.app/)

## Overview

The **[Excel Data Importer](https://excel-data-importer-five.vercel.app/)** is a full-stack web application that allows users to upload, validate, preview, and import Excel files (`.xlsx`) into a **MongoDB** database. The application ensures data integrity by validating required fields and formatting errors before importing.

## Features

### Frontend

- **Drag-and-Drop File Upload**: Users can drag and drop files or use a fallback file input.
- **File Validation**: Accepts only `.xlsx` files with a maximum size of **2 MB**.
- **Error Handling**: Displays validation errors in a modal dialog with sheet-specific tabs.
- **Data Preview**:
  - Dropdown to select Excel sheets.
  - Paginated table to display sheet data.
  - Formats dates as `DD-MM-YYYY` and numeric values using the Indian number format.
- **Row Deletion**:
  - Users can delete individual rows after confirmation.
- **Data Import**:
  - Imports valid rows and skips invalid ones.
  - Displays a success message upon successful import.

### Backend

- **File Processing**: Uses `xlsx` library to parse uploaded files.
- **Data Validation**:
  - Ensures mandatory fields (**Name, Amount, Date, Verified**).
  - Validates date format and ensures it falls within the current month.
  - Ensures Amount is numeric and greater than zero.
- **Scalability & Extensibility**:
  - Supports different sheet structures via a configuration file.
  - Allows flexible validation rules (e.g., previous-month dates, multiple date columns).
- **Database Interaction**:
  - Uses **MongoDB Atlas** for storage.
  - Efficiently processes thousands of rows.

## Tech Stack

### Frontend

- **React.js** with **Tailwind CSS**
- `react-dropzone` for file uploads
- `@tanstack/react-table` for table display
- `@headlessui/react` for UI components
- `Axios` for API requests

### Backend

- **Node.js** with **Express.js**
- `Multer` for file handling
- `xlsx` for Excel parsing
- `Mongoose` for MongoDB interactions

### Database

- **MongoDB Atlas (Free Tier)**

## Installation & Setup

### Prerequisites

- **Node.js** installed
- **MongoDB Atlas** database set up

### Backend Setup

Clone the repository:

```bash
git clone https://github.com/sudhirKsah/excel-data-importer.git
cd excel-data-importer/backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and set up MongoDB connection:

```bash
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the server:

```bash
npm start
```

### Frontend Setup

Navigate to the frontend folder:

```sh
cd ../frontend
```

Install dependencies:

```sh
npm install
```

Create a `.env` file and specify the API endpoint:

```sh
VITE_API_ENDPOINT=http://localhost:5000
```

Start the development server:

```sh
npm run dev
```

## Usage

1. Open the web application in your browser.
2. Upload an Excel file.
3. Preview the data and correct any validation errors.
4. Import valid rows into the database.

## Future Enhancements

- Allow users to configure validation rules via UI.
- Enable downloading error reports.
- Support for additional file formats like `.csv`.
- Role-based access control for different users.

