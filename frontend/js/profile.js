const fetchUserProfile = async () => {
  try {
    const response = await fetch(config.API_URL+'/api/users/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const user = await response.json();
    if (response.ok) {
      updateUserProfile(user);
    } else {
      alert(user.message);
      window.location.href = 'login.html';
    }
  } catch (error) {
    alert('Erro ao carregar perfil.');
    window.location.href = 'login.html';
  }
};

const fetchUserPurchases = async () => {
  try {
    const response = await fetch(config.API_URL+'/api/raffles/purchases/user', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const purchases = await response.json();
    if (response.ok) {
      updatePurchaseList(purchases);
    } else {
      alert(purchases.message);
    }
  } catch (error) {
    alert('Erro ao carregar compras.');
  }
};

const fetchRaffleResults = async () => {
  try {
    const response = await fetch(config.API_URL+'/api/raffles/results', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const results = await response.json();
    if (response.ok) {
      raffleResults = results;
      updateRaffleResults(results);
    } else {
      alert(results.message);
    }
  } catch (error) {
    alert('Erro ao carregar resultados de sorteios.');
  }
};

const updateUserProfile = (user) => {
  const userProfile = document.getElementById('userProfile');
  userProfile.innerHTML = `
    <p><strong>ID:</strong> ${user.id}</p>
    <p><strong>Usuário:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Função:</strong> ${user.role}</p>
    <p><strong>Criado em:</strong> ${new Date(user.created_at).toLocaleString()}</p>
  `;
};

const updatePurchaseList = (purchases) => {
  const purchaseList = document.getElementById('purchaseList');
  purchaseList.innerHTML = purchases.length ? purchases.map(purchase => `
    <tr>
      <td class="p-2 border">${purchase.id}</td>
      <td class="p-2 border">${purchase.raffle_name}</td>
      <td class="p-2 border">${purchase.quantity}</td>
      <td class="p-2 border">${new Date(purchase.created_at).toLocaleString()}</td>
      <td class="p-2 border">
        <button onclick="showNumbers(${purchase.id})" class="btn bg-blue-600 hover:bg-blue-700">Ver Números</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra aprovada</td></tr>';
};

const updateRaffleResults = (results) => {
  const raffleResults = document.getElementById('raffleResults');
  raffleResults.innerHTML = results.length ? results.map(result => `
    <tr>
      <td class="p-2 border">${result.raffle_name}</td>
      <td class="p-2 border">${result.number}</td>
      <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
    </tr>
  `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio relevante</td></tr>';
};

const showNumbers = async (purchaseId) => {
  try {
    const response = await fetch(`${config.API_URL}/api/raffles/purchases/${purchaseId}/numbers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const numbers = await response.json();
    if (response.ok) {
      const numbersList = document.getElementById('numbersList');
      numbersList.innerHTML = numbers.length ? numbers.map(num => `<p>${num}</p>`).join('') : '<p>Nenhum número encontrado</p>';
      document.getElementById('numbersModal').classList.remove('hidden');
    } else {
      alert(numbers.message);
    }
  } catch (error) {
    alert('Erro ao carregar números.');
  }
};

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  window.location.href = 'login.html';
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('numbersModal').classList.add('hidden');
});

// Registrar usuário no WebSocket
socket.emit('registerUser', localStorage.getItem('userId'));

// Estado para armazenar resultados de sorteios
let raffleResults = [];

// Ouvir atualizações em tempo real
socket.on('userProfileUpdate', (user) => {
  updateUserProfile(user);
});

socket.on('userPurchasesUpdate', (purchases) => {
  updatePurchaseList(purchases);
});

socket.on('raffleResultUpdate', (result) => {
  raffleResults = [...raffleResults, result];
  updateRaffleResults(raffleResults);
});

// Carregar dados iniciais
fetchUserProfile();
fetchUserPurchases();
fetchRaffleResults();



/*
const fetchUserProfile = async () => {
  try {
    const response = await fetch('${config.API_URL}/api/users/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const user = await response.json();
    if (response.ok) {
      updateUserProfile(user);
    } else {
      alert(user.message);
      window.location.href = 'login.html';
    }
  } catch (error) {
    alert('Erro ao carregar perfil.');
    window.location.href = 'login.html';
  }
};

const fetchUserPurchases = async () => {
  try {
    const response = await fetch('${config.API_URL}/api/raffles/purchases/user', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const purchases = await response.json();
    if (response.ok) {
      updatePurchaseList(purchases);
    } else {
      alert(purchases.message);
    }
  } catch (error) {
    alert('Erro ao carregar compras.');
  }
};

const updateUserProfile = (user) => {
  const userProfile = document.getElementById('userProfile');
  userProfile.innerHTML = `
    <p><strong>ID:</strong> ${user.id}</p>
    <p><strong>Usuário:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Função:</strong> ${user.role}</p>
    <p><strong>Criado em:</strong> ${new Date(user.created_at).toLocaleString()}</p>
  `;
};

const updatePurchaseList = (purchases) => {
  const purchaseList = document.getElementById('purchaseList');
  purchaseList.innerHTML = purchases.length ? purchases.map(purchase => `
    <tr>
      <td class="p-2 border">${purchase.id}</td>
      <td class="p-2 border">${purchase.raffle_name}</td>
      <td class="p-2 border">${purchase.quantity}</td>
      <td class="p-2 border">${new Date(purchase.created_at).toLocaleString()}</td>
      <td class="p-2 border">
        <button onclick="showNumbers(${purchase.id})" class="btn bg-blue-600 hover:bg-blue-700">Ver Números</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra aprovada</td></tr>';
};

const updateRaffleResults = (results) => {
  const raffleResults = document.getElementById('raffleResults');
  const userId = localStorage.getItem('userId');
  const userResults = results.filter(result => {
    // Verificar se o usuário participou da rifa
    return fetch(`${config.API_URL}/api/raffles/purchases/user`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(purchases => purchases.some(p => p.raffle_id === result.raffle_id));
  });

  raffleResults.innerHTML = userResults.length ? userResults.map(result => `
    <tr>
      <td class="p-2 border">${result.raffle_name}</td>
      <td class="p-2 border">${result.number}</td>
      <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
    </tr>
  `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio relevante</td></tr>';
};

const showNumbers = async (purchaseId) => {
  try {
    const response = await fetch(`${config.API_URL}/api/raffles/purchases/${purchaseId}/numbers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const numbers = await response.json();
    if (response.ok) {
      const numbersList = document.getElementById('numbersList');
      numbersList.innerHTML = numbers.length ? numbers.map(num => `<p>${num}</p>`).join('') : '<p>Nenhum número encontrado</p>';
      document.getElementById('numbersModal').classList.remove('hidden');
    } else {
      alert(numbers.message);
    }
  } catch (error) {
    alert('Erro ao carregar números.');
  }
};

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  window.location.href = 'login.html';
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('numbersModal').classList.add('hidden');
});

// Registrar usuário no WebSocket
socket.emit('registerUser', localStorage.getItem('userId'));

// Estado para armazenar resultados de sorteios
let raffleResults = [];

// Ouvir atualizações em tempo real
socket.on('userProfileUpdate', (user) => {
  updateUserProfile(user);
});

socket.on('userPurchasesUpdate', (purchases) => {
  updatePurchaseList(purchases);
});

socket.on('raffleResultUpdate', async (result) => {
  const response = await fetch('${config.API_URL}/api/raffles/purchases/user', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  const purchases = await response.json();
  if (purchases.some(p => p.raffle_id === result.raffle_id)) {
    raffleResults.push(result);
    updateRaffleResults(raffleResults);
  }
});

// Carregar dados iniciais
fetchUserProfile();
fetchUserPurchases();
updateRaffleResults(raffleResults);
*/


/*
const fetchUserProfile = async () => {
    try {
      const response = await fetch('${config.API_URL}/api/users/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const user = await response.json();
      if (response.ok) {
        updateUserProfile(user);
      } else {
        alert(user.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      alert('Erro ao carregar perfil.');
      window.location.href = 'login.html';
    }
  };
  
  const fetchUserPurchases = async () => {
    try {
      const response = await fetch('${config.API_URL}/api/raffles/purchases/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        updatePurchaseList(purchases);
      } else {
        alert(purchases.message);
      }
    } catch (error) {
      alert('Erro ao carregar compras.');
    }
  };
  
  const updateUserProfile = (user) => {
    const userProfile = document.getElementById('userProfile');
    userProfile.innerHTML = `
      <p><strong>ID:</strong> ${user.id}</p>
      <p><strong>Usuário:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Função:</strong> ${user.role}</p>
      <p><strong>Criado em:</strong> ${new Date(user.created_at).toLocaleString()}</p>
    `;
  };
  
  const updatePurchaseList = (purchases) => {
    const purchaseList = document.getElementById('purchaseList');
    purchaseList.innerHTML = purchases.length ? purchases.map(purchase => `
      <tr>
        <td class="p-2 border">${purchase.id}</td>
        <td class="p-2 border">${purchase.raffle_name}</td>
        <td class="p-2 border">${purchase.quantity}</td>
        <td class="p-2 border">${new Date(purchase.created_at).toLocaleString()}</td>
        <td class="p-2 border">
          <button onclick="showNumbers(${purchase.id})" class="btn bg-blue-600 hover:bg-blue-700">Ver Números</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra aprovada</td></tr>';
  };
  
  const showNumbers = async (purchaseId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/purchases/${purchaseId}/numbers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const numbers = await response.json();
      if (response.ok) {
        const numbersList = document.getElementById('numbersList');
        numbersList.innerHTML = numbers.length ? numbers.map(num => `<p>${num}</p>`).join('') : '<p>Nenhum número encontrado</p>';
        document.getElementById('numbersModal').classList.remove('hidden');
      } else {
        alert(numbers.message);
      }
    } catch (error) {
      alert('Erro ao carregar números.');
    }
  };
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('numbersModal').classList.add('hidden');
  });
  
  // Registrar usuário no WebSocket
  socket.emit('registerUser', localStorage.getItem('userId'));
  
  // Ouvir atualizações em tempo real
  socket.on('userProfileUpdate', (user) => {
    updateUserProfile(user);
  });
  
  socket.on('userPurchasesUpdate', (purchases) => {
    updatePurchaseList(purchases);
  });
  
  // Carregar dados iniciais
  fetchUserProfile();
  fetchUserPurchases();
*/



/*
const fetchProfile = async () => {
    try {
      const response = await fetch('${config.API_URL}/api/users/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const user = await response.json();
      if (response.ok) {
        updateProfile(user);
        // Registrar o ID do usuário no WebSocket
        socket.emit('registerUser', user.id.toString());
      } else {
        alert(user.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      alert('Erro ao carregar perfil.');
      window.location.href = 'login.html';
    }
  };
  
  const updateProfile = (user) => {
    document.getElementById('username').textContent = user.username;
    document.getElementById('email').textContent = user.email;
    document.getElementById('role').textContent = user.role;
    document.getElementById('created_at').textContent = new Date(user.created_at).toLocaleString();
  };
  
  // Ouvir atualizações em tempo real via WebSocket
  socket.on('userProfileUpdate', (user) => {
    updateProfile(user);
  });
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  fetchProfile();
*/


/*
const fetchProfile = async () => {
    try {
      const response = await fetch('${config.API_URL}/api/users/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const user = await response.json();
      if (response.ok) {
        document.getElementById('username').textContent = user.username;
        document.getElementById('email').textContent = user.email;
        document.getElementById('role').textContent = user.role;
        document.getElementById('created_at').textContent = new Date(user.created_at).toLocaleString();
      } else {
        alert(user.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      alert('Erro ao carregar perfil.');
      window.location.href = 'login.html';
    }
  };
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  fetchProfile();
  */