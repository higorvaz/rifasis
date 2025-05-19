document.addEventListener('DOMContentLoaded', () => {
  const fetchRaffles = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles`, {
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
      console.error('Error fetching raffles:', error);
      alert('Erro ao carregar rifas.');
      window.location.href = 'login.html';
    }
  };

  const fetchPendingPurchases = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/purchases/pending`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        updatePendingPurchases(purchases);
      } else {
        alert(purchases.message);
      }
    } catch (error) {
      console.error('Error fetching pending purchases:', error);
      alert('Erro ao carregar compras pendentes.');
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
      alert('Erro ao carregar resultados de sorteios.');
    }
  };

  const updateRaffleList = (raffles) => {
    const raffleList = document.getElementById('raffleList');
    if (!raffleList) {
      console.error('Element with id "raffleList" not found');
      return;
    }
    raffleList.innerHTML = raffles.map(raffle => `
      <tr>
        <td class="p-2 border">${raffle.id}</td>
        <td class="p-2 border">${raffle.name}</td>
        <td class="p-2 border">${raffle.total_value}</td>
        <td class="p-2 border">${new Date(raffle.draw_date).toLocaleString()}</td>
        <td class="p-2 border">${raffle.numbers_quantity}</td>
        <td class="p-2 border">${raffle.number_value}</td>
        <td class="p-2 border">${raffle.is_active ? 'Sim' : 'Não'}</td>
        <td class="p-2 border">${raffle.winner_id || 'N/A'}</td>
        <td class="p-2 border">
          <button data-id="${raffle.id}" data-name="${raffle.name}" data-total-value="${raffle.total_value}" data-draw-date="${raffle.draw_date.split('T')[0]}" data-numbers-quantity="${raffle.numbers_quantity}" data-number-value="${raffle.number_value}" data-is-active="${raffle.is_active}" class="edit-raffle-btn btn bg-yellow-600 hover:bg-yellow-700 mr-2">Editar</button>
          <button data-id="${raffle.id}" class="delete-raffle-btn btn bg-red-600 hover:bg-red-700">Apagar</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.edit-raffle-btn').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const name = button.dataset.name;
        const total_value = button.dataset.totalValue;
        const draw_date = button.dataset.drawDate;
        const numbers_quantity = button.dataset.numbersQuantity;
        const number_value = button.dataset.numberValue;
        const is_active = button.dataset.isActive === 'true';
        openEditModal(id, name, total_value, draw_date, numbers_quantity, number_value, is_active);
      });
    });

    document.querySelectorAll('.delete-raffle-btn').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        deleteRaffle(id);
      });
    });
  };

  const updatePendingPurchases = (purchases) => {
    const pendingPurchases = document.getElementById('pendingPurchases');
    if (!pendingPurchases) {
      console.error('Element with id "pendingPurchases" not found');
      return;
    }
    pendingPurchases.innerHTML = purchases.length ? purchases.map(purchase => `
      <tr>
        <td class="p-2 border">${purchase.id}</td>
        <td class="p-2 border">${purchase.username}</td>
        <td class="p-2 border">${purchase.raffle_name}</td>
        <td class="p-2 border">${purchase.quantity}</td>
        <td class="p-2 border">
          <button data-purchase-id="${purchase.id}" class="approve-btn btn bg-green-600 hover:bg-green-700">Aprovar</button>
          <button data-purchase-id="${purchase.id}" class="reject-btn btn bg-red-600 hover:bg-red-700">Rejeitar</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra pendente</td></tr>';

    document.querySelectorAll('.approve-btn').forEach(button => {
      button.addEventListener('click', () => {
        const purchaseId = button.dataset.purchaseId;
        approvePurchase(purchaseId);
      });
    });

    document.querySelectorAll('.reject-btn').forEach(button => {
      button.addEventListener('click', () => {
        const purchaseId = button.dataset.purchaseId;
        rejectPurchase(purchaseId);
      });
    });
  };

  const updateRaffleResults = (results) => {
    const raffleResults = document.getElementById('raffleResults');
    if (!raffleResults) {
      console.error('Element with id "raffleResults" not found');
      return;
    }
    raffleResults.innerHTML = results.length ? results.map(result => `
      <tr>
        <td class="p-2 border">${result.raffle_name}</td>
        <td class="p-2 border">${result.number}</td>
        <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
      </tr>
    `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
  };

  const addRaffle = async () => {
    try {
      const raffle = {
        name: document.getElementById('addName').value,
        total_value: parseFloat(document.getElementById('addTotalValue').value),
        draw_date: document.getElementById('addDrawDate').value,
        numbers_quantity: parseInt(document.getElementById('addNumbersQuantity').value),
        number_value: parseFloat(document.getElementById('addNumberValue').value),
        is_active: document.getElementById('addIsActive').checked
      };

      if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const response = await fetch(`${config.API_URL}/api/raffles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(raffle)
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        document.getElementById('addName').value = '';
        document.getElementById('addTotalValue').value = '';
        document.getElementById('addDrawDate').value = '';
        document.getElementById('addNumbersQuantity').value = '';
        document.getElementById('addNumberValue').value = '';
        document.getElementById('addIsActive').checked = true;
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error adding raffle:', error);
      alert('Erro ao adicionar rifa.');
    }
  };

  const openEditModal = (id, name, total_value, draw_date, numbers_quantity, number_value, is_active) => {
    const editModal = document.getElementById('editModal');
    if (!editModal) {
      console.error('Element with id "editModal" not found');
      return;
    }
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editTotalValue').value = total_value;
    document.getElementById('editDrawDate').value = draw_date;
    document.getElementById('editNumbersQuantity').value = numbers_quantity;
    document.getElementById('editNumberValue').value = number_value;
    document.getElementById('editIsActive').checked = is_active;
    editModal.classList.remove('hidden');
  };

  const saveEdit = async () => {
    try {
      const raffle = {
        name: document.getElementById('editName').value,
        total_value: parseFloat(document.getElementById('editTotalValue').value),
        draw_date: document.getElementById('editDrawDate').value,
        numbers_quantity: parseInt(document.getElementById('editNumbersQuantity').value),
        number_value: parseFloat(document.getElementById('editNumberValue').value),
        is_active: document.getElementById('editIsActive').checked
      };

      if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const id = document.getElementById('editId').value;
      const response = await fetch(`${config.API_URL}/api/raffles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(raffle)
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        document.getElementById('editModal').classList.add('hidden');
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error editing raffle:', error);
      alert('Erro ao editar rifa.');
    }
  };

  const deleteRaffle = async (id) => {
    if (!confirm('Tem certeza que deseja apagar esta rifa?')) return;
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error deleting raffle:', error);
      alert('Erro ao apagar rifa.');
    }
  };

  const approvePurchase = async (purchaseId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/purchases/${purchaseId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchPendingPurchases();
      }
    } catch (error) {
      console.error('Error approving purchase:', error);
      alert('Erro ao aprovar compra.');
    }
  };

  const rejectPurchase = async (purchaseId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/raffles/purchases/${purchaseId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchPendingPurchases();
      }
    } catch (error) {
      console.error('Error rejecting purchase:', error);
      alert('Erro ao rejeitar compra.');
    }
  };

  const cancelEditButton = document.getElementById('cancelEdit');
  if (!cancelEditButton) {
    console.error('Element with id "cancelEdit" not found');
  } else {
    cancelEditButton.addEventListener('click', () => {
      const editModal = document.getElementById('editModal');
      if (editModal) {
        editModal.classList.add('hidden');
      }
    });
  }

  const saveEditButton = document.getElementById('saveEdit');
  if (!saveEditButton) {
    console.error('Element with id "saveEdit" not found');
  } else {
    saveEditButton.addEventListener('click', saveEdit);
  }

  const addRaffleButton = document.getElementById('addRaffle');
  if (!addRaffleButton) {
    console.error('Element with id "addRaffle" not found');
  } else {
    addRaffleButton.addEventListener('click', addRaffle);
  }

  let raffleResults = [];

  socket.on('raffleListUpdate', (raffles) => {
    console.log('Received raffleListUpdate:', raffles);
    updateRaffleList(raffles);
  });

  socket.on('raffleResultUpdate', (result) => {
    console.log('Received raffleResultUpdate:', result);
    raffleResults = [...raffleResults, result];
    updateRaffleResults(raffleResults);
  });

  socket.on('pendingPurchasesUpdate', (purchases) => {
    console.log('Received pendingPurchasesUpdate:', purchases);
    updatePendingPurchases(purchases);
  });

  console.log('User ID from localStorage:', localStorage.getItem('userId'));
  fetchRaffles();
  fetchPendingPurchases();
  fetchRaffleResults();
});



