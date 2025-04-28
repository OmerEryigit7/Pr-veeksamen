const epostInputField = document.getElementById('epost')
const passwordInputField = document.getElementById('password')

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
