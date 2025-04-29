const port = 8000;
const express = require('express')
const path = require('path')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const app = express()
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
require('dotenv').config()
app.use(cookieParser())
app.use(express.json())

app.use(express.static(path.join(__dirname, 'static')))

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
  })

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,('static/index.html')))
})

app.get('/adminpanel', (req, res) => {
  res.sendFile(path.join(__dirname,('static/admin.html')))
})

app.get('/backend.js', (req, res) => {
  res.sendFile(path.join(__dirname,('frontend.js')))
})

app.get('/mine_utlaan', (req, res) => {
  res.sendFile(path.join(__dirname,('static/my_loans.html')))
})

app.get('/administrer_brukere', (req, res) => {
  res.sendFile(path.join(__dirname,('static/administer_users.html')))
})


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

app.post('/login', (req, res) => {
  const { Epost, Passord } = req.body

  const query = `select * from brukere where epost = ?`
  database.execute(query, [Epost], async (err, results) => {
    if (results.length === 0) {
      return res.status(401).json({ error: 'Ugyldig e-post eller passord'})
    }

      const bruker = results[0]
      const isMatch = await bcrypt.compare(Passord, bruker.passord)


    if (!isMatch) {
      return res.status(401).json({ error: 'Ugyldig e-post eller passord' })
    }

    const token = jwt.sign(
      { id: bruker.id, epost: bruker.epost, rolle: bruker.rolle }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    )
  
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      sameSite: 'strict',
      maxAge: 3600000 //en time
    })
  
    res.json({ message: 'Innlogging vellykket', bruker:  { rolle: bruker.rolle}})
  })
})
