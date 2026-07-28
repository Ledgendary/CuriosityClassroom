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

// Mouse drag-to-scroll for horizontal snap feeds (touch already scrolls natively).
// Swallows the click that follows a real drag so it doesn't open the lightbox.
function enableDragScroll(el) {
    let snapTimer = null;

    el.addEventListener('dragstart', (e) => e.preventDefault());

    el.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        const startX = e.clientX;
        const startLeft = el.scrollLeft;
        let moved = false;
        clearTimeout(snapTimer);

        // NOTE: no pointer capture before a drag actually starts — capturing on
        // pointerdown retargets the click to the track and breaks photo clicks
        const onMove = (ev) => {
            const dx = ev.clientX - startX;
            if (!moved && Math.abs(dx) > 6) {
                moved = true;
                el.classList.add('dragging');
            }
            if (moved) el.scrollLeft = startLeft - dx;
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            if (!moved) return;
            // swallow the click that follows a real drag
            el.addEventListener('click', (ce) => {
                ce.stopPropagation();
                ce.preventDefault();
            }, { capture: true, once: true });
            // glide to the nearest snap position, then re-enable snapping
            const first = el.firstElementChild;
            const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
            const step = first ? first.getBoundingClientRect().width + gap : el.clientWidth;
            el.scrollTo({ left: Math.round(el.scrollLeft / step) * step, behavior: 'smooth' });
            snapTimer = setTimeout(() => el.classList.remove('dragging'), 420);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
    });
}

// Scroll-spy: keep the nav link for the section in view underlined
(function () {
    const bySection = new Map();
    document.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => {
        const sec = document.querySelector(a.getAttribute('href'));
        if (sec) bySection.set(sec, a);
    });
    if (!bySection.size || !('IntersectionObserver' in window)) return;
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            bySection.forEach((a) => a.classList.remove('active'));
            bySection.get(en.target).classList.add('active');
        });
    }, { rootMargin: '-35% 0px -55% 0px' });
    bySection.forEach((_, sec) => spy.observe(sec));
})();

// Quote river: an endless drifting feed you can also swipe, drag and click.
// Each row holds 4 copies of its card set; scroll position quietly wraps by
// one set-width so the loop never ends in either direction.
(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let qidx = 0;

    document.querySelectorAll('.qriver-track').forEach((track, row) => {
        const cards = Array.from(track.children);
        cards.forEach((card) => { card.dataset.qidx = qidx++; });
        for (let i = 0; i < 3; i++) {
            cards.forEach((card) => {
                const dup = card.cloneNode(true);
                dup.setAttribute('aria-hidden', 'true');
                track.appendChild(dup);
            });
        }

        enableDragScroll(track);

        let paused = false;
        let resumeTimer = null;
        track.addEventListener('pointerenter', () => { clearTimeout(resumeTimer); paused = true; });
        track.addEventListener('pointerleave', () => { clearTimeout(resumeTimer); paused = false; });
        track.addEventListener('touchstart', () => { clearTimeout(resumeTimer); paused = true; }, { passive: true });
        track.addEventListener('touchend', () => {
            clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => { paused = false; }, 3000);
        }, { passive: true });

        let inView = true;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                inView = entries[0].isIntersecting;
            }, { threshold: 0.1 }).observe(track);
        }

        const speed = row % 2 ? -16 : 20; // px per second, rows drift opposite ways
        let virtual = null;
        let last = null;

        track.scrollLeft = track.scrollWidth / 4; // start one copy in: runway both ways

        requestAnimationFrame(function tick(ts) {
            const w = track.scrollWidth / 4;
            const maxLeft = track.scrollWidth - track.clientWidth;
            // wrap by exactly one pixel-identical set-width
            if (track.scrollLeft < 2) track.scrollLeft += w;
            else if (track.scrollLeft > Math.min(w * 2.5, maxLeft - 2)) track.scrollLeft -= w;

            if (virtual === null || Math.abs(virtual - track.scrollLeft) > 1.5) {
                virtual = track.scrollLeft; // resync after user scroll or wrap
            }
            if (last !== null && !paused && inView && !reduceMotion && !document.hidden) {
                virtual += speed * ((ts - last) / 1000);
                track.scrollLeft = virtual;
            }
            last = ts;
            requestAnimationFrame(tick);
        });
    });
})();

