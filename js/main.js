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
        '.gallery-strip .polaroid img, .hero-collage .polaroid img, ' +
        '.story-photo .polaroid img, .option-card .photo img'
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

    function open(img) {
        lastFocus = img;
        bigImg.src = img.currentSrc || img.src;
        bigImg.alt = img.alt || '';
        const polaroid = img.closest('.polaroid');
        const cap = polaroid ? polaroid.querySelector('.caption') : null;
        caption.textContent = cap ? cap.textContent : '';
        box.classList.add('open');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function close() {
        box.classList.remove('open');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }

    zoomables.forEach((img) => {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.addEventListener('click', () => open(img));
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
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
