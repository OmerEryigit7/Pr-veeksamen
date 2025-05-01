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
const saltRounds = 10;

app.use(express.static(path.join(__dirname, 'static')))

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
  })

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'static/index.html'))
})

app.get('/adminpanel', authenticateToken, ifAdmin(), (req, res) => {
  res.sendFile(path.join(__dirname,'static/admin.html'))
})

app.get('/frontend.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend.js'))
})

app.get('/mine_utlaan', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname,'static/my_loans.html'))
})

app.get('/administrer_brukere', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname,'static/administer_users.html'))
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
      rolle enum('student', 'lærer', 'it', 'administrator') not null,
      passord varchar(200) default null ,
      CHECK (
        (rolle IN ('it', 'administrator') AND passord IS NOT NULL) OR
        (rolle IN ('student', 'lærer') AND passord IS NULL)
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
      { expiresIn: '1h' },
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 //en time
    })
    res.json({ message: 'Innlogging vellykket', bruker:  { rolle: bruker.rolle}})

  })
})

app.post('/admin_create_user', authenticateToken, ifAdmin(), (req, res) => {
  const { Fornavn, Etternavn, Epost, Rolle, Passord } = req.body

  database.query(`select * from brukere where epost = ?`, [Epost], (err, results) => {
    if (err) {
      console.error('Feil ved sjekk av e-post:', err)
      return res.status(500).json({ error: 'Databasefeil' })
    }
    if (results.length > 0) {
      res.status(401).json({ error: 'E-post er allerede i bruk. Bruker ikke opprettet.'})
    }
    else {
      if (Rolle == 'it' || Rolle == 'administrator') {
        bcrypt.genSalt(saltRounds, function(err, salt) {
          
          bcrypt.hash(Passord, salt, function(err, hash) {
    
            const query = `insert into brukere (fornavn, etternavn, epost, rolle, passord) values (?, ?, ?, ?, ?)`
            database.execute(query, [Fornavn, Etternavn, Epost, Rolle, hash], async (err, results) => {
              res.json({ message: 'Bruker er opprettet!'})
            })
          })
        })
      }
      else if (Rolle == 'student' || Rolle == 'lærer') {
        const query = `insert into brukere (fornavn, etternavn, epost, rolle) values (?, ?, ?, ?)`
        database.execute(query, [Fornavn, Etternavn, Epost, Rolle], async (err, results) => {
          res.json({ message: 'Bruker er opprettet!'})
        })
      }
    }
  })
})

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  console.log(req.cookies.token)
  if (!token) {
    return res.redirect('/')
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err)
      return res.redirect('/')
    }
    req.user = user;
    next()
  })
}

function ifAdmin() {
  return (req, res, next) => {
    if (req.user.rolle === 'administrator') {
      return next()
    } else {
      return res.redirect('/mine_utlaan')
    }
  }
}

function isAdminOrIT() {
  return (req, res, next) => {
    if (req.user.rolle === 'it' || req.user.rolle === 'administrator') {
      return next()
    } else {
      return res.redirect('/mine_utlaan')
    }
  }
}