// Photo carousels: native scroll-snap + arrows, counter and gentle autoplay
(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.carousel').forEach((root) => {
        const track = root.querySelector('.carousel-track');
        if (!track || track.children.length < 2) return;

        enableDragScroll(track);

        const ui = document.createElement('div');
        ui.className = 'carousel-ui';
        ui.innerHTML =
            '<button class="car-btn prev" type="button" aria-label="Previous photo">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
            '<span class="car-count"></span>' +
            '<button class="car-btn next" type="button" aria-label="Next photo">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>';
        root.appendChild(ui);

        const countEl = ui.querySelector('.car-count');

        // hooks filled in by the autoplay block below (no-ops without autoplay)
        let play = () => {};
        let pause = () => {};
        let restart = () => {};

        function step() {
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return track.children[0].getBoundingClientRect().width + gap;
        }
        function maxScroll() { return track.scrollWidth - track.clientWidth; }
        function positions() { return Math.max(1, Math.round(maxScroll() / step()) + 1); }
        function updateCount() {
            const cur = Math.min(positions(), Math.round(track.scrollLeft / step()) + 1);
            countEl.textContent = cur + ' / ' + positions();
        }

        // adaptive frame: match the track height to the current photo's shape
        const adaptive = root.classList.contains('carousel-adaptive');
        let lastH = 0;
        function syncHeight() {
            if (!adaptive) return;
            const idx = Math.min(track.children.length - 1,
                Math.max(0, Math.round(track.scrollLeft / step())));
            const slide = track.children[idx];
            const img = slide.querySelector('img');
            if (!img) return;
            const w = parseFloat(img.getAttribute('width')) || img.naturalWidth;
            const h = parseFloat(img.getAttribute('height')) || img.naturalHeight;
            if (!w || !h) return;
            const target = Math.round(slide.clientWidth * (h / w));
            if (target && target !== lastH) {
                lastH = target;
                track.style.height = target + 'px';
            }
        }

        function go(dir) {
            const max = maxScroll();
            if (dir > 0 && track.scrollLeft >= max - 4) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (dir < 0 && track.scrollLeft <= 4) {
                track.scrollTo({ left: max, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: dir * step(), behavior: 'smooth' });
            }
        }

        ui.querySelector('.prev').addEventListener('click', () => { go(-1); restart(); });
        ui.querySelector('.next').addEventListener('click', () => { go(1); restart(); });

        let ticking = false;
        track.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => { updateCount(); syncHeight(); ticking = false; });
        }, { passive: true });
        window.addEventListener('resize', updateCount);
        updateCount();
        if (adaptive) {
            (function heightLoop() {
                syncHeight();
                requestAnimationFrame(heightLoop);
            })();
        }

        const auto = parseInt(root.dataset.auto || '0', 10);
        if (!auto || reduceMotion) return;

        let timer = null;
        let inView = true;

        play = () => {
            if (timer || !inView || document.hidden) return;
            timer = setInterval(() => go(1), auto);
        };
        pause = () => { clearInterval(timer); timer = null; };
        restart = () => { if (timer) { pause(); play(); } };

        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                inView = entries[0].isIntersecting;
                if (inView) play(); else pause();
            }, { threshold: 0.25 }).observe(root);
        }

        root.addEventListener('pointerenter', pause);
        root.addEventListener('pointerleave', play);
        root.addEventListener('focusin', pause);
        root.addEventListener('focusout', play);
        track.addEventListener('touchstart', pause, { passive: true });
        track.addEventListener('touchend', () => setTimeout(play, 4000), { passive: true });
        document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else play(); });

        play();
    });
})();

