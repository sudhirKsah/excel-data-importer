const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const mongoose = require("mongoose");
require("dotenv").config();

const DataModel = require("./models/DataModel");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } 
});

const parseDate = (dateStr) => {
  try {
      const [day, month, year] = dateStr.split('-').map(num => parseInt(num, 10));
      return new Date(year, month - 1, day);
  } catch (error) {
      return null;
  }
};

const validateDate = (dateStr) => {
  try {
      const date = parseDate(dateStr);
      if (!date || isNaN(date.getTime())) {
          return false;
      }

      const currentDate = new Date();
      
      return (
          date.getMonth() === currentDate.getMonth() &&
          date.getFullYear() === currentDate.getFullYear()
      );
  } catch (error) {
      return false;
  }
};

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const errors = {};
      const preview = {};

      for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const data = xlsx.utils.sheet_to_json(worksheet, { 
              raw: false,
              dateNF: 'DD-MM-YYYY'
          });
          
          preview[sheetName] = [];
          errors[sheetName] = [];

          for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
              const row = data[rowIndex];
              const rowErrors = [];

              if (!row.Name) rowErrors.push("Name is required");
              if (!row.Amount) {
                  rowErrors.push("Amount is required");
              } else if (isNaN(Number(row.Amount)) || Number(row.Amount) <= 0) {
                  rowErrors.push("Amount must be a positive number");
              }

              if (!row.Date) {
                  rowErrors.push("Date is required");
              } else if (!validateDate(row.Date)) {
                  const parsedDate = parseDate(row.Date);
                  if (!parsedDate || isNaN(parsedDate.getTime())) {
                      rowErrors.push("Invalid date format. Use DD-MM-YYYY");
                  } else {
                      rowErrors.push("Date must be within the current month");
                  }
              }

              if (row.Verified !== "Yes" && row.Verified !== "No") {
                  rowErrors.push("Verified must be Yes or No");
              }

              preview[sheetName].push({
                  ...row,
                  Date: row.Date ? parseDate(row.Date) : null,
                  Amount: Number(row.Amount) || 0
              });

              if (rowErrors.length > 0) {
                  errors[sheetName].push({
                      row: rowIndex + 2,
                      error: rowErrors.join(", ")
                  });
              }
          }
      }

      const hasErrors = Object.values(errors).some(sheetErrors => sheetErrors.length > 0);
      
      res.json({
          preview,
          errors: hasErrors ? errors : {},
          message: "File processed successfully"
      });
  } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ error: "Failed to process file" });
  }
});

app.post("/import", async (req, res) => {
  try {
      const { data } = req.body;
      const savedRecords = [];
      const errors = {};

      for (const [sheetName, rows] of Object.entries(data)) {
          const validRows = rows.filter(row => !row._deleted);
          
          const documents = validRows.map(row => ({
              Name: row.Name,
              Amount: Number(row.Amount),
              Date: new Date(row.Date),
              Verified: row.Verified,
              sheetName: sheetName
          }));

          if (documents.length > 0) {
              const result = await DataModel.insertMany(documents, { ordered: false });
              savedRecords.push(...result);
          }
      }

      const allImportedData = await DataModel.find()
          .sort({ createdAt: -1 })
          .lean(); 

      const formattedData = allImportedData.map(record => ({
          ...record,
          Date: record.Date.toISOString(),
          _id: record._id.toString() 
      }));

      res.json({
          message: "Data imported successfully",
          imported: savedRecords.length,
          importedData: formattedData
      });
  } catch (error) {
      console.error("Error importing data:", error);
      res.status(500).json({ error: "Failed to import data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));