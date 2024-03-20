import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { pgConfig } from "./config/pgConfig.js";

const app = express();
const port = 3000;

const db = new pg.Client(pgConfig);

db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const checkVisisted = async() =>{
    const result = await db.query("SELECT country_code FROM visited_countries");
    let countries = [];
    countries = result.rows.map(row => row.country_code);
    console.log({countries});
    return countries;
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  
  res.render("index.ejs", {countries: countries, total: countries.length})
});

app.post("/add", async (req, res) =>{
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
})


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
