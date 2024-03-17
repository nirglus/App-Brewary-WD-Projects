import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { pgConfig } from "./config/pgConfig.js";

const app = express();
const port = 3000;

const db = new pg.Client(pgConfig);

db.connect();
let countries = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await db.query("SELECT country_code FROM visited_countries");
  countries = result.rows.map(row => row.country_code);
  console.log({countries});
  res.render("index.ejs", {countries: countries, total: countries.length})
  db.end();
});

app.post("/add", async (req, res) =>{
  let countryName = req.body.country.trim();
  let countryCode = '';
  countryName = countryName.charAt(0).toUpperCase() + countryName.slice(1).toLowerCase();
  const findCountryQuery = `SELECT country_code FROM countries WHERE country_name = $1`;

  db.query(findCountryQuery,[countryName], (err, result) =>{
    if(err){
      console.error("Failed to retrieve country code", err.stack);
      return;
    }
    if(result.rows.length === 0){
      console.error("Country not found");
      res.status(404).send("Country not found");
      return;
    }
      countryCode = result.rows[0].country_code;
      db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode], (insertErr ,insertRes) =>{
        if(insertErr){
          console.error("Failed to insert country code", insertErr.stack);
          return
        }
        res.redirect("/");
      })
  })

})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
