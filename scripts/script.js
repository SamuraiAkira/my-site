document.addEventListener('DOMContentLoaded', () => {

    const burger    = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn  = document.querySelector('.close-menu');
    const overlay   = document.createElement('div');

    overlay.className = 'overlay';
    document.body.prepend(overlay);

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

    burger?.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    closeBtn?.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
            closeMenu();
        }
    });

    const isMobile = () => window.innerWidth <= 768;

    let destructionActive = false;
    let destroyModeTriggered   = false;

    const destroyMode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                    'b','a','Enter'];
    let step = 0;

document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    step = e.key === destroyMode[step] ? step + 1 : 0;

    if (step === destroyMode.length) {
        step = 0;
        if (destroyModeTriggered) return;
        destroyModeTriggered = true;

        document.body.style.cssText += 'background:#ff6b6b; transition:background-color .5s';
        startDestructionMode();
    }
});

function startDestructionMode() {
    if (isMobile()) return;

    document.title = '☠ РЕЖИМ УНИЧТОЖЕНИЯ';

    const popupOverlay = Object.assign(document.createElement('div'), {
        className: 'destroy-overlay',
        innerHTML: `
            <div class="destroy-popup">
                <h3>УНИЧТОЖЬ ВСЁ</h3>
                <p class="destroy-hint">*Нажимай ЛКМ по сайту*</p>
            </div>`
    });

    document.body.appendChild(popupOverlay);

    popupOverlay.querySelector('.destroy-popup').addEventListener('click', (e) => {
        e.stopPropagation();
        popupOverlay.remove();
        enableDestruction();
    });

    popupOverlay.addEventListener('click', (e) => e.stopPropagation());
}

    function enableDestruction() {
        destructionActive = true;
        document.body.classList.add('destruction-mode');
        document.addEventListener('click', onDestroyClick, true);
    }

    function onDestroyClick(e) {
        if (!destructionActive || isMobile()) return;
        if (e.button !== 0) return;

        const target = e.target;
        if (!target) return;
        if (target === document.body || target === document.documentElement) return;
        if (target.classList.contains('wrapper')) return;
        if (target.closest('.mobile-menu')) return; 
        if (target.closest('.destroy-overlay')) return; 

        e.preventDefault();
        e.stopPropagation();

        playClickAnimation(e.clientX, e.clientY);

        const destroyTarget = target.closest('a, button') || target;

        destroyElement(destroyTarget, e.clientX, e.clientY);
    }

    function playClickAnimation(x, y) {
        const anim = document.createElement('div');
        anim.className = 'click-animation';

        /* ▼▼▼  МЕСТО ДЛЯ ТВОЕГО GIF  ▼▼▼ */
        anim.innerHTML = '<img src="assets/click.gif" alt="">';

        anim.style.left = x + 'px';
        anim.style.top  = y + 'px';
        document.body.appendChild(anim);

        setTimeout(() => anim.remove(), 600);
    }

    function destroyElement(el, clickX, clickY) {
        if (!el || !el.parentNode) return;

        el.querySelectorAll('.mobile-menu').forEach((m) => {
            m.style.display = 'none';
        });

        const rect    = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        const angle = clickX < centerX ? 25 : -25;

        el.style.pointerEvents = 'none';
        el.style.willChange    = 'transform, opacity';
        el.style.transformOrigin = 'center center';
        el.style.transition    = 'transform 0.9s cubic-bezier(0.55, 0.06, 0.68, 0.19), opacity 0.9s';

        void el.offsetWidth;

        requestAnimationFrame(() => {
            el.style.transform = `rotate(${angle}deg) translateY(110vh)`;
            el.style.opacity   = '0';
        });

        setTimeout(() => {
            el.remove();
            checkAllDestroyed();
        }, 950);
    }

    function checkAllDestroyed() {
        if (!destructionActive) return;

        const wrapper = document.querySelector('.wrapper');
        if (!wrapper) { showFinalPopup(); return; }

        let hasVisible = false;

        wrapper.querySelectorAll('*').forEach((el) => {
            if (el.closest('.mobile-menu')) return;
            if (!document.body.contains(el)) return;

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            if (rect.right <= 0 || rect.left >= window.innerWidth ||
                rect.bottom <= 0 || rect.top >= window.innerHeight) return;

            const style = getComputedStyle(el);
            if (style.display === 'none' ||
                style.visibility === 'hidden' ||
                parseFloat(style.opacity) === 0) return;

            hasVisible = true;
        });

        if (!hasVisible) showFinalPopup();
    }

    function showFinalPopup() {
        if (document.querySelector('.destroy-overlay.final')) return;

        document.title = '🪦 R.I.P. SamuraiAkira.dev';
        destructionActive = false;
        document.body.classList.remove('destruction-mode');
        document.removeEventListener('click', onDestroyClick, true);

        const finalOverlay = document.createElement('div');
        finalOverlay.className = 'destroy-overlay final';
        finalOverlay.innerHTML = `
            <div class="destroy-popup final-popup">
                <h3>САЙТ УНИЧТОЖЕН</h3>
                <p class="destroy-hint">*Клик*</p>
            </div>
        `;
        document.body.appendChild(finalOverlay);

        let reloaded = false;
        const reload = () => {
            if (reloaded) return;
            reloaded = true;
            location.reload();
        };

        finalOverlay.querySelector('.destroy-popup')
            .addEventListener('click', (e) => {
                e.stopPropagation();
                reload();
            });

        finalOverlay.addEventListener('click', (e) => e.stopPropagation());

    }
});