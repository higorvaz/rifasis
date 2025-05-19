document.addEventListener('DOMContentLoaded', () => {
  const fetchActiveRaffles = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/active`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const raffles = await response.json();
      if (response.ok) {
        updateRaffleSelect(raffles);
      } else {
        alert(raffles.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      alert('Erro ao carregar rifas.');
      window.location.href = 'login.html';
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/purchases/user`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        updateUserPurchases(purchases);
      } else {
        alert(purchases.message);
      }
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      alert('Erro ao carregar compras.');
    }
  };

  const fetchRaffleResults = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/results`, {
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
      console.error('Error fetching raffle results:', error);
      alert('Erro ao carregar resultados.');
    }
  };

  const updateRaffleSelect = (raffles) => {
    const raffleSelect = document.getElementById('raffleSelect');
    if (!raffleSelect) {
      console.error('Element with id "raffleSelect" not found');
      return;
    }
    raffleSelect.innerHTML = raffles.length
      ? raffles.map(raffle => `<option value="${raffle.id}">${raffle.name}</option>`).join('')
      : '<option value="">Nenhuma rifa ativa</option>';
  };

  const updateUserPurchases = (purchases) => {
    const userPurchases = document.getElementById('userPurchases');
    if (!userPurchases) {
      console.error('Element with id "userPurchases" not found');
      return;
    }
    userPurchases.innerHTML = purchases.length
      ? purchases.map(purchase => `
          <tr>
            <td class="p-2 border">${purchase.id}</td>
            <td class="p-2 border">${purchase.raffle_name}</td>
            <td class="p-2 border">${purchase.quantity}</td>
            <td class="p-2 border">${new Date(purchase.created_at).toLocaleString()}</td>
            <td class="p-2 border">
              <button data-purchase-id="${purchase.id}" class="view-numbers-btn btn bg-blue-600 hover:bg-blue-700">Ver Números</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra aprovada</td></tr>';

    document.querySelectorAll('.view-numbers-btn').forEach(button => {
      button.addEventListener('click', () => {
        const purchaseId = button.dataset.purchaseId;
        fetchPurchaseNumbers(purchaseId);
      });
    });
  };

  const updateRaffleResults = (results) => {
    const raffleResults = document.getElementById('raffleResults');
    if (!raffleResults) {
      console.error('Element with id "raffleResults" not found');
      return;
    }
    raffleResults.innerHTML = results.length
      ? results.map(result => `
          <tr>
            <td class="p-2 border">${result.raffle_name}</td>
            <td class="p-2 border">${result.number}</td>
            <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
  };

  const fetchPurchaseNumbers = async (purchaseId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/purchases/${purchaseId}/numbers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const numbers = await response.json();
      if (response.ok) {
        const numbersModal = document.getElementById('numbersModal');
        const numbersList = document.getElementById('numbersList');
        if (!numbersModal || !numbersList) {
          console.error('Modal or numbersList element not found');
          alert('Erro ao exibir números.');
          return;
        }
        numbersList.innerHTML = numbers.map(number => `<span class="number-item">${number}</span>`).join('');
        numbersModal.classList.remove('hidden');
      } else {
        alert(numbers.message);
      }
    } catch (error) {
      console.error('Error fetching purchase numbers:', error);
      alert('Erro ao carregar números.');
    }
  };

  const buyRaffle = async () => {
    try {
      const raffleId = document.getElementById('raffleSelect').value;
      const quantity = parseInt(document.getElementById('quantity').value);

      if (!raffleId) {
        alert('Por favor, selecione uma rifa.');
        return;
      }

      const response = await fetch(`${config.API_URL}/api/raffles/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ raffle_id: raffleId, quantity })
      });

      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchUserPurchases();
      }
    } catch (error) {
      console.error('Error buying raffle:', error);
      alert('Erro ao comprar rifa.');
    }
  };

  let raffleResults = [];

  socket.on('activeRaffleListUpdate', (raffles) => {
    console.log('Received activeRaffleListUpdate:', raffles);
    updateRaffleSelect(raffles);
  });

  socket.on('userPurchasesUpdate', (purchases) => {
    console.log('Received userPurchasesUpdate:', purchases);
    updateUserPurchases(purchases);
  });

  socket.on('raffleResultUpdate', (result) => {
    console.log('Received raffleResultUpdate:', result);
    raffleResults = [...raffleResults, result];
    updateRaffleResults(raffleResults);
  });

  const buyRaffleButton = document.getElementById('buyRaffle');
  if (!buyRaffleButton) {
    console.error('Element with id "buyRaffle" not found');
  } else {
    buyRaffleButton.addEventListener('click', buyRaffle);
  }

  const closeNumbersModalButton = document.getElementById('closeNumbersModal');
  if (!closeNumbersModalButton) {
    console.error('Element with id "closeNumbersModal" not found');
  } else {
    closeNumbersModalButton.addEventListener('click', () => {
      const numbersModal = document.getElementById('numbersModal');
      if (numbersModal) {
        numbersModal.classList.add('hidden');
      }
    });
  }

  fetchActiveRaffles();
  fetchUserPurchases();
  fetchRaffleResults();
});




