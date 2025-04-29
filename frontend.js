const loginButton = document.getElementById('login-button')
loginButton.addEventListener('click', login)

const epostInputField = document.getElementById('epost-field')
const passwordInputField = document.getElementById('password-field')
const adminOpprettBrukerButton = document.getElementById('admin-opprett-bruker-button')
adminOpprettBrukerButton.addEventListener('click', createUser)

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
  const password = passwordInputField.value
  const etternavn = etternavnInputField.value
  const rolle = rolleInputField.value
  const passord = passwordInputField.value

  try {
    const response = await fetch('/admin_create_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Fornavn: fornavn,
        Etternavn: password,
        Epost: epost,
        Rolle: rolle,
        Passord: passord,
      }),
    })
    const responseData = await response.json()
    console.log("Parsed responseData:", responseData)

    if (responseData.message === 'Bruker er opprettet!') {
    } 
    else {
      alert('Feil ved innlogging: ' + (responseData.error || 'Ukjent feil'))
    }
  } catch (error) {
    alert('Feil ved opprettelse av bruker: ' + error.message)
  }
}