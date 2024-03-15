import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { pgConfig } from "./config/pgConfig.js";

const app = express();
const port = 3000;

const db = new pg.Client(pgConfig);

db.connect();
let countries = [];
db.query("SELECT country_code FROM visited_countries", (err, res) =>{
  if(err){
    console.error("Error executing query", err.stack);
  } else {
    countries = res.rows.map(row => row.country_code);
  }
  db.end();
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
   let total = countries.length;
   console.log({countries});
   res.render("index.ejs", {countries: countries, total: total})
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
