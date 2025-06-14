document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const hamburger = document.getElementById('hamburger');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    let menuCloseBtn = null; // Será criado dinamicamente

    // Criar estrutura do menu se não existir
    if (hamburgerMenu && !hamburgerMenu.querySelector('.menu-header')) {
        createMenuHeader();
    }

    // Event listeners
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }

    // Fechar menu com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && hamburgerMenu && hamburgerMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    // Funções do menu
    function createMenuHeader() {
        const menuHeader = document.createElement('div');
        menuHeader.className = 'menu-header';
        menuHeader.innerHTML = `
            <span class="menu-title">Menu</span>
            <button class="menu-close-btn" id="menu-close-btn" aria-label="Close menu">×</button>
        `;

        // Inserir header no início do menu
        const menuList = hamburgerMenu.querySelector('ul');
        hamburgerMenu.insertBefore(menuHeader, menuList);

        // Configurar event listener do botão fechar
        menuCloseBtn = document.getElementById('menu-close-btn');
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', closeMenu);
        }
    }

    function toggleMenu() {
        if (hamburgerMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function openMenu() {
        hamburgerMenu.classList.add('open');
        if (menuOverlay) {
            menuOverlay.classList.add('active');
        }
        document.body.classList.add('menu-open');
        
        // Focar no botão fechar para acessibilidade
        if (menuCloseBtn) {
            setTimeout(() => menuCloseBtn.focus(), 300);
        }
    }

    function closeMenu() {
        hamburgerMenu.classList.remove('open');
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
        document.body.classList.remove('menu-open');
        
        // Retornar foco para o hamburger button
        if (hamburger) {
            hamburger.focus();
        }
    }

    // Footer - atualizar ano e data de modificação
    const currentYear = document.getElementById('currentYear');
    const lastModified = document.getElementById('lastModified');
    
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
    
    if (lastModified) {
        lastModified.textContent = `Last Updated: ${document.lastModified}`;
    }

    // Exportar funções para uso global se necessário
    window.menuControls = {
        openMenu,
        closeMenu,
        toggleMenu
    };
});