/*
document.addEventListener('DOMContentLoaded', () => {
  const fetchRaffles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles', {
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
      console.error('Error fetching raffles:', error);
      alert('Erro ao carregar rifas.');
      window.location.href = 'login.html';
    }
  };

  const fetchPendingPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/purchases/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        updatePendingPurchases(purchases);
      } else {
        alert(purchases.message);
      }
    } catch (error) {
      console.error('Error fetching pending purchases:', error);
      alert('Erro ao carregar compras pendentes.');
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
      alert('Erro ao carregar resultados de sorteios.');
    }
  };

  const updateRaffleList = (raffles) => {
    const raffleList = document.getElementById('raffleList');
    if (!raffleList) {
      console.error('Element with id "raffleList" not found');
      return;
    }
    raffleList.innerHTML = raffles.map(raffle => `
      <tr>
        <td class="p-2 border">${raffle.id}</td>
        <td class="p-2 border">${raffle.name}</td>
        <td class="p-2 border">${raffle.total_value}</td>
        <td class="p-2 border">${new Date(raffle.draw_date).toLocaleString('pt-BR', { timezone: 'UTC' })}</td>
        <td class="p-2 border">${raffle.numbers_quantity}</td>
        <td class="p-2 border">${raffle.number_value}</td>
        <td class="p-2 border">${raffle.is_active ? 'Sim' : 'Não'}</td>
        <td class="p-2 border">${raffle.winner_id || 'N/A'}</td>
        <td class="p-2 border">
          <button data-id="${raffle.id}" data-name="${raffle.name}" data-total-value="${raffle.total_value}" data-draw-date="${raffle.draw_date.split('T')[0]}" data-numbers-quantity="${raffle.numbers_quantity}" data-number-value="${raffle.number_value}" data-is-active="${raffle.is_active}" class="edit-raffle-btn btn bg-yellow-600 hover:bg-yellow-700 mr-2">Editar</button>
          <button data-id="${raffle.id}" class="delete-raffle-btn btn bg-red-600 hover:bg-red-700">Apagar</button>
        </td>
      </tr>
    `).join('');

    // Adicionar listeners para botões de editar e apagar
    document.querySelectorAll('.edit-raffle-btn').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const name = button.dataset.name;
        const total_value = button.dataset.totalValue;
        const draw_date = button.dataset.drawDate;
        const numbers_quantity = button.dataset.numbersQuantity;
        const number_value = button.dataset.numberValue;
        const is_active = button.dataset.isActive === 'true';
        openEditModal(id, name, total_value, draw_date, numbers_quantity, number_value, is_active);
      });
    });

    document.querySelectorAll('.delete-raffle-btn').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        deleteRaffle(id);
      });
    });
  };

  const updatePendingPurchases = (purchases) => {
    const pendingPurchases = document.getElementById('pendingPurchases');
    if (!pendingPurchases) {
      console.error('Element with id "pendingPurchases" not found');
      return;
    }
    pendingPurchases.innerHTML = purchases.length ? purchases.map(purchase => `
      <tr>
        <td class="p-2 border">${purchase.id}</td>
        <td class="p-2 border">${purchase.username}</td>
        <td class="p-2 border">${purchase.raffle_name}</td>
        <td class="p-2 border">${purchase.quantity}</td>
        <td class="p-2 border">
          <button data-purchase-id="${purchase.id}" class="approve-btn btn bg-green-600 hover:bg-green-700">Aprovar</button>
          <button data-purchase-id="${purchase.id}" class="reject-btn btn bg-red-600 hover:bg-red-700">Rejeitar</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra pendente</td></tr>';

    // Adicionar listeners para botões de aprovar e rejeitar
    document.querySelectorAll('.approve-btn').forEach(button => {
      button.addEventListener('click', () => {
        const purchaseId = button.dataset.purchaseId;
        approvePurchase(purchaseId);
      });
    });

    document.querySelectorAll('.reject-btn').forEach(button => {
      button.addEventListener('click', () => {
        const purchaseId = button.dataset.purchaseId;
        rejectPurchase(purchaseId);
      });
    });
  };

  const updateRaffleResults = (results) => {
    const raffleResults = document.getElementById('raffleResults');
    if (!raffleResults) {
      console.error('Element with id "raffleResults" not found');
      return;
    }
    raffleResults.innerHTML = results.length ? results.map(result => `
      <tr>
        <td class="p-2 border">${result.raffle_name}</td>
        <td class="p-2 border">${result.number}</td>
        <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
      </tr>
    `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
  };

  const addRaffle = async () => {
    try {
      const raffle = {
        name: document.getElementById('addName').value,
        total_value: parseFloat(document.getElementById('addTotalValue').value),
        draw_date: document.getElementById('addDrawDate').value,
        numbers_quantity: parseInt(document.getElementById('addNumbersQuantity').value),
        number_value: parseFloat(document.getElementById('addNumberValue').value),
        is_active: document.getElementById('addIsActive').checked
      };

      if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/raffles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(raffle)
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        document.getElementById('addName').value = '';
        document.getElementById('addTotalValue').value = '';
        document.getElementById('addDrawDate').value = '';
        document.getElementById('addNumbersQuantity').value = '';
        document.getElementById('addNumberValue').value = '';
        document.getElementById('addIsActive').checked = true;
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error adding raffle:', error);
      alert('Erro ao adicionar rifa.');
    }
  };

  const openEditModal = (id, name, total_value, draw_date, numbers_quantity, number_value, is_active) => {
    const editModal = document.getElementById('editModal');
    if (!editModal) {
      console.error('Element with id "editModal" not found');
      return;
    }
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editTotalValue').value = total_value;
    document.getElementById('editDrawDate').value = draw_date;
    document.getElementById('editNumbersQuantity').value = numbers_quantity;
    document.getElementById('editNumberValue').value = number_value;
    document.getElementById('editIsActive').checked = is_active;
    editModal.classList.remove('hidden');
  };

  const saveEdit = async () => {
    try {
      const raffle = {
        name: document.getElementById('editName').value,
        total_value: parseFloat(document.getElementById('editTotalValue').value),
        draw_date: document.getElementById('editDrawDate').value,
        numbers_quantity: parseInt(document.getElementById('editNumbersQuantity').value),
        number_value: parseFloat(document.getElementById('editNumberValue').value),
        is_active: document.getElementById('editIsActive').checked
      };

      if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const id = document.getElementById('editId').value;
      const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(raffle)
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        document.getElementById('editModal').classList.add('hidden');
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error editing raffle:', error);
      alert('Erro ao editar rifa.');
    }
  };

  const deleteRaffle = async (id) => {
    if (!confirm('Tem certeza que deseja apagar esta rifa?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error deleting raffle:', error);
      alert('Erro ao apagar rifa.');
    }
  };

  const approvePurchase = async (purchaseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchPendingPurchases();
      }
    } catch (error) {
      console.error('Error approving purchase:', error);
      alert('Erro ao aprovar compra.');
    }
  };

  const rejectPurchase = async (purchaseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchPendingPurchases();
      }
    } catch (error) {
      console.error('Error rejecting purchase:', error);
      alert('Erro ao rejeitar compra.');
    }
  };

  const cancelEditButton = document.getElementById('cancelEdit');
  if (!cancelEditButton) {
    console.error('Element with id "cancelEdit" not found');
  } else {
    cancelEditButton.addEventListener('click', () => {
      const editModal = document.getElementById('editModal');
      if (editModal) {
        editModal.classList.add('hidden');
      }
    });
  }

  const saveEditButton = document.getElementById('saveEdit');
  if (!saveEditButton) {
    console.error('Element with id "saveEdit" not found');
  } else {
    saveEditButton.addEventListener('click', saveEdit);
  }

  const addRaffleButton = document.getElementById('addRaffle');
  if (!addRaffleButton) {
    console.error('Element with id "addRaffle" not found');
  } else {
    addRaffleButton.addEventListener('click', addRaffle);
  }

  // Estado para armazenar resultados de sorteios
  let raffleResults = [];

  // Ouvir atualizações em tempo real
  socket.on('raffleListUpdate', (raffles) => {
    console.log('Received raffleListUpdate:', raffles);
    updateRaffleList(raffles);
  });

  socket.on('raffleResultUpdate', (result) => {
    console.log('Received raffleResultUpdate:', result);
    raffleResults = [...raffleResults, result];
    updateRaffleResults(raffleResults);
  });

  socket.on('pendingPurchasesUpdate', (purchases) => {
    console.log('Received pendingPurchasesUpdate:', purchases);
    updatePendingPurchases(purchases);
  });

  // Carregar dados iniciais
  console.log('User ID from localStorage:', localStorage.getItem('userId'));
  fetchRaffles();
  fetchPendingPurchases();
  fetchRaffleResults();
});
*/



