const loginButton = document.getElementById('login-button')
if (loginButton) {
  loginButton.addEventListener('click', login)
}


const utstyrRegistrationButton = document.getElementById('registrer-utstyr')
if (utstyrRegistrationButton) {
  utstyrRegistrationButton.addEventListener('click', register_equipment)
}

const findUserButton = document.getElementById('find-user')
if (findUserButton) {
  findUserButton.addEventListener('click', findUser)
}

const epostInputField = document.getElementById('epost-field')
const passwordInputField = document.getElementById('password-field')
const adminOpprettBrukerButton = document.getElementById('admin-opprett-bruker-button')
adminOpprettBrukerButton.addEventListener('click', auth)

const etternavnInputField = document.getElementById('etternavn-field')
const rolleInputField = document.getElementById('rolle-field')
const fornavnInputField = document.getElementById('fornavn-field')

async function login() {
  const epost = epostInputField.value
  const password = passwordInputField.value

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Epost: epost,
        Passord: password,
      }),
    })

    const responseData = await response.json()
    console.log("Parsed responseData:", responseData)
    if (responseData.token) {
      localStorage.setItem('token', responseData.token)
    }

    if (responseData.message === 'Innlogging vellykket') {
      alert('Innlogging vellykket!')
      if (responseData.bruker.rolle === 'administrator') {
        window.location.replace('/adminpanel')
      } else if (responseData.bruker.rolle === 'student' || responseData.bruker.rolle === 'laerer') {
        window.location.replace('/mine_utlaan')
      }
    } else {
      alert('Feil ved innlogging: ' + (responseData.error || 'Ukjent feil'))
    }
  } catch (error) {
    console.error(error)
    alert('Feil ved innlogging: ' + error.message)
  }
}

async function createUser() {
  const fornavn = fornavnInputField.value
  const epost = epostInputField.value
  const passord = passwordInputField.value
  const etternavn = etternavnInputField.value
  const rolle = rolleInputField.value

  try {
    const response = await fetch('/admin_create_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Fornavn: fornavn,
        Etternavn: etternavn,
        Epost: epost,
        Rolle: rolle,
        Passord: passord,
      }),
    })
    const responseData = await response.json()
    console.log("Parsed responseData:", responseData)

    if (responseData.message === 'Bruker er opprettet!') {
      alert(responseData.message)
    } 
    else {
      alert('Feil ved opprettelse av bruker: ' + (responseData.error || 'Ukjent feil'))
    }
  } catch (error) {
    alert('Feil ved opprettelse av bruker: ' + error.message)
  }
}

async function register_equipment() {
  console.log('asd')
  const id = document.getElementById('serienummer-field').value
  const type = document.getElementById('utstyr-type-field').value
  const model = document.getElementById('utstyr-modell-field').value

  try {
    console.log('asd')

    const response = await fetch('/register_equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Id: id,
        Type: type,
        Modell: model,
      }),
    })
    const responseData = await response.json()
    console.log("Parsed responseData:", responseData)

    if (responseData.message === 'Utstyr er registrert!') {
      alert(responseData.message)
    } 
    else {
      alert('Feil ved registrering av utstyr: ' + (responseData.error || 'Ukjent feil'))
    }

  } catch (error) {
    alert('Feil ved registrering av utstyr: ' + error.message)
  } 
}

async function findUser() {
  const brukerSearchValue = document.getElementById('bruker-search-field').value

  try {
    console.log('asd')

    const response = await fetch('/find_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brukerSearchValue: brukerSearchValue,
      }),
    })
    const responseData = await response.json()
    console.log("Parsed responseData:", responseData)

    if (responseData.message === 'Fant brukere') {
      const userList = document.getElementById('user-list')
      console.log(responseData.results.object)
      responseData.results.forEach((bruker) => {
        const brukerDiv = document.createElement('div');
        brukerDiv.textContent = `Id: ${bruker.id}, ${bruker.fornavn} ${bruker.etternavn} ${bruker.rolle} ${bruker.epost} `
        userList.appendChild(brukerDiv);
      }) 
    } 
    else {
      alert('Fant ingen brukere ' + (responseData.error || 'Ukjent feil'))
    }

  } catch (error) {
    alert('Feil: ' + error.message)
  } 
}
