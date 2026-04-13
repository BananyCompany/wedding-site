const toggleBtn = document.getElementById('theme-toggle');
const langBtn = document.getElementById('lang-toggle');
const body = document.body;
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMobileNav = document.getElementById('close-mobile-nav');
const mobileNav = document.getElementById('mobile-nav');
const header = document.querySelector('.header');
const scrollTopBtn = document.getElementById('scrollTopBtn');

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
        header.classList.add('header--hidden');
    } else {
        header.classList.remove('header--hidden');
    }
    lastScrollY = window.scrollY;

    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

toggleBtn.addEventListener('click', () => {
    const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('yablonsky_theme', newTheme);
});

const savedTheme = localStorage.getItem('yablonsky_theme') || 'dark';
body.setAttribute('data-theme', savedTheme);

let currentLang = localStorage.getItem('yablonsky_lang') || 'uk';

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'uk' ? 'en' : 'uk';
    localStorage.setItem('yablonsky_lang', currentLang);
    renderDynamicContent();
    applyLanguage();
});

function applyLanguage() {
    langBtn.textContent = currentLang === 'uk' ? 'EN' : 'UK';
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
}

mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.add('active');
});

closeMobileNav.addEventListener('click', () => {
    mobileNav.classList.remove('active');
});

document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
    });
});

const defaultData = {
    portfolio: { wedding: [], lovestory: [], family: [] },
    aboutImage: '',
    aboutTextUk: '',
    aboutTextEn: '',
    snowMode: 'logo',
    prices: [],
    reviews: [],
    contacts: { titleUk: '', titleEn: '', subtitleUk: '', subtitleEn: '', phone1: '', phone2: '', instagram: '', telegram: '', tiktok: '', facebook: '', orderLink: '' }
};

let siteData = defaultData;

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

function getEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('vimeo.com')) {
        const id = url.split('/').pop().split('?')[0];
        return `https://player.vimeo.com/video/${escapeHTML(id)}?dnt=1&title=0&byline=0&portrait=0&transparent=0&app_id=58479`;
    }
    return '';
}

function initLazyIframes() {
    const iframes = document.querySelectorAll('.video-slide iframe[data-src]');
    if ('IntersectionObserver' in window) {
        const iframeObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    iframe.src = iframe.dataset.src;
                    iframe.removeAttribute('data-src');
                    observer.unobserve(iframe);
                }
            });
        }, { rootMargin: '150px' });

        iframes.forEach(iframe => iframeObserver.observe(iframe));
    } else {
        iframes.forEach(iframe => {
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
        });
    }
}

function renderPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    grid.innerHTML = '';
    const categories = ['wedding', 'lovestory', 'family'];
    categories.forEach(cat => {
        const links = siteData.portfolio[cat] || [];
        const limitedLinks = links.slice(0, 10);
        limitedLinks.forEach(link => {
            if (!link.trim() || !link.includes('vimeo.com')) return;
            const embedUrl = getEmbedUrl(link.trim());
            if (embedUrl) {
                const wrap = document.createElement('div');
                wrap.className = `video-item-wrap item-${escapeHTML(cat)}`;
                wrap.innerHTML = `<div class="video-slide"><iframe data-src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
                grid.appendChild(wrap);
            }
        });
    });
    initLazyIframes();
}

let currentCategory = 'all';
const categoryScrollPositions = { 'all': 0, 'wedding': 0, 'lovestory': 0, 'family': 0 };

function filterPortfolio(category) {
    const grid = document.getElementById('portfolio-grid');
    if (grid) {
        categoryScrollPositions[currentCategory] = grid.scrollLeft;
    }
    currentCategory = category;

    const items = document.querySelectorAll('.video-item-wrap');
    items.forEach(item => {
        if (category === 'all' || item.classList.contains(`item-${category}`)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });

    if (grid) {
        grid.scrollLeft = categoryScrollPositions[category] || 0;
    }
}

function renderDynamicContent() {
    const isUk = currentLang === 'uk';
    const pGrid = document.getElementById('price-grid-container');
    pGrid.innerHTML = '';
    const orderLink = escapeHTML(siteData.contacts?.orderLink || '#contacts');

    (siteData.prices || []).forEach(p => {
        const rawTitle = isUk ? (p.titleUk || p.title || '') : (p.titleEn || p.titleUk || p.title || '');
        const rawFeatures = isUk ? (p.featuresUk || p.features || '') : (p.featuresEn || p.featuresUk || p.features || '');
        const featuresHtml = rawFeatures.split('\n').filter(f=>f.trim()).map(f => `<li>${escapeHTML(f)}</li>`).join('');
        const titleHtml = escapeHTML(rawTitle).split('\n').join('<br>');

        pGrid.innerHTML += `
            <div class="price-card">
                <h3>${titleHtml}</h3>
                <div class="price-img-container">
                    <img src="${escapeHTML(p.image)}" loading="lazy">
                </div>
                <p class="price-val">${escapeHTML(p.price)}</p>
                <ul>${featuresHtml}</ul>
                <a href="${orderLink}" class="order-btn" target="_blank" rel="noopener noreferrer" data-i18n="btn_order"></a>
            </div>
        `;
    });

    document.getElementById('about-img').src = siteData.aboutImage || '';
    const rawAbout = isUk ? (siteData.aboutTextUk || siteData.aboutText || '') : (siteData.aboutTextEn || siteData.aboutTextUk || siteData.aboutText || '');
    const textHtml = rawAbout.split('\n\n').filter(p=>p.trim()).map(p => `<p>${escapeHTML(p)}</p>`).join('');
    document.getElementById('about-text-container').innerHTML = textHtml;

    const rGrid = document.getElementById('reviews-grid');
    rGrid.innerHTML = '';
    (siteData.reviews || []).forEach(r => {
        const rawName = isUk ? (r.nameUk || r.name || '') : (r.nameEn || r.nameUk || r.name || '');
        const rawText = isUk ? (r.textUk || r.text || '') : (r.textEn || r.textUk || r.text || '');
        const rHtml = escapeHTML(rawText).split('\n').join('<br>');
        rGrid.innerHTML += `
            <div class="review-item-wrap">
                <div class="review-card">
                    <p>"${rHtml}"</p>
                    <img src="${escapeHTML(r.avatar)}" class="review-avatar" loading="lazy" style="display:${r.avatar ? 'block' : 'none'};">
                    <h4>${escapeHTML(rawName)}</h4>
                </div>
            </div>
        `;
    });

    const rawContactTitle = isUk ? (siteData.contacts?.titleUk || siteData.contacts?.title || '') : (siteData.contacts?.titleEn || siteData.contacts?.titleUk || siteData.contacts?.title || '');
    const rawContactSub = isUk ? (siteData.contacts?.subtitleUk || siteData.contacts?.subtitle || '') : (siteData.contacts?.subtitleEn || siteData.contacts?.subtitleUk || siteData.contacts?.subtitle || '');
    document.getElementById('contact-title').textContent = rawContactTitle;
    document.getElementById('contact-subtitle').textContent = rawContactSub;
}

function renderContactsStatic() {
    if (!siteData.contacts) return;
    const p1 = document.getElementById('phone1-text');
    p1.textContent = siteData.contacts.phone1 || '';
    document.getElementById('phone1').href = `tel:${(siteData.contacts.phone1 || '').replace(/\s/g, '')}`;
    const p2 = document.getElementById('phone2-text');
    p2.textContent = siteData.contacts.phone2 || '';
    document.getElementById('phone2').href = `tel:${(siteData.contacts.phone2 || '').replace(/\s/g, '')}`;
    document.getElementById('main-insta-link').href = siteData.contacts.instagram || '#';
    document.getElementById('tg-link').href = siteData.contacts.telegram || '#';
    document.getElementById('tt-link').href = siteData.contacts.tiktok || '#';
    document.getElementById('fb-link').href = siteData.contacts.facebook || '#';
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        filterPortfolio(e.target.getAttribute('data-filter'));
    });
});

document.getElementById('main-portfolio-btn').addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    filterPortfolio('all');
});

document.querySelectorAll('.dropdown-content a').forEach(link => {
    link.addEventListener('click', (e) => {
        const category = e.target.getAttribute('data-category');
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
        if (btn) btn.classList.add('active');
        filterPortfolio(category);
    });
});

function initCarousel(prevBtnId, nextBtnId, trackId) {
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const track = document.getElementById(trackId);
    if(!prevBtn || !nextBtn || !track) return;
    prevBtn.addEventListener('click', () => {
        const item = track.querySelector('.video-item-wrap:not(.hidden), .review-item-wrap:not(.hidden)');
        const scrollAmount = item ? item.offsetWidth + 30 : track.clientWidth * 0.5;
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
        const item = track.querySelector('.video-item-wrap:not(.hidden), .review-item-wrap:not(.hidden)');
        const scrollAmount = item ? item.offsetWidth + 30 : track.clientWidth * 0.5;
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
}

async function initLogo() {
    const wrapper = document.getElementById('logo-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = '<img src="assets/Logo_grey-2-3.svg" alt="Yablonsky Video">';

    const mode = siteData.snowMode || 'logo';
    if (mode === 'none') return;

    const target = mode === 'header' ? document.querySelector('.header') : wrapper;
    const snowWrapper = document.createElement('div');
    snowWrapper.className = 'snow-wrapper';
    target.appendChild(snowWrapper);

    const count = mode === 'header' ? 40 : 15;
    for (let i = 0; i < count; i++) {
        const snow = document.createElement('div');
        snow.className = 'snow-particle';

        const size = Math.random() * 3 + 1;
        snow.style.width = `${size}px`;
        snow.style.height = `${size}px`;
        snow.style.left = `${Math.random() * 100}%`;
        snow.style.top = `-25px`;
        snow.style.animationDuration = `${Math.random() * 4 + 3}s`;
        snow.style.animationDelay = `${Math.random() * 2}s`;

        snowWrapper.appendChild(snow);
    }
}

async function initSite() {
    try {
        const response = await fetch('/api/data');
        if (response.ok) {
            const data = await response.json();
            if (Object.keys(data).length > 0) {
                siteData = data;
            }
        }
    } catch (e) {}
    renderPortfolio();
    filterPortfolio('all');
    renderDynamicContent();
    renderContactsStatic();
    applyLanguage();
    initCarousel('car-prev', 'car-next', 'portfolio-grid');
    initCarousel('rev-prev', 'rev-next', 'reviews-grid');
    initLogo();
}

initSite();

const heroVideo = document.getElementById('main-bg-video');
if (heroVideo) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroVideo.play().catch(()=>{});
            } else {
                heroVideo.pause();
            }
        });
    }, { threshold: 0.1 });
    videoObserver.observe(heroVideo);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            heroVideo.pause();
        } else if (heroVideo.getBoundingClientRect().top < window.innerHeight && heroVideo.getBoundingClientRect().bottom > 0) {
            heroVideo.play().catch(()=>{});
        }
    });
}
