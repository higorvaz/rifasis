const socket = io(config.SOCKET_URL, {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => {
  console.log('WebSocket connected:', socket.id);
  const registerUser = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('Registering userId:', userId);
      socket.emit('registerUser', userId);
    } else {
      console.warn('No userId found in localStorage, retrying in 1s');
      setTimeout(registerUser, 1000);
    }
  };
  registerUser();
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});



/*
const socket = io('http://localhost:5000');

// Registrar o usuário no WebSocket ao conectar
socket.on('connect', () => {
  const userId = localStorage.getItem('userId');
  console.log('WebSocket connected, registering userId:', userId);
  if (userId) {
    socket.emit('registerUser', userId);
  } else {
    console.error('No userId found in localStorage');
  }
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});
*/



// const socket = io('http://localhost:5000');






// socket.on('userListUpdate', (users) => {
//   const userList = document.getElementById('userList');
//   userList.innerHTML = users.map(user => `
//     <tr>
//       <td class="p-2 border">${user.id}</td>
//       <td class="p-2 border">${user.username}</td>
//       <td class="p-2 border">${user.email}</td>
//       <td class="p-2 border">${user.role}</td>
//       <td class="p-2 border">${new Date(user.created_at).toLocaleString()}</td>
//     </tr>
//   `).join('');
// });