/*
document.addEventListener('DOMContentLoaded', () => {
  const fetchActiveRaffles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const raffles = await response.json();
      if (response.ok) {
        updateRaffleSelect(raffles);
      } else {
        alert(raffles.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      alert('Erro ao carregar rifas.');
      window.location.href = 'login.html';
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/purchases/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        updateUserPurchases(purchases);
      } else {
        alert(purchases.message);
      }
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      alert('Erro ao carregar compras.');
    }
  };

  const fetchRaffleResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/results', {
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
      console.error('Error fetching raffle results:', error);
      alert('Erro ao carregar resultados.');
    }
  };

  const updateRaffleSelect = (raffles) => {
    const raffleSelect = document.getElementById('raffleSelect');
    if (!raffleSelect) {
      console.error('Element with id "raffleSelect" not found');
      return;
    }
    raffleSelect.innerHTML = raffles.length
      ? raffles.map(raffle => `<option value="${raffle.id}">${raffle.name}</option>`).join('')
      : '<option value="">Nenhuma rifa ativa</option>';
  };

  const updateUserPurchases = (purchases) => {
    const userPurchases = document.getElementById('userPurchases');
    if (!userPurchases) {
      console.error('Element with id "userPurchases" not found');
      return;
    }
    userPurchases.innerHTML = purchases.length
      ? purchases.map(purchase => `
          <tr>
            <td class="p-2 border">${purchase.id}</td>
            <td class="p-2 border">${purchase.raffle_name}</td>
            <td class="p-2 border">${purchase.quantity}</td>
            <td class="p-2 border">${new Date(purchase.created_at).toLocaleString('pt-BR', { timezone: 'UTC' })}</td>
            <td class="p-2 border">
              <button data-purchase-id="${purchase.id}" class="view-numbers-btn btn bg-blue-600 hover:bg-blue-700">Ver Números</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra aprovada</td></tr>';

    // Adicionar listeners para botões "Ver Números"
    document.querySelectorAll('.view-numbers-btn').forEach(button => {
      button.addEventListener('click', () => {
        const purchaseId = button.dataset.purchaseId;
        fetchPurchaseNumbers(purchaseId);
      });
    });
  };

  const updateRaffleResults = (results) => {
    const raffleResults = document.getElementById('raffleResults');
    if (!raffleResults) {
      console.error('Element with id "raffleResults" not found');
      return;
    }
    raffleResults.innerHTML = results.length
      ? results.map(result => `
          <tr>
            <td class="p-2 border">${result.raffle_name}</td>
            <td class="p-2 border">${result.number}</td>
            <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
  };

  const fetchPurchaseNumbers = async (purchaseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/numbers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const numbers = await response.json();
      if (response.ok) {
        const numbersModal = document.getElementById('numbersModal');
        const numbersList = document.getElementById('numbersList');
        if (!numbersModal || !numbersList) {
          console.error('Modal or numbersList element not found');
          alert('Erro ao exibir números.');
          return;
        }
        numbersList.innerHTML = numbers.map(number => `<span class="number-item">${number}</span>`).join('');
        numbersModal.classList.remove('hidden');
      } else {
        alert(numbers.message);
      }
    } catch (error) {
      console.error('Error fetching purchase numbers:', error);
      alert('Erro ao carregar números.');
    }
  };

  const buyRaffle = async () => {
    try {
      const raffleId = document.getElementById('raffleSelect').value;
      const quantity = parseInt(document.getElementById('quantity').value);

      if (!raffleId) {
        alert('Por favor, selecione uma rifa.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/raffles/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ raffle_id: raffleId, quantity })
      });

      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchUserPurchases();
      }
    } catch (error) {
      console.error('Error buying raffle:', error);
      alert('Erro ao comprar rifa.');
    }
  };

  let raffleResults = [];

  socket.on('activeRaffleListUpdate', (raffles) => {
    console.log('Received activeRaffleListUpdate:', raffles);
    updateRaffleSelect(raffles);
  });

  socket.on('userPurchasesUpdate', (purchases) => {
    console.log('Received userPurchasesUpdate:', purchases);
    updateUserPurchases(purchases);
  });

  socket.on('raffleResultUpdate', (result) => {
    console.log('Received raffleResultUpdate:', result);
    raffleResults = [...raffleResults, result];
    updateRaffleResults(raffleResults);
  });

  const buyRaffleButton = document.getElementById('buyRaffle');
  if (!buyRaffleButton) {
    console.error('Element with id "buyRaffle" not found');
  } else {
    buyRaffleButton.addEventListener('click', buyRaffle);
  }

  const closeNumbersModalButton = document.getElementById('closeNumbersModal');
  if (!closeNumbersModalButton) {
    console.error('Element with id "closeNumbersModal" not found');
  } else {
    closeNumbersModalButton.addEventListener('click', () => {
      const numbersModal = document.getElementById('numbersModal');
      if (numbersModal) {
        numbersModal.classList.add('hidden');
      }
    });
  }

  fetchActiveRaffles();
  fetchUserPurchases();
  fetchRaffleResults();
});
*/



