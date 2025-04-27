const express = require('express')
const path = require('path')
const mysql = require('mysql2')
require('dotenv').config();
const port = 8000;
const app = express()

app.use(express.static(path.join(__dirname, 'static')));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,('static/index.html')))
});

app.get('/adminpanel', (req, res) => {
  res.sendFile(path.join(__dirname,('static/admin.html')))
});

let database = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.SQLUSER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})

database.connect((err) => {
  if (err) {
    console.log(err)
  }
  else {
    const createBrukerTable =
    `create table if not exists brukere (
      id int not null auto_increment primary key,
      fornavn varchar(100) not null,
      etternavn varchar (100) not null,
      epost varchar (100) not null,
      rolle enum('student', 'laerer', 'it', 'administrator') not null,
      passord varchar(200) default null ,
      CHECK (
        (rolle IN ('it', 'administrator') AND passord IS NOT NULL) OR
        (rolle IN ('student', 'laerer') AND passord IS NULL)
      )
    )`
    database.query(createBrukerTable)

    const createUtstyrTable =
    `create table if not exists utstyr (
      id varchar(100) not null primary key,
      type enum('datamaskin', 'mikrofon', 'hodetelefon', 'kamera', 'annet utstyr') not null,
      laant_av int default null,
      foreign key (laant_av) references brukere (id)
    )`
    database.query(createUtstyrTable)
  }
})