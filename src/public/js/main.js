let token = window.localStorage.getItem('token')


const socket = io({ auth: { token: token } })



let lastUserId
async function renderUsers() {
  let { data } = await (await fetch('/users')).json()
  let { userId } = await renderProfile();
  for (let user of data) {
    if (userId != user.userId) {
      let li = document.createElement('li')
      li.classList.add('chats-item');
      li.innerHTML = `
      <img src="${user.avatar}" alt="profile-picture">
      <p>${user.username}</p>
      <span data-id="${user.userId}" class="${user.socketId ? "online" : ""}"></span>
    `;
      chatList.append(li)
      li.onclick = () => {
        chatMain.innerHTML = null
        renderHeader(user)
        lastUserId = user.userId
        getMessages(user.userId)
      }
    }
  }
}
renderUsers()



async function renderHeader(user) {
  username.textContent = user.username
  imageUser.src = user.avatar
}


async function getMessages(userId) {
  let { data } = await (await fetch('/messages?userId=' + userId, {
    method: "GET",
    headers: { 'Content-Type': 'application/json', token: token }
  })).json();
  return renderMessages(data)
}



{/* <li class="chats-item">
<img src="./img/avatar.jpg" alt="profile-picture">
<p>John</p>
</li> */}

async function renderMessages(messages) {
  let { userId } = await renderProfile()
  let reader = new FileReader()
  if (messages.find(message => message.file != null)) {
    reader.readAsDataURL(messages.find(message => message.file != null).file)
  }

  for (let message of messages) {
    let div = document.createElement('div')
    div.classList.add('msg-wrapper', message.from.userId == userId ? 'msg-from' : null);
    div.innerHTML = (message.file == null) ? (`
    <img src="${message.from.avatar}" alt="profile-picture">
       <div class="msg-text">
         <p class="msg-author">${message.from.username}</p>
         <p class="msg">${message.message}</p>
         <p style="width:80px; font-size:7px;" class="time">${message.created_at}</p>
    </div>
 `) : (
      `
      <img src="${message.from.avatar}" alt="profile-picture">
      <div class="msg-text">
          <p class="msg-author">${message.from.username}</p>
         <p class="msg">${message.message}</p>
          <object data="${reader.result}" class="msg object-class"></object>
          <a href="#">
              <img src="./img/download.png" width="25px">
          </a>
          <p class="time">${message.created_at}</p>
      </div>
    `
    )
    chatMain.append(div)
    chatMain.scrollTo({ top: 10000000 })
  }


}




async function renderProfile() {
  let { data } = await (await fetch('/users/' + token)).json();
  profile.innerHTML = `
    <img src="${data.avatar}" alt="profile-avatar" class="profile-avatar">
    <p class="profile-name">${data.username}</p>
  `;
  return data
}
renderProfile()


let timeId
textInput.onkeyup = async (e) => {
  if (e.keyCode == 13 && textInput.value.trim()) {

    // let formData = new FormData()

    // formData.append("to" , lastUserId)
    // formData.append("from" , await renderProfile())
    // formData.append("message" , textInput.value)
    // formData.append("files" , uploads?.files[0] || null)
    // formData.append("created_at" , "10:00")

    if (!uploads?.files[0]) {
      renderMessages([{ to: lastUserId, from: await renderProfile(), message: textInput.value, created_at: "10:00" }])
    } else {
      console.log(uploads?.files[0]);
      renderMessages([{ to: lastUserId, from: await renderProfile(), created_at: "10:00", file: uploads?.files[0] || null }])
    }

    socket.emit('new-message', { to: lastUserId, message: textInput.value, created_at: "10:00" });
    textInput.value = null
  }

  if (timeId) return

  timeId = setTimeout(() => {
    timeId = undefined
    socket.emit('stop', { to: lastUserId });
  }, 2000)

  socket.emit('typing', { to: lastUserId })
}



// smaylik 
const picker = new EmojiButton({
  showSearch: false,
  showPreview: false,
});

picker.on('emoji', emoji => {
  textInput.value += emoji;
});

trigger.addEventListener('click', () => picker.togglePicker(trigger));


menu.addEventListener("click", () => {
  if (document.querySelector(".users-side").style.display == "none") {
    document.querySelector(".users-side").style.display = "block"
  }else {
    document.querySelector(".users-side").style.display = "none"
  }
})




socket.on('send-message', (message) => {
  renderMessages([message])
})


socket.on('typing', () => {
  typing.textContent = '  is typing...'
});

socket.on('stop', () => {
  typing.textContent = null
});


socket.on('exit', () => {
  window.localStorage.removeItem("token")
  window.location.href = '/login'
})


socket.on('user-online', (userId) => {
  let span = document.querySelector(`.chats-item span[data-id="${userId}"]`);
  span.classList.add('online')
})

socket.on('user-disconnect', (userId) => {
  let span = document.querySelector(`.chats-item span[data-id="${userId}"]`);
  span.classList.remove('online');
});