/*
document.addEventListener('DOMContentLoaded', () => {
  const fetchActiveRaffles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const raffles = await response.json();
      if (response.ok) {
        updateRaffleSelect(raffles);
      } else {
        alert(raffles.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      alert('Erro ao carregar rifas.');
      window.location.href = 'login.html';
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/purchases/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        updateUserPurchases(purchases);
      } else {
        alert(purchases.message);
      }
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      alert('Erro ao carregar compras.');
    }
  };

  const fetchRaffleResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/results', {
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
      console.error('Error fetching raffle results:', error);
      alert('Erro ao carregar resultados.');
    }
  };

  const updateRaffleSelect = (raffles) => {
    const raffleSelect = document.getElementById('raffleSelect');
    raffleSelect.innerHTML = raffles.length
      ? raffles.map(raffle => `<option value="${raffle.id}">${raffle.name}</option>`).join('')
      : '<option value="">Nenhuma rifa ativa</option>';
  };

  const updateUserPurchases = (purchases) => {
    const userPurchases = document.getElementById('userPurchases');
    if (!userPurchases) {
      console.error('Element with id "userPurchases" not found');
      return;
    }
    userPurchases.innerHTML = purchases.length
      ? purchases.map(purchase => `
          <tr>
            <td class="p-2 border">${purchase.id}</td>
            <td class="p-2 border">${purchase.raffle_name}</td>
            <td class="p-2 border">${purchase.quantity}</td>
            <td class="p-2 border">${new Date(purchase.created_at).toLocaleString()}</td>
            <td class="p-2 border">
              <button data-purchase-id="${purchase.id}" class="view-numbers-btn btn bg-blue-600 hover:bg-blue-700">Ver Números</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra aprovada</td></tr>';

    // Adicionar listeners para botões "Ver Números"
    document.querySelectorAll('.view-numbers-btn').forEach(button => {
      button.addEventListener('click', () => {
        const purchaseId = button.dataset.purchaseId;
        fetchPurchaseNumbers(purchaseId);
      });
    });
  };

  const updateRaffleResults = (results) => {
    const raffleResults = document.getElementById('raffleResults');
    if (!raffleResults) {
      console.error('Element with id "raffleResults" not found');
      return;
    }
    raffleResults.innerHTML = results.length
      ? results.map(result => `
          <tr>
            <td class="p-2 border">${result.raffle_name}</td>
            <td class="p-2 border">${result.number}</td>
            <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
  };

  const fetchPurchaseNumbers = async (purchaseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/numbers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const numbers = await response.json();
      if (response.ok) {
        alert(`Números da compra ${purchaseId}: ${numbers.join(', ')}`);
      } else {
        alert(numbers.message);
      }
    } catch (error) {
      console.error('Error fetching purchase numbers:', error);
      alert('Erro ao carregar números.');
    }
  };

  const buyRaffle = async () => {
    try {
      const raffleId = document.getElementById('raffleSelect').value;
      const quantity = parseInt(document.getElementById('quantity').value);

      if (!raffleId) {
        alert('Por favor, selecione uma rifa.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/raffles/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ raffle_id: raffleId, quantity })
      });

      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchUserPurchases();
      }
    } catch (error) {
      console.error('Error buying raffle:', error);
      alert('Erro ao comprar rifa.');
    }
  };

  let raffleResults = [];

  socket.on('activeRaffleListUpdate', (raffles) => {
    console.log('Received activeRaffleListUpdate:', raffles);
    updateRaffleSelect(raffles);
  });

  socket.on('userPurchasesUpdate', (purchases) => {
    console.log('Received userPurchasesUpdate:', purchases);
    updateUserPurchases(purchases);
  });

  socket.on('raffleResultUpdate', (result) => {
    console.log('Received raffleResultUpdate:', result);
    raffleResults = [...raffleResults, result];
    updateRaffleResults(raffleResults);
  });

  const buyRaffleButton = document.getElementById('buyRaffle');
  if (!buyRaffleButton) {
    console.error('Element with id "buyRaffle" not found');
  } else {
    buyRaffleButton.addEventListener('click', buyRaffle);
  }

  fetchActiveRaffles();
  fetchUserPurchases();
  fetchRaffleResults();
});
*/



