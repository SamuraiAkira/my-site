document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы ---
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.close-menu');
    const overlay = document.createElement('div');

    // --- Оверлей (затемнение) ---
    overlay.className = 'overlay';
    document.body.prepend(overlay);

    // --- Открытие / закрытие ---
    const openMenu = () => {
        mobileMenu.classList.add('open');
        overlay.classList.add('active');
        burger.classList.add('active');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        mobileMenu.classList.remove('open');
        overlay.classList.remove('active');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    // --- Обработчики ---
    burger?.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    closeBtn?.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // --- Ссылки в мобильном меню ---
    document.querySelectorAll('.mobile-menu a').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href?.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    closeMenu();
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 400);
                }
            } else {
                closeMenu();
            }
        });
    });

    // --- Закрытие по Escape ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
            closeMenu();
        }
    });

    // --- Konami Code ---
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
    let step = 0;
    let active = false;

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        if (e.key === konami[step]) {
            step++;
            if (step === konami.length) {
                if (!active) {
                    active = true;
                    document.body.style.backgroundColor = '#ff6b6b';
                    document.body.style.transition = 'background-color 0.5s';
                    document.title = '🎮 KONAMI CODE!';
                }
                step = 0;
            }
        } else {
            step = 0;
        }
    });
});