// Lightbox: click any photo or quote to open its whole set as a full-screen swipeable feed
(function () {
    const zoomables = document.querySelectorAll('.zoomable');
    const qcards = document.querySelectorAll('.qcard');
    if (!zoomables.length && !qcards.length) return;

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML =
        '<div class="lightbox-feed"></div>' +
        '<button class="lightbox-close" type="button" aria-label="Close gallery">✕</button>' +
        '<button class="lb-btn lb-prev" type="button" aria-label="Previous photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
        '<button class="lb-btn lb-next" type="button" aria-label="Next photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' +
        '<span class="lb-count"></span>';
    document.body.appendChild(box);

    const feed = box.querySelector('.lightbox-feed');
    const closeBtn = box.querySelector('.lightbox-close');
    const prevBtn = box.querySelector('.lb-prev');
    const nextBtn = box.querySelector('.lb-next');
    const countEl = box.querySelector('.lb-count');
    let lastFocus = null;
    let scrollY = 0;
    let total = 0;

    enableDragScroll(feed);

    // Group photos: all slides of a carousel form one feed; standalone photos open alone
    const groups = [];
    const trackToGroup = new Map();

    zoomables.forEach((el) => {
        const img = el.querySelector('img');
        if (!img) return;
        const track = el.closest('.carousel-track');
        let gi;
        if (track) {
            if (!trackToGroup.has(track)) {
                trackToGroup.set(track, groups.length);
                groups.push([]);
            }
            gi = trackToGroup.get(track);
        } else {
            gi = groups.length;
            groups.push([]);
        }
        const ii = groups[gi].length;
        groups[gi].push({ img });

        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.addEventListener('click', () => open(gi, ii));
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(gi, ii); }
        });
    });

    // parent quote cards: one shared group in reading order, clones map to
    // the same quote via data-qidx set by the river module
    if (qcards.length) {
        const byIdx = new Map();
        qcards.forEach((card) => {
            const i = parseInt(card.dataset.qidx, 10);
            if (!byIdx.has(i)) byIdx.set(i, card);
        });
        const qgi = groups.length;
        groups.push(Array.from(byIdx.keys()).sort((a, b) => a - b).map((i) => {
            const card = byIdx.get(i);
            const cs = getComputedStyle(card);
            return {
                quote: card.querySelector('p').textContent,
                bg: cs.backgroundColor,
                border: cs.borderColor
            };
        }));
        qcards.forEach((card) => {
            const i = parseInt(card.dataset.qidx, 10);
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.addEventListener('click', () => open(qgi, i));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(qgi, i); }
            });
        });
    }

    function updateCount() {
        const cur = Math.min(total, Math.round(feed.scrollLeft / feed.clientWidth) + 1);
        countEl.textContent = cur + ' / ' + total;
    }

    function open(gi, ii) {
        const entries = groups[gi];
        total = entries.length;
        lastFocus = document.activeElement;

        feed.textContent = '';
        entries.forEach((en) => {
            const slide = document.createElement('div');
            slide.className = 'lb-slide';
            if (en.img) {
                const big = document.createElement('img');
                big.src = en.img.currentSrc || en.img.src;
                big.alt = en.img.alt || '';
                big.loading = 'lazy';
                big.draggable = false;
                slide.appendChild(big);
            } else {
                const card = document.createElement('div');
                card.className = 'lb-qcard';
                card.style.background = en.bg;
                card.style.borderColor = en.border;
                const p = document.createElement('p');
                p.textContent = en.quote;
                const cap = document.createElement('span');
                cap.className = 'lb-qcap';
                cap.textContent = 'A Curiosity Classroom parent';
                card.appendChild(p);
                card.appendChild(cap);
                slide.appendChild(card);
            }
            feed.appendChild(slide);
        });
        box.classList.toggle('single', total < 2);

        // freeze the page: body itself becomes fixed, so mobile browsers
        // cannot scroll the background behind the overlay
        scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = -scrollY + 'px';
        document.body.style.left = '0';
        document.body.style.right = '0';
        box.classList.add('open');
        requestAnimationFrame(() => {
            feed.scrollTo({ left: ii * feed.clientWidth, behavior: 'auto' });
            updateCount();
        });
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

    function goFeed(dir) {
        feed.scrollBy({ left: dir * feed.clientWidth, behavior: 'smooth' });
    }

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => goFeed(-1));
    nextBtn.addEventListener('click', () => goFeed(1));

    // click on the dark area around a photo closes the feed
    feed.addEventListener('click', (e) => {
        if (e.target === feed || e.target.classList.contains('lb-slide')) close();
    });

    // desktop: mouse wheel moves the feed sideways
    feed.addEventListener('wheel', (e) => {
        e.preventDefault();
        feed.scrollLeft += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    }, { passive: false });

    let ticking = false;
    feed.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { updateCount(); ticking = false; });
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (!box.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') goFeed(1);
        else if (e.key === 'ArrowLeft') goFeed(-1);
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
