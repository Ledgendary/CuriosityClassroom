// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') navLinks.classList.remove('open');
    });
}

// Image lightbox: click a photo to see it large in a sticker-style panel
(function () {
    const zoomables = document.querySelectorAll(
        '.gallery-strip .polaroid, .hero-collage .polaroid, ' +
        '.story-photo .polaroid, .option-card .photo'
    );
    if (!zoomables.length) return;

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML =
        '<figure class="lightbox-panel">' +
        '<button class="lightbox-close" type="button" aria-label="Close image">✕</button>' +
        '<img alt="">' +
        '<figcaption class="lightbox-caption"></figcaption>' +
        '</figure>';
    document.body.appendChild(box);

    const bigImg = box.querySelector('img');
    const caption = box.querySelector('.lightbox-caption');
    const closeBtn = box.querySelector('.lightbox-close');
    let lastFocus = null;
    let scrollY = 0;

    function open(el) {
        const img = el.querySelector('img');
        if (!img) return;
        lastFocus = el;
        bigImg.src = img.currentSrc || img.src;
        bigImg.alt = img.alt || '';
        const cap = el.querySelector('.caption');
        caption.textContent = cap ? cap.textContent : '';
        // freeze the page: body itself becomes fixed, so mobile browsers
        // cannot scroll the background behind the overlay
        scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = -scrollY + 'px';
        document.body.style.left = '0';
        document.body.style.right = '0';
        box.classList.add('open');
        closeBtn.focus({ preventScroll: true });
    }

    function close() {
        box.classList.remove('open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        // jump (not smooth-scroll) back to where the visitor was
        const html = document.documentElement;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, scrollY);
        html.style.scrollBehavior = '';
        if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    zoomables.forEach((el) => {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.addEventListener('click', () => open(el));
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
        });
    });
    closeBtn.addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && box.classList.contains('open')) close();
    });
})();

// Scroll-reveal
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add('in'));
}
