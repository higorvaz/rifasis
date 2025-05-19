document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
      fetch('partials/menu.html')
        .then(response => response.text())
        .then(html => {
          menuContainer.innerHTML = html;
          console.log('Menu loaded into menu-container');
  
          // Controlar visibilidade dos botões administrativos
          const role = localStorage.getItem('role');
          console.log('User role:', role);
          if (role !== 'admin') {
            const adminButtons = document.querySelectorAll('.admin-only');
            adminButtons.forEach(button => {
              button.style.display = 'none';
              console.log('Hid admin-only button:', button);
            });
          }
  
          // Configurar logout
          const logoutButton = document.getElementById('logout');
          if (logoutButton) {
            logoutButton.addEventListener('click', () => {
              console.log('Logging out');
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              localStorage.removeItem('role');
              window.location.href = 'login.html';
            });
          }
        })
        .catch(error => {
          console.error('Error loading menu:', error);
        });
    } else {
      console.error('Menu container not found');
    }
  });