/*
document.addEventListener('DOMContentLoaded', () => {
  const fetchActiveRaffles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const raffles = await response.json();
      if (response.ok) {
        updateRaffleSelect(raffles);
      } else {
        alert(raffles.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      alert('Erro ao carregar rifas.');
      window.location.href = 'login.html';
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/purchases/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        updateUserPurchases(purchases);
      } else {
        alert(purchases.message);
      }
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      alert('Erro ao carregar compras.');
    }
  };

  const fetchRaffleResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/results', {
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
      console.error('Error fetching raffle results:', error);
      alert('Erro ao carregar resultados.');
    }
  };

  const updateRaffleSelect = (raffles) => {
    const raffleSelect = document.getElementById('raffleSelect');
    raffleSelect.innerHTML = raffles.length
      ? raffles.map(raffle => `<option value="${raffle.id}">${raffle.name}</option>`).join('')
      : '<option value="">Nenhuma rifa ativa</option>';
  };

  const updateUserPurchases = (purchases) => {
    const userPurchases = document.getElementById('userPurchases');
    userPurchases.innerHTML = purchases.length
      ? purchases.map(purchase => `
          <tr>
            <td class="p-2 border">${purchase.id}</td>
            <td class="p-2 border">${purchase.raffle_name}</td>
            <td class="p-2 border">${purchase.quantity}</td>
            <td class="p-2 border">${new Date(purchase.created_at).toLocaleString()}</td>
            <td class="p-2 border">
              <button onclick="fetchPurchaseNumbers(${purchase.id})" class="btn bg-blue-600 hover:bg-blue-700">Ver Números</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra aprovada</td></tr>';
  };

  const updateRaffleResults = (results) => {
    const raffleResults = document.getElementById('raffleResults');
    raffleResults.innerHTML = results.length
      ? results.map(result => `
          <tr>
            <td class="p-2 border">${result.raffle_name}</td>
            <td class="p-2 border">${result.number}</td>
            <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
  };

  const fetchPurchaseNumbers = async (purchaseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/numbers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const numbers = await response.json();
      if (response.ok) {
        alert(`Números da compra ${purchaseId}: ${numbers.join(', ')}`);
      } else {
        alert(numbers.message);
      }
    } catch (error) {
      console.error('Error fetching purchase numbers:', error);
      alert('Erro ao carregar números.');
    }
  };

  const buyRaffle = async () => {
    try {
      const raffleId = document.getElementById('raffleSelect').value;
      const quantity = parseInt(document.getElementById('quantity').value);

      if (!raffleId) {
        alert('Por favor, selecione uma rifa.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/raffles/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ raffle_id: raffleId, quantity })
      });

      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchUserPurchases();
      }
    } catch (error) {
      console.error('Error buying raffle:', error);
      alert('Erro ao comprar rifa.');
    }
  };

  let raffleResults = [];

  socket.on('activeRaffleListUpdate', (raffles) => {
    console.log('Received activeRaffleListUpdate:', raffles);
    updateRaffleSelect(raffles);
  });

  socket.on('userPurchasesUpdate', (purchases) => {
    console.log('Received userPurchasesUpdate:', purchases);
    updateUserPurchases(purchases);
  });

  socket.on('raffleResultUpdate', (result) => {
    console.log('Received raffleResultUpdate:', result);
    raffleResults = [...raffleResults, result];
    updateRaffleResults(raffleResults);
  });

  document.getElementById('buyRaffle').addEventListener('click', buyRaffle);

  fetchActiveRaffles();
  fetchUserPurchases();
  fetchRaffleResults();
});
*/