/*
document.addEventListener('DOMContentLoaded', () => {
  const fetchRaffles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles', {
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
      console.error('Error fetching raffles:', error);
      alert('Erro ao carregar rifas.');
      window.location.href = 'login.html';
    }
  };

  const fetchPendingPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/purchases/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        updatePendingPurchases(purchases);
      } else {
        alert(purchases.message);
      }
    } catch (error) {
      console.error('Error fetching pending purchases:', error);
      alert('Erro ao carregar compras pendentes.');
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
      alert('Erro ao carregar resultados de sorteios.');
    }
  };

  const updateRaffleList = (raffles) => {
    const raffleList = document.getElementById('raffleList');
    if (!raffleList) {
      console.error('Element with id "raffleList" not found');
      return;
    }
    raffleList.innerHTML = raffles.map(raffle => `
      <tr>
        <td class="p-2 border">${raffle.id}</td>
        <td class="p-2 border">${raffle.name}</td>
        <td class="p-2 border">${raffle.total_value}</td>
        <td class="p-2 border">${new Date(raffle.draw_date).toLocaleString()}</td>
        <td class="p-2 border">${raffle.numbers_quantity}</td>
        <td class="p-2 border">${raffle.number_value}</td>
        <td class="p-2 border">${raffle.is_active ? 'Sim' : 'Não'}</td>
        <td class="p-2 border">${raffle.winner_id || 'N/A'}</td>
        <td class="p-2 border">
          <button onclick="openEditModal(${raffle.id}, '${raffle.name}', ${raffle.total_value}, '${raffle.draw_date.split('T')[0]}', ${raffle.numbers_quantity}, ${raffle.number_value}, ${raffle.is_active})" class="btn bg-yellow-600 hover:bg-yellow-700 mr-2">Editar</button>
          <button onclick="deleteRaffle(${raffle.id})" class="btn bg-red-600 hover:bg-red-700">Apagar</button>
        </td>
      </tr>
    `).join('');
  };

  const updatePendingPurchases = (purchases) => {
    const pendingPurchases = document.getElementById('pendingPurchases');
    if (!pendingPurchases) {
      console.error('Element with id "pendingPurchases" not found');
      return;
    }
    pendingPurchases.innerHTML = purchases.length ? purchases.map(purchase => `
      <tr>
        <td class="p-2 border">${purchase.id}</td>
        <td class="p-2 border">${purchase.username}</td>
        <td class="p-2 border">${purchase.raffle_name}</td>
        <td class="p-2 border">${purchase.quantity}</td>
        <td class="p-2 border">
          <button onclick="approvePurchase(${purchase.id})" class="btn bg-green-600 hover:bg-green-700">Aprovar</button>
          <button onclick="rejectPurchase(${purchase.id})" class="btn bg-red-600 hover:bg-red-700">Rejeitar</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra pendente</td></tr>';
  };

  const updateRaffleResults = (results) => {
    const raffleResults = document.getElementById('raffleResults');
    if (!raffleResults) {
      console.error('Element with id "raffleResults" not found');
      return;
    }
    raffleResults.innerHTML = results.length ? results.map(result => `
      <tr>
        <td class="p-2 border">${result.raffle_name}</td>
        <td class="p-2 border">${result.number}</td>
        <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
      </tr>
    `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
  };

  const addRaffle = async () => {
    try {
      const raffle = {
        name: document.getElementById('addName').value,
        total_value: parseFloat(document.getElementById('addTotalValue').value),
        draw_date: document.getElementById('addDrawDate').value,
        numbers_quantity: parseInt(document.getElementById('addNumbersQuantity').value),
        number_value: parseFloat(document.getElementById('addNumberValue').value),
        is_active: document.getElementById('addIsActive').checked
      };

      if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/raffles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(raffle)
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        document.getElementById('addName').value = '';
        document.getElementById('addTotalValue').value = '';
        document.getElementById('addDrawDate').value = '';
        document.getElementById('addNumbersQuantity').value = '';
        document.getElementById('addNumberValue').value = '';
        document.getElementById('addIsActive').checked = true;
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error adding raffle:', error);
      alert('Erro ao adicionar rifa.');
    }
  };

  const openEditModal = (id, name, total_value, draw_date, numbers_quantity, number_value, is_active) => {
    const editModal = document.getElementById('editModal');
    if (!editModal) {
      console.error('Element with id "editModal" not found');
      return;
    }
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editTotalValue').value = total_value;
    document.getElementById('editDrawDate').value = draw_date;
    document.getElementById('editNumbersQuantity').value = numbers_quantity;
    document.getElementById('editNumberValue').value = number_value;
    document.getElementById('editIsActive').checked = is_active;
    editModal.classList.remove('hidden');
  };

  const saveEdit = async () => {
    try {
      const raffle = {
        name: document.getElementById('editName').value,
        total_value: parseFloat(document.getElementById('editTotalValue').value),
        draw_date: document.getElementById('editDrawDate').value,
        numbers_quantity: parseInt(document.getElementById('editNumbersQuantity').value),
        number_value: parseFloat(document.getElementById('editNumberValue').value),
        is_active: document.getElementById('editIsActive').checked
      };

      if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const id = document.getElementById('editId').value;
      const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(raffle)
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        document.getElementById('editModal').classList.add('hidden');
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error editing raffle:', error);
      alert('Erro ao editar rifa.');
    }
  };

  const deleteRaffle = async (id) => {
    if (!confirm('Tem certeza que deseja apagar esta rifa?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error deleting raffle:', error);
      alert('Erro ao apagar rifa.');
    }
  };

  const approvePurchase = async (purchaseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchPendingPurchases();
      }
    } catch (error) {
      console.error('Error approving purchase:', error);
      alert('Erro ao aprovar compra.');
    }
  };

  const rejectPurchase = async (purchaseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        fetchPendingPurchases();
      }
    } catch (error) {
      console.error('Error rejecting purchase:', error);
      alert('Erro ao rejeitar compra.');
    }
  };

  const cancelEditButton = document.getElementById('cancelEdit');
  if (!cancelEditButton) {
    console.error('Element with id "cancelEdit" not found');
  } else {
    cancelEditButton.addEventListener('click', () => {
      const editModal = document.getElementById('editModal');
      if (editModal) {
        editModal.classList.add('hidden');
      }
    });
  }

  const saveEditButton = document.getElementById('saveEdit');
  if (!saveEditButton) {
    console.error('Element with id "saveEdit" not found');
  } else {
    saveEditButton.addEventListener('click', saveEdit);
  }

  const addRaffleButton = document.getElementById('addRaffle');
  if (!addRaffleButton) {
    console.error('Element with id "addRaffle" not found');
  } else {
    addRaffleButton.addEventListener('click', addRaffle);
  }

  // Estado para armazenar resultados de sorteios
  let raffleResults = [];

  // Ouvir atualizações em tempo real
  socket.on('raffleListUpdate', (raffles) => {
    console.log('Received raffleListUpdate:', raffles);
    updateRaffleList(raffles);
  });

  socket.on('raffleResultUpdate', (result) => {
    console.log('Received raffleResultUpdate:', result);
    raffleResults = [...raffleResults, result];
    updateRaffleResults(raffleResults);
  });

  socket.on('pendingPurchasesUpdate', (purchases) => {
    console.log('Received pendingPurchasesUpdate:', purchases);
    updatePendingPurchases(purchases);
  });

  // Carregar dados iniciais
  console.log('User ID from localStorage:', localStorage.getItem('userId'));
  fetchRaffles();
  fetchPendingPurchases();
  fetchRaffleResults();
});
*/



