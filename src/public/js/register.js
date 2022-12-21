


submitButton.onclick = async () => {
  let formData = new FormData()
  formData.append('username', usernameInput.value);
  formData.append('password', passwordInput.value);
  formData.append('avatar', uploadInput.files[0]);

  let response = await fetch('/register', {
    method: "POST",
    body: formData
  })
  let { status, message, token } = await response.json();
  if (status == 201) {
    window.localStorage.setItem('token', token);
    window.location = '/';
  } else {
    errorMessage.textContent = message;
  }
}
