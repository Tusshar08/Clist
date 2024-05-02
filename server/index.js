import express from "express";
import ExcelJS from "exceljs";
import mongoose from "mongoose";
import cors from "cors";
import contacts from "./contacts.js";

const app = express();
const PORT = 8080;
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const Contact = mongoose.model(
  "Contact",
  new mongoose.Schema({
    id: Number,
    name: String,
    contact: String,
    email: String,
  }),
);

// database
try {
  const conn = await mongoose.connect(
    `mongodb://127.0.0.1:27017/clist`,
  );
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  await Contact.deleteMany({});
  // insert contacts
  await Contact.insertMany(contacts)
    .then(() => {
      console.log("Data inserted successfully");
    })
    .catch((err) => {
      console.error("Error inserting data:", err);
    });
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

app.get("/", (_req, res) => {
  res.send("Hello world");
});

app.get("/contacts", async (_req, res) => {
  let dbcontactlist = await Contact.find({});
  console.log(dbcontactlist.length);
  res.json(dbcontactlist);
});

app.post("/download", async (req, res) => {
  let dbcontactlist = await Contact.find({});
  const contactIds = req.body;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Contacts");
  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Name", key: "name", width: 30 },
    { header: "Email", key: "email", width: 40 },
    { header: "Contact", key: "contact", width: 20 },
  ];
  contactIds.forEach((c) => {
    worksheet.addRow(dbcontactlist[c]).commit();
  });
  workbook.xlsx.writeFile("contacts.xlsx")
    .then(() => {
      console.log("Excel file created successfully.");
      res.send("excel file created successfully");
      return;
    })
    .catch((err) => {
      console.error("Error creating Excel file:", err);
      res.status(404).send("error creating file");
      return;
    });
});

app.listen(PORT, () => {
  console.log(`app is listening at port ${PORT}`);
});