/*
const fetchRaffles = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles', {
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

const fetchPendingPurchases = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles/purchases/pending', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const purchases = await response.json();
    if (response.ok) {
      updatePendingPurchases(purchases);
    } else {
      alert(purchases.message);
    }
  } catch (error) {
    alert('Erro ao carregar compras pendentes.');
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
    alert('Erro ao carregar resultados de sorteios.');
  }
};

const updateRaffleList = (raffles) => {
  const raffleList = document.getElementById('raffleList');
  raffleList.innerHTML = raffles.map(raffle => `
    <tr>
      <td class="p-2 border">${raffle.id}</td>
      <td class="p-2 border">${raffle.name}</td>
      <td class="p-2 border">${raffle.total_value}</td>
      <td class="p-2 border">${new Date(raffle.draw_date).toLocaleString()}</td>
      <td class="p-2 border">${raffle.numbers_quantity}</td>
      <td class="p-2 border">${raffle.number_value}</td>
      <td class="p-2 border">${raffle.is_active ? 'Sim' : 'Não'}</td>
      <td class="p-2 border">${raffle.winner_id || 'N/A'}</td>
      <td class="p-2 border">
        <button onclick="openEditModal(${raffle.id}, '${raffle.name}', ${raffle.total_value}, '${raffle.draw_date.split('T')[0]}', ${raffle.numbers_quantity}, ${raffle.number_value}, ${raffle.is_active})" class="btn bg-yellow-600 hover:bg-yellow-700 mr-2">Editar</button>
        <button onclick="deleteRaffle(${raffle.id})" class="btn bg-red-600 hover:bg-red-700">Apagar</button>
      </td>
    </tr>
  `).join('');
};

const updatePendingPurchases = (purchases) => {
  const pendingPurchases = document.getElementById('pendingPurchases');
  pendingPurchases.innerHTML = purchases.length ? purchases.map(purchase => `
    <tr>
      <td class="p-2 border">${purchase.id}</td>
      <td class="p-2 border">${purchase.username}</td>
      <td class="p-2 border">${purchase.raffle_name}</td>
      <td class="p-2 border">${purchase.quantity}</td>
      <td class="p-2 border">
        <button onclick="approvePurchase(${purchase.id})" class="btn bg-green-600 hover:bg-green-700">Aprovar</button>
        <button onclick="rejectPurchase(${purchase.id})" class="btn bg-red-600 hover:bg-red-700">Rejeitar</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra pendente</td></tr>';
};

const updateRaffleResults = (results) => {
  const raffleResults = document.getElementById('raffleResults');
  raffleResults.innerHTML = results.length ? results.map(result => `
    <tr>
      <td class="p-2 border">${result.raffle_name}</td>
      <td class="p-2 border">${result.number}</td>
      <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
    </tr>
  `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
};

const addRaffle = async () => {
  try {
    const raffle = {
      name: document.getElementById('addName').value,
      total_value: parseFloat(document.getElementById('addTotalValue').value),
      draw_date: document.getElementById('addDrawDate').value,
      numbers_quantity: parseInt(document.getElementById('addNumbersQuantity').value),
      number_value: parseFloat(document.getElementById('addNumberValue').value),
      is_active: document.getElementById('addIsActive').checked
    };

    if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const response = await fetch('http://localhost:5000/api/raffles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(raffle)
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      document.getElementById('addName').value = '';
      document.getElementById('addTotalValue').value = '';
      document.getElementById('addDrawDate').value = '';
      document.getElementById('addNumbersQuantity').value = '';
      document.getElementById('addNumberValue').value = '';
      document.getElementById('addIsActive').checked = true;
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao adicionar rifa.');
  }
};

const openEditModal = (id, name, total_value, draw_date, numbers_quantity, number_value, is_active) => {
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editTotalValue').value = total_value;
  document.getElementById('editDrawDate').value = draw_date;
  document.getElementById('editNumbersQuantity').value = numbers_quantity;
  document.getElementById('editNumberValue').value = number_value;
  document.getElementById('editIsActive').checked = is_active;
  document.getElementById('editModal').classList.remove('hidden');
};

const saveEdit = async () => {
  try {
    const raffle = {
      name: document.getElementById('editName').value,
      total_value: parseFloat(document.getElementById('editTotalValue').value),
      draw_date: document.getElementById('editDrawDate').value,
      numbers_quantity: parseInt(document.getElementById('editNumbersQuantity').value),
      number_value: parseFloat(document.getElementById('editNumberValue').value),
      is_active: document.getElementById('editIsActive').checked
    };

    if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const id = document.getElementById('editId').value;
    const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(raffle)
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      document.getElementById('editModal').classList.add('hidden');
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao editar rifa.');
  }
};

const deleteRaffle = async (id) => {
  if (!confirm('Tem certeza que deseja apagar esta rifa?')) return;
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao apagar rifa.');
  }
};

const approvePurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao aprovar compra.');
  }
};

const rejectPurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao rejeitar compra.');
  }
};

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  window.location.href = 'login.html';
});

// Estado para armazenar resultados de sorteios
let raffleResults = [];

// Ouvir atualizações em tempo real
socket.on('raffleListUpdate', (raffles) => {
  console.log('Received raffleListUpdate:', raffles);
  updateRaffleList(raffles);
});

socket.on('raffleResultUpdate', (result) => {
  console.log('Received raffleResultUpdate:', result);
  raffleResults = [...raffleResults, result];
  updateRaffleResults(raffleResults);
});

socket.on('pendingPurchasesUpdate', (purchases) => {
  console.log('Received pendingPurchasesUpdate:', purchases);
  updatePendingPurchases(purchases);
});

// Carregar dados iniciais
console.log('User ID from localStorage:', localStorage.getItem('userId'));
fetchRaffles();
fetchPendingPurchases();
fetchRaffleResults();
*/




/*
const fetchRaffles = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles', {
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

const fetchPendingPurchases = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles/purchases/pending', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const purchases = await response.json();
    if (response.ok) {
      updatePendingPurchases(purchases);
    } else {
      alert(purchases.message);
    }
  } catch (error) {
    alert('Erro ao carregar compras pendentes.');
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
    alert('Erro ao carregar resultados de sorteios.');
  }
};

const updateRaffleList = (raffles) => {
  const raffleList = document.getElementById('raffleList');
  raffleList.innerHTML = raffles.map(raffle => `
    <tr>
      <td class="p-2 border">${raffle.id}</td>
      <td class="p-2 border">${raffle.name}</td>
      <td class="p-2 border">${raffle.total_value}</td>
      <td class="p-2 border">${new Date(raffle.draw_date).toLocaleString()}</td>
      <td class="p-2 border">${raffle.numbers_quantity}</td>
      <td class="p-2 border">${raffle.number_value}</td>
      <td class="p-2 border">${raffle.is_active ? 'Sim' : 'Não'}</td>
      <td class="p-2 border">${raffle.winner_id || 'N/A'}</td>
      <td class="p-2 border">
        <button onclick="openEditModal(${raffle.id}, '${raffle.name}', ${raffle.total_value}, '${raffle.draw_date.split('T')[0]}', ${raffle.numbers_quantity}, ${raffle.number_value}, ${raffle.is_active})" class="btn bg-yellow-600 hover:bg-yellow-700 mr-2">Editar</button>
        <button onclick="deleteRaffle(${raffle.id})" class="btn bg-red-600 hover:bg-red-700">Apagar</button>
      </td>
    </tr>
  `).join('');
};

const updatePendingPurchases = (purchases) => {
  const pendingPurchases = document.getElementById('pendingPurchases');
  pendingPurchases.innerHTML = purchases.length ? purchases.map(purchase => `
    <tr>
      <td class="p-2 border">${purchase.id}</td>
      <td class="p-2 border">${purchase.username}</td>
      <td class="p-2 border">${purchase.raffle_name}</td>
      <td class="p-2 border">${purchase.quantity}</td>
      <td class="p-2 border">
        <button onclick="approvePurchase(${purchase.id})" class="btn bg-green-600 hover:bg-green-700">Aprovar</button>
        <button onclick="rejectPurchase(${purchase.id})" class="btn bg-red-600 hover:bg-red-700">Rejeitar</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra pendente</td></tr>';
};

const updateRaffleResults = (results) => {
  const raffleResults = document.getElementById('raffleResults');
  raffleResults.innerHTML = results.length ? results.map(result => `
    <tr>
      <td class="p-2 border">${result.raffle_name}</td>
      <td class="p-2 border">${result.number}</td>
      <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
    </tr>
  `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
};

const addRaffle = async () => {
  try {
    const raffle = {
      name: document.getElementById('addName').value,
      total_value: parseFloat(document.getElementById('addTotalValue').value),
      draw_date: document.getElementById('addDrawDate').value,
      numbers_quantity: parseInt(document.getElementById('addNumbersQuantity').value),
      number_value: parseFloat(document.getElementById('addNumberValue').value),
      is_active: document.getElementById('addIsActive').checked
    };

    if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const response = await fetch('http://localhost:5000/api/raffles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(raffle)
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      document.getElementById('addName').value = '';
      document.getElementById('addTotalValue').value = '';
      document.getElementById('addDrawDate').value = '';
      document.getElementById('addNumbersQuantity').value = '';
      document.getElementById('addNumberValue').value = '';
      document.getElementById('addIsActive').checked = true;
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao adicionar rifa.');
  }
};

const openEditModal = (id, name, total_value, draw_date, numbers_quantity, number_value, is_active) => {
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editTotalValue').value = total_value;
  document.getElementById('editDrawDate').value = draw_date;
  document.getElementById('editNumbersQuantity').value = numbers_quantity;
  document.getElementById('editNumberValue').value = number_value;
  document.getElementById('editIsActive').checked = is_active;
  document.getElementById('editModal').classList.remove('hidden');
};

const saveEdit = async () => {
  try {
    const raffle = {
      name: document.getElementById('editName').value,
      total_value: parseFloat(document.getElementById('editTotalValue').value),
      draw_date: document.getElementById('editDrawDate').value,
      numbers_quantity: parseInt(document.getElementById('editNumbersQuantity').value),
      number_value: parseFloat(document.getElementById('editNumberValue').value),
      is_active: document.getElementById('editIsActive').checked
    };

    if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const id = document.getElementById('editId').value;
    const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(raffle)
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      document.getElementById('editModal').classList.add('hidden');
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao editar rifa.');
  }
};

const deleteRaffle = async (id) => {
  if (!confirm('Tem certeza que deseja apagar esta rifa?')) return;
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao apagar rifa.');
  }
};

const approvePurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao aprovar compra.');
  }
};

const rejectPurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao rejeitar compra.');
  }
};

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

document.getElementById('addRaffle').addEventListener('click', addRaffle);
document.getElementById('saveEdit').addEventListener('click', saveEdit);
document.getElementById('cancelEdit').addEventListener('click', () => {
  document.getElementById('editModal').classList.add('hidden');
});

// Estado para armazenar resultados de sorteios
let raffleResults = [];

// Ouvir atualizações em tempo real
socket.on('raffleListUpdate', (raffles) => {
  updateRaffleList(raffles);
});

socket.on('raffleResultUpdate', (result) => {
  raffleResults = [...raffleResults, result];
  updateRaffleResults(raffleResults);
});

socket.on('pendingPurchasesUpdate', (purchases) => {
  updatePendingPurchases(purchases);
});

// Carregar dados iniciais
fetchRaffles();
fetchPendingPurchases();
fetchRaffleResults();
*/


/*
const fetchRaffles = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles', {
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

const fetchPendingPurchases = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles/purchases/pending', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const purchases = await response.json();
    if (response.ok) {
      updatePendingPurchases(purchases);
    } else {
      alert(purchases.message);
    }
  } catch (error) {
    alert('Erro ao carregar compras pendentes.');
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
    alert('Erro ao carregar resultados de sorteios.');
  }
};

const updateRaffleList = (raffles) => {
  const raffleList = document.getElementById('raffleList');
  raffleList.innerHTML = raffles.map(raffle => `
    <tr>
      <td class="p-2 border">${raffle.id}</td>
      <td class="p-2 border">${raffle.name}</td>
      <td class="p-2 border">${raffle.total_value}</td>
      <td class="p-2 border">${new Date(raffle.draw_date).toLocaleString()}</td>
      <td class="p-2 border">${raffle.numbers_quantity}</td>
      <td class="p-2 border">${raffle.number_value}</td>
      <td class="p-2 border">${raffle.is_active ? 'Sim' : 'Não'}</td>
      <td class="p-2 border">${raffle.winner_id || 'N/A'}</td>
      <td class="p-2 border">
        <button onclick="openEditModal(${raffle.id}, '${raffle.name}', ${raffle.total_value}, '${raffle.draw_date.split('T')[0]}', ${raffle.numbers_quantity}, ${raffle.number_value}, ${raffle.is_active})" class="btn bg-yellow-600 hover:bg-yellow-700 mr-2">Editar</button>
        <button onclick="deleteRaffle(${raffle.id})" class="btn bg-red-600 hover:bg-red-700">Apagar</button>
      </td>
    </tr>
  `).join('');
};

const updatePendingPurchases = (purchases) => {
  const pendingPurchases = document.getElementById('pendingPurchases');
  pendingPurchases.innerHTML = purchases.length ? purchases.map(purchase => `
    <tr>
      <td class="p-2 border">${purchase.id}</td>
      <td class="p-2 border">${purchase.username}</td>
      <td class="p-2 border">${purchase.raffle_name}</td>
      <td class="p-2 border">${purchase.quantity}</td>
      <td class="p-2 border">
        <button onclick="approvePurchase(${purchase.id})" class="btn bg-green-600 hover:bg-green-700">Aprovar</button>
        <button onclick="rejectPurchase(${purchase.id})" class="btn bg-red-600 hover:bg-red-700">Rejeitar</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra pendente</td></tr>';
};

const updateRaffleResults = (results) => {
  const raffleResults = document.getElementById('raffleResults');
  raffleResults.innerHTML = results.length ? results.map(result => `
    <tr>
      <td class="p-2 border">${result.raffle_name}</td>
      <td class="p-2 border">${result.number}</td>
      <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
    </tr>
  `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
};

const addRaffle = async () => {
  try {
    const raffle = {
      name: document.getElementById('addName').value,
      total_value: parseFloat(document.getElementById('addTotalValue').value),
      draw_date: document.getElementById('addDrawDate').value,
      numbers_quantity: parseInt(document.getElementById('addNumbersQuantity').value),
      number_value: parseFloat(document.getElementById('addNumberValue').value),
      is_active: document.getElementById('addIsActive').checked
    };

    if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const response = await fetch('http://localhost:5000/api/raffles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(raffle)
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      document.getElementById('addName').value = '';
      document.getElementById('addTotalValue').value = '';
      document.getElementById('addDrawDate').value = '';
      document.getElementById('addNumbersQuantity').value = '';
      document.getElementById('addNumberValue').value = '';
      document.getElementById('addIsActive').checked = true;
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao adicionar rifa.');
  }
};

const openEditModal = (id, name, total_value, draw_date, numbers_quantity, number_value, is_active) => {
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editTotalValue').value = total_value;
  document.getElementById('editDrawDate').value = draw_date;
  document.getElementById('editNumbersQuantity').value = numbers_quantity;
  document.getElementById('editNumberValue').value = number_value;
  document.getElementById('editIsActive').checked = is_active;
  document.getElementById('editModal').classList.remove('hidden');
};

const saveEdit = async () => {
  try {
    const raffle = {
      name: document.getElementById('editName').value,
      total_value: parseFloat(document.getElementById('editTotalValue').value),
      draw_date: document.getElementById('editDrawDate').value,
      numbers_quantity: parseInt(document.getElementById('editNumbersQuantity').value),
     odore_value: parseFloat(document.getElementById('editNumberValue').value),
      is_active: document.getElementById('editIsActive').checked
    };

    if (!raffle.name || !raffle.total_value || !raffle.draw_date || !raffle.numbers_quantity || !raffle.number_value) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const id = document.getElementById('editId').value;
    const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(raffle)
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      document.getElementById('editModal').classList.add('hidden');
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao editar rifa.');
  }
};

const deleteRaffle = async (id) => {
  if (!confirm('Tem certeza que deseja apagar esta rifa?')) return;
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchRaffles();
    }
  } catch (error) {
    alert('Erro ao apagar rifa.');
  }
};

const approvePurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao aprovar compra.');
  }
};

const rejectPurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao rejeitar compra.');
  }
};

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

document.getElementById('addRaffle').addEventListener('click', addRaffle);
document.getElementById('saveEdit').addEventListener('click', saveEdit);
document.getElementById('cancelEdit').addEventListener('click', () => {
  document.getElementById('editModal').classList.add('hidden');
});

// Estado para armazenar resultados de sorteios
let raffleResults = [];

// Ouvir atualizações em tempo real
socket.on('raffleListUpdate', (raffles) => {
  updateRaffleList(raffles);
});

socket.on('raffleResultUpdate', (result) => {
  raffleResults = [...raffleResults, result];
  updateRaffleResults(raffleResults);
});

// Carregar dados iniciais
fetchRaffles();
fetchPendingPurchases();
fetchRaffleResults();
*/


/*
const fetchRaffles = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles', {
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

const fetchPendingPurchases = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles/purchases/pending', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const purchases = await response.json();
    if (response.ok) {
      updatePendingPurchases(purchases);
    } else {
      alert(purchases.message);
    }
  } catch (error) {
    alert('Erro ao carregar compras pendentes.');
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
    alert('Erro ao carregar resultados de sorteios.');
  }
};

const updateRaffleList = (raffles) => {
  const raffleList = document.getElementById('raffleList');
  raffleList.innerHTML = raffles.map(raffle => `
    <tr>
      <td class="p-2 border">${raffle.id}</td>
      <td class="p-2 border">${raffle.name}</td>
      <td class="p-2 border">${raffle.total_value}</td>
      <td class="p-2 border">${new Date(raffle.draw_date).toLocaleString()}</td>
      <td class="p-2 border">${raffle.numbers_quantity}</td>
      <td class="p-2 border">${raffle.number_value}</td>
      <td class="p-2 border">${raffle.is_active ? 'Sim' : 'Não'}</td>
      <td class="p-2 border">${raffle.winner_id || 'N/A'}</td>
    </tr>
  `).join('');
};

const updatePendingPurchases = (purchases) => {
  const pendingPurchases = document.getElementById('pendingPurchases');
  pendingPurchases.innerHTML = purchases.length ? purchases.map(purchase => `
    <tr>
      <td class="p-2 border">${purchase.id}</td>
      <td class="p-2 border">${purchase.username}</td>
      <td class="p-2 border">${purchase.raffle_name}</td>
      <td class="p-2 border">${purchase.quantity}</td>
      <td class="p-2 border">
        <button onclick="approvePurchase(${purchase.id})" class="btn bg-green-600 hover:bg-green-700">Aprovar</button>
        <button onclick="rejectPurchase(${purchase.id})" class="btn bg-red-600 hover:bg-red-700">Rejeitar</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra pendente</td></tr>';
};

const updateRaffleResults = (results) => {
  const raffleResults = document.getElementById('raffleResults');
  raffleResults.innerHTML = results.length ? results.map(result => `
    <tr>
      <td class="p-2 border">${result.raffle_name}</td>
      <td class="p-2 border">${result.number}</td>
      <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
    </tr>
  `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
};

const approvePurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao aprovar compra.');
  }
};

const rejectPurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao rejeitar compra.');
  }
};

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Estado para armazenar resultados de sorteios
let raffleResults = [];

// Ouvir atualizações em tempo real
socket.on('raffleListUpdate', (raffles) => {
  updateRaffleList(raffles);
});

socket.on('raffleResultUpdate', (result) => {
  raffleResults = [...raffleResults, result];
  updateRaffleResults(raffleResults);
});

// Carregar dados iniciais
fetchRaffles();
fetchPendingPurchases();
fetchRaffleResults();
*/


/*
const fetchRaffles = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles', {
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

const fetchPendingPurchases = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/raffles/purchases/pending', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const purchases = await response.json();
    if (response.ok) {
      updatePendingPurchases(purchases);
    } else {
      alert(purchases.message);
    }
  } catch (error) {
    alert('Erro ao carregar compras pendentes.');
  }
};

const updateRaffleList = (raffles) => {
  const raffleList = document.getElementById('raffleList');
  raffleList.innerHTML = raffles.map(raffle => `
    <tr>
      <td class="p-2 border">${raffle.id}</td>
      <td class="p-2 border">${raffle.name}</td>
      <td class="p-2 border">${raffle.total_value}</td>
      <td class="p-2 border">${new Date(raffle.draw_date).toLocaleString()}</td>
      <td class="p-2 border">${raffle.numbers_quantity}</td>
      <td class="p-2 border">${raffle.number_value}</td>
      <td class="p-2 border">${raffle.is_active ? 'Sim' : 'Não'}</td>
      <td class="p-2 border">${raffle.winner_id || 'N/A'}</td>
    </tr>
  `).join('');
};

const updatePendingPurchases = (purchases) => {
  const pendingPurchases = document.getElementById('pendingPurchases');
  pendingPurchases.innerHTML = purchases.length ? purchases.map(purchase => `
    <tr>
      <td class="p-2 border">${purchase.id}</td>
      <td class="p-2 border">${purchase.username}</td>
      <td class="p-2 border">${purchase.raffle_name}</td>
      <td class="p-2 border">${purchase.quantity}</td>
      <td class="p-2 border">
        <button onclick="approvePurchase(${purchase.id})" class="btn bg-green-600 hover:bg-green-700">Aprovar</button>
        <button onclick="rejectPurchase(${purchase.id})" class="btn bg-red-600 hover:bg-red-700">Rejeitar</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="p-2 border text-center">Nenhuma compra pendente</td></tr>';
};

const updateRaffleResults = (results) => {
  const raffleResults = document.getElementById('raffleResults');
  raffleResults.innerHTML = results.length ? results.map(result => `
    <tr>
      <td class="p-2 border">${result.raffle_name}</td>
      <td class="p-2 border">${result.number}</td>
      <td class="p-2 border">${result.username} (ID: ${result.user_id})</td>
    </tr>
  `).join('') : '<tr><td colspan="3" class="p-2 border text-center">Nenhum sorteio realizado</td></tr>';
};

const approvePurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao aprovar compra.');
  }
};

const rejectPurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/purchases/${purchaseId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      fetchPendingPurchases();
    }
  } catch (error) {
    alert('Erro ao rejeitar compra.');
  }
};

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Estado para armazenar resultados de sorteios
let raffleResults = [];

// Ouvir atualizações em tempo real
socket.on('raffleListUpdate', (raffles) => {
  updateRaffleList(raffles);
});

socket.on('raffleResultUpdate', (result) => {
  raffleResults.push(result);
  updateRaffleResults(raffleResults);
});

// Carregar dados iniciais
fetchRaffles();
fetchPendingPurchases();
updateRaffleResults(raffleResults);
*/


