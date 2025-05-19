document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch(config.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registro bem-sucedido! Faça login.');
        window.location.href = 'login.html';
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao registrar. Tente novamente.');
    }
  });