/*
const fetchRaffles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const raffles = await response.json();
      if (response.ok) {
        updateRaffleList(raffles);
      } else {
        alert(raffles.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      alert('Erro ao carregar rifas.');
      window.location.href = 'login.html';
    }
  };
  
  const updateRaffleList = (raffles) => {
    const raffleList = document.getElementById('raffleList');
    raffleList.innerHTML = raffles.map(raffle => {
      const availableNumbers = raffle.numbers_quantity - (raffle.taken_numbers?.length || 0);
      return `
        <tr>
          <td class="p-2 border">${raffle.name}</td>
          <td class="p-2 border">R$ ${parseFloat(raffle.total_value).toFixed(2)}</td>
          <td class="p-2 border">${new Date(raffle.draw_date).toLocaleDateString()}</td>
          <td class="p-2 border">${availableNumbers}</td>
          <td class="p-2 border">R$ ${parseFloat(raffle.number_value).toFixed(2)}</td>
          <td class="p-2 border">
            <button onclick="buyNumbers(${raffle.id}, 10)" class="btn bg-green-600 hover:bg-green-700 mr-2" ${availableNumbers < 10 ? 'disabled' : ''}>10 Números</button>
            <button onclick="buyNumbers(${raffle.id}, 50)" class="btn bg-green-600 hover:bg-green-700 mr-2" ${availableNumbers < 50 ? 'disabled' : ''}>50 Números</button>
            <button onclick="buyNumbers(${raffle.id}, 100)" class="btn bg-green-600 hover:bg-green-700" ${availableNumbers < 100 ? 'disabled' : ''}>100 Números</button>
          </td>
        </tr>
      `;
    }).join('');
  };
  
  const buyNumbers = async (raffleId, quantity) => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ raffle_id: raffleId, quantity })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Solicitação de compra enviada! Aguarde aprovação do administrador.');
        fetchRaffles();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao solicitar compra.');
    }
  };
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  // Ouvir atualizações em tempo real via WebSocket
  socket.on('activeRaffleListUpdate', (raffles) => {
    updateRaffleList(raffles);
  });
  
  // Carregar rifas ao iniciar
  fetchRaffles();
  */