/*
const fetchRaffles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles', {
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
  
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const users = await response.json();
      if (response.ok) {
        const winnerSelect = document.getElementById('winner_id');
        winnerSelect.innerHTML = '<option value="">Nenhum</option>' + users.map(user => 
          `<option value="${user.id}">${user.username}</option>`
        ).join('');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };
  
  const fetchPendingPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles/purchases/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const purchases = await response.json();
      if (response.ok) {
        const pendingPurchases = document.getElementById('pendingPurchases');
        pendingPurchases.innerHTML = purchases.map(purchase => `
          <tr>
            <td class="p-2 border">${purchase.id}</td>
            <td class="p-2 border">${purchase.username}</td>
            <td class="p-2 border">${purchase.raffle_name}</td>
            <td class="p-2 border">${purchase.quantity}</td>
            <td class="p-2 border">
              <button onclick="approvePurchase(${purchase.id})" class="btn bg-green-600 hover:bg-green-700 mr-2">Aprovar</button>
              <button onclick="rejectPurchase(${purchase.id})" class="btn bg-red-600 hover:bg-red-700">Rejeitar</button>
            </td>
          </tr>
        `).join('');
      } else {
        alert(purchases.message);
        window.location.href = 'login.html';
      }
    } catch (error) {
      alert('Erro ao carregar compras pendentes.');
    }
  };
  
  const approvePurchase = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert('Compra aprovada com sucesso!');
        fetchPendingPurchases();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao aprovar compra.');
    }
  };
  
  const rejectPurchase = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/raffles/purchases/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert('Compra rejeitada com sucesso!');
        fetchPendingPurchases();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao rejeitar compra.');
    }
  };
  
  const updateRaffleList = (raffles) => {
    const raffleList = document.getElementById('raffleList');
    raffleList.innerHTML = raffles.map(raffle => `
      <tr>
        <td class="p-2 border">${raffle.id}</td>
        <td class="p-2 border">${raffle.name}</td>
        <td class="p-2 border">R$ ${parseFloat(raffle.total_value).toFixed(2)}</td>
        <td class="p-2 border">${new Date(raffle.draw_date).toLocaleDateString()}</td>
        <td class="p-2 border">${raffle.numbers_quantity}</td>
        <td class="p-2 border">R$ ${parseFloat(raffle.number_value).toFixed(2)}</td>
        <td class="p-2 border">${raffle.is_active ? 'Ativa' : 'Inativa'}</td>
        <td class="p-2 border">${raffle.winner_username || 'Nenhum'}</td>
        <td class="p-2 border">
          <button onclick="editRaffle(${raffle.id})" class="text-blue-600 hover:underline">Editar</button>
        </td>
      </tr>
    `).join('');
  };
  
  const editRaffle = async (id) => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const raffles = await response.json();
      const raffle = raffles.find(r => r.id === id);
      if (raffle) {
        document.getElementById('raffleId').value = raffle.id;
        document.getElementById('name').value = raffle.name;
        document.getElementById('total_value').value = raffle.total_value;
        document.getElementById('draw_date').value = raffle.draw_date.split('T')[0];
        document.getElementById('numbers_quantity').value = raffle.numbers_quantity;
        document.getElementById('number_value').value = raffle.number_value;
        document.getElementById('is_active').value = raffle.is_active ? '1' : '0';
        document.getElementById('winner_id').value = raffle.winner_id || '';
      }
    } catch (error) {
      alert('Erro ao carregar dados da rifa.');
    }
  };
  
  document.getElementById('raffleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('raffleId').value;
    const raffleData = {
      name: document.getElementById('name').value,
      total_value: parseFloat(document.getElementById('total_value').value),
      draw_date: document.getElementById('draw_date').value,
      numbers_quantity: parseInt(document.getElementById('numbers_quantity').value),
      number_value: parseFloat(document.getElementById('number_value').value),
      is_active: document.getElementById('is_active').value === '1',
      winner_id: document.getElementById('winner_id').value || null
    };
  
    try {
      const url = id ? `http://localhost:5000/api/raffles/${id}` : 'http://localhost:5000/api/raffles';
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(raffleData)
      });
      const data = await response.json();
      if (response.ok) {
        alert(id ? 'Rifa atualizada com sucesso!' : 'Rifa criada com sucesso!');
        document.getElementById('raffleForm').reset();
        document.getElementById('raffleId').value = '';
        fetchRaffles();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao salvar rifa.');
    }
  });
  
  document.getElementById('resetForm').addEventListener('click', () => {
    document.getElementById('raffleForm').reset();
    document.getElementById('raffleId').value = '';
  });
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  // Ouvir atualizações em tempo real via WebSocket
  socket.on('raffleListUpdate', (raffles) => {
    updateRaffleList(raffles);
  });
  
  // Carregar rifas, usuários e compras pendentes ao iniciar
  fetchRaffles();
  fetchUsers();
  fetchPendingPurchases();
*/

/*
const fetchRaffles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles', {
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
  
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const users = await response.json();
      if (response.ok) {
        const winnerSelect = document.getElementById('winner_id');
        winnerSelect.innerHTML = '<option value="">Nenhum</option>' + users.map(user => 
          `<option value="${user.id}">${user.username}</option>`
        ).join('');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };
  
  const updateRaffleList = (raffles) => {
    const raffleList = document.getElementById('raffleList');
    raffleList.innerHTML = raffles.map(raffle => `
      <tr>
        <td class="p-2 border">${raffle.id}</td>
        <td class="p-2 border">${raffle.name}</td>
        <td class="p-2 border">R$ ${parseFloat(raffle.total_value).toFixed(2)}</td>
        <td class="p-2 border">${new Date(raffle.draw_date).toLocaleDateString()}</td>
        <td class="p-2 border">${raffle.numbers_quantity}</td>
        <td class="p-2 border">R$ ${parseFloat(raffle.number_value).toFixed(2)}</td>
        <td class="p-2 border">${raffle.is_active ? 'Ativa' : 'Inativa'}</td>
        <td class="p-2 border">${raffle.winner_username || 'Nenhum'}</td>
        <td class="p-2 border">
          <button onclick="editRaffle(${raffle.id})" class="text-blue-600 hover:underline">Editar</button>
        </td>
      </tr>
    `).join('');
  };
  
  const editRaffle = async (id) => {
    try {
      const response = await fetch('http://localhost:5000/api/raffles', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const raffles = await response.json();
      const raffle = raffles.find(r => r.id === id);
      if (raffle) {
        document.getElementById('raffleId').value = raffle.id;
        document.getElementById('name').value = raffle.name;
        document.getElementById('total_value').value = raffle.total_value;
        document.getElementById('draw_date').value = raffle.draw_date.split('T')[0];
        document.getElementById('numbers_quantity').value = raffle.numbers_quantity;
        document.getElementById('number_value').value = raffle.number_value;
        document.getElementById('is_active').value = raffle.is_active ? '1' : '0';
        document.getElementById('winner_id').value = raffle.winner_id || '';
      }
    } catch (error) {
      alert('Erro ao carregar dados da rifa.');
    }
  };
  
  document.getElementById('raffleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('raffleId').value;
    const raffleData = {
      name: document.getElementById('name').value,
      total_value: parseFloat(document.getElementById('total_value').value),
      draw_date: document.getElementById('draw_date').value,
      numbers_quantity: parseInt(document.getElementById('numbers_quantity').value),
      number_value: parseFloat(document.getElementById('number_value').value),
      is_active: document.getElementById('is_active').value === '1',
      winner_id: document.getElementById('winner_id').value || null
    };
  
    try {
      const url = id ? `http://localhost:5000/api/raffles/${id}` : 'http://localhost:5000/api/raffles';
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(raffleData)
      });
      const data = await response.json();
      if (response.ok) {
        alert(id ? 'Rifa atualizada com sucesso!' : 'Rifa criada com sucesso!');
        document.getElementById('raffleForm').reset();
        document.getElementById('raffleId').value = '';
        fetchRaffles();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao salvar rifa.');
    }
  });
  
  document.getElementById('resetForm').addEventListener('click', () => {
    document.getElementById('raffleForm').reset();
    document.getElementById('raffleId').value = '';
  });
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  // Ouvir atualizações em tempo real via WebSocket
  socket.on('raffleListUpdate', (raffles) => {
    updateRaffleList(raffles);
  });
  
  // Carregar rifas e usuários ao iniciar
  fetchRaffles();
  fetchUsers();
  */