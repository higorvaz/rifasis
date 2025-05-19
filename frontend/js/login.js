/*
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterButton = document.getElementById('showRegister');
  const showLoginButton = document.getElementById('showLogin');

  showRegisterButton.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  });

  showLoginButton.addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const response = await fetch(`${config.API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('role', result.role);
        window.location.href = result.role === 'admin' ? 'raffles.html' : 'buy_raffles.html';
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Erro ao fazer login.');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
      const response = await fetch(`${config.API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Erro ao registrar.');
    }
  });
});
*/


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      console.log('Attempting login with:', { email });

      try {
        const response = await fetch(config.API_URL+'/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        console.log('Login response status:', response.status);
        const result = await response.json();
        console.log('Login response data:', result);

        if (response.ok) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('userId', result.userId.toString());
          localStorage.setItem('role', result.role);
          console.log('Stored in localStorage:', {
            token: result.token,
            userId: result.userId,
            role: result.role
          });
          const redirectUrl = result.role === 'admin' ? 'raffles.html' : 'buy_raffles.html';
          console.log('Redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('Erro ao fazer login.');
      }
    });
  } else {
    console.error('Element with id "loginForm" not found');
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      console.log('Attempting registration with:', { username, email });

      try {
        const response = await fetch(config.API_URL+'/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        console.log('Register response status:', response.status);
        const result = await response.json();
        console.log('Register response data:', result);

        if (response.ok) {
          alert('Registro bem-sucedido! Faça login.');
          registerForm.reset();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error during registration:', error);
        alert('Erro ao registrar.');
      }
    });
  } else {
    console.error('Element with id "registerForm" not found');
  }
});




/*
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      console.log('Attempting login with:', { email });

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        console.log('Login response status:', response.status);
        const result = await response.json();
        console.log('Login response data:', result);

        if (response.ok) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('userId', result.userId.toString());
          localStorage.setItem('role', result.role);
          console.log('Stored in localStorage:', {
            token: result.token,
            userId: result.userId,
            role: result.role
          });
          window.location.href = result.role === 'admin' ? 'raffles.html' : 'buy_raffles.html';
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('Erro ao fazer login.');
      }
    });
  } else {
    console.error('Element with id "loginForm" not found');
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      console.log('Attempting registration with:', { username, email });

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        console.log('Register response status:', response.status);
        const result = await response.json();
        console.log('Register response data:', result);

        if (response.ok) {
          alert('Registro bem-sucedido! Faça login.');
          registerForm.reset();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error during registration:', error);
        alert('Erro ao registrar.');
      }
    });
  } else {
    console.error('Element with id "registerForm" not found');
  }
});
*/




/*
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      console.log('Attempting login with:', { email });

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        console.log('Login response status:', response.status);
        const result = await response.json();
        console.log('Login response data:', result);

        if (response.ok) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('userId', result.userId.toString());
          console.log('Stored in localStorage:', {
            token: result.token,
            userId: result.userId
          });
          window.location.href = result.role === 'admin' ? 'raffles.html' : 'buy_raffles.html';
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('Erro ao fazer login.');
      }
    });
  } else {
    console.error('Element with id "loginForm" not found');
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      console.log('Attempting registration with:', { username, email });

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        console.log('Register response status:', response.status);
        const result = await response.json();
        console.log('Register response data:', result);

        if (response.ok) {
          alert('Registro bem-sucedido! Faça login.');
          registerForm.reset();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error during registration:', error);
        alert('Erro ao registrar.');
      }
    });
  } else {
    console.error('Element with id "registerForm" not found');
  }
});
*/


/*
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (response.ok) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('userId', result.userId.toString());
          console.log('Stored userId in localStorage:', result.userId);
          window.location.href = result.role === 'admin' ? 'raffles.html' : 'buy_raffles.html';
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('Erro ao fazer login.');
      }
    });
  } else {
    console.error('Element with id "loginForm" not found');
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();
        if (response.ok) {
          alert('Registro bem-sucedido! Faça login.');
          registerForm.reset();
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('Erro ao registrar.');
      }
    });
  } else {
    console.error('Element with id "registerForm" not found');
  }
});
*/



/*
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('userId', result.userId.toString());
      console.log('Stored userId in localStorage:', result.userId);
      window.location.href = result.role === 'admin' ? 'raffles.html' : 'buy_raffles.html';
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert('Erro ao fazer login.');
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    if (response.ok) {
      alert('Registro bem-sucedido! Faça login.');
      document.getElementById('registerForm').reset();
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert('Erro ao registrar.');
  }
});
*/



/*
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'profile.html';
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao fazer login. Tente novamente.');
    }
  });
*/



/*
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          alert('Bem-vindo! Você está logado como usuário.');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao fazer login. Tente novamente.');
    }
  });
  */