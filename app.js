import express from "express";
import cors from "cors";
import connectDB from "./db/connectdb";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import passport from "passport";
import { applyPassportStrategy } from "./middlewares/passport";
import serverRoutes from "./routes/serverRoutes";

//Setup Express App
const app = express();

// env config
dotenv.config();

// Set up CORS
app.use(cors());

//Set Midleware
app.use(fileUpload());
applyPassportStrategy(passport);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Load Routes
app.use("/", serverRoutes);
app.set('view engine', 'ejs');


// Get port from environment and store in Express.
const port = process.env.PORT || "4000";
app.listen(port, () => {
  console.log(`Server listining at http://localhost:${port}`);
});

//Database Connection
const DATABASE_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017";
connectDB(DATABASE_URL);
