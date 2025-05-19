const fetchUsers = async () => {
    try {
      const response = await fetch(config.API_URL+'/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const users = await response.json();
      if (response.ok) {
        updateUserList(users);
      } else {
        alert(users.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      alert('Erro ao carregar usuários.');
      window.location.href = 'login.html';
    }
  };
  
  const updateUserList = (users) => {
    const userList = document.getElementById('userList');
    userList.innerHTML = users.map(user => `
      <tr>
        <td class="p-2 border">${user.id}</td>
        <td class="p-2 border">${user.username}</td>
        <td class="p-2 border">${user.email}</td>
        <td class="p-2 border">${user.role}</td>
        <td class="p-2 border">${new Date(user.created_at).toLocaleString()}</td>
      </tr>
    `).join('');
  };
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  // Ouvir atualizações em tempo real via WebSocket
  socket.on('userListUpdate', (users) => {
    updateUserList(users);
  });
  
  // Carregar usuários ao iniciar
  fetchUsers();

/*
const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const users = await response.json();
      if (response.ok) {
        const userList = document.getElementById('userList');
        userList.innerHTML = users.map(user => `
          <tr>
            <td class="p-2 border">${user.id}</td>
            <td class="p-2 border">${user.username}</td>
            <td class="p-2 border">${user.email}</td>
            <td class="p-2 border">${user.role}</td>
            <td class="p-2 border">${new Date(user.created_at).toLocaleString()}</td>
          </tr>
        `).join('');
      } else {
        alert(users.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      alert('Erro ao carregar usuários.');
      window.location.href = 'login.html';
    }
  };
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  fetchUsers();
  */