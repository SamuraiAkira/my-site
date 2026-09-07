document.addEventListener('DOMContentLoaded', function() {
    // --- Burger menu ---
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.close-menu');
    
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    function openMenu() {
        mobileMenu.classList.add('open');
        overlay.classList.add('active');
        burger.classList.add('active');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.classList.remove('open');
        overlay.classList.remove('active');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // Открытие меню
    if (burger) {
        burger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mobileMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // Закрытие через крестик
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    // Закрытие по клику на оверлей
    overlay.addEventListener('click', closeMenu);

    // Закрытие меню при клике на любую ссылку в мобильном меню
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Если ссылка якорная - закрываем меню
            closeMenu();
        });
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    // --- Плавная прокрутка для якорных ссылок ---
    // (на случай, если браузер не поддерживает scroll-behavior)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Konami Code ---
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
    let currentIndex = 0;
    let konamiActive = false;

    document.addEventListener('keydown', function(event) {
        const key = event.key;
        
        if (key === konamiCode[currentIndex]) {
            currentIndex++;
            
            if (currentIndex === konamiCode.length) {
                activateKonamiCode();
                currentIndex = 0;
            }
        } else {
            currentIndex = 0;
        }
    });

    function activateKonamiCode() {
        if (konamiActive) return;
        
        konamiActive = true;
        console.log('🎮 Konami Code activated!');
        
        document.body.style.backgroundColor = '#ff6b6b';
        document.body.style.transition = 'background-color 0.5s';
        document.title = '🎮 KONAMI CODE!';
    }
});