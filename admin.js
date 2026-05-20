/* ================================================
   NOURISH ADMIN — WYSIWYG Inline Editor Engine
   ================================================ */

// Supabase config fallback
if (typeof SUPABASE_URL === 'undefined') {
    window.SUPABASE_URL = 'https://codzpebogkhbgtgvudnu.supabase.co';
    window.SUPABASE_ANON_KEY = 'sb_publishable_1Ca9J-LAc1as6YTioTqFsw_vXll5LWc';
}

const STORAGE_KEY = 'nbe_content';
// No hardcoded password — uses Supabase Auth (email/password)
let AUTH_TOKEN = null; // JWT token from Supabase Auth

// Auto-detect: local dev (localhost/file) vs deployed (production domain)
const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
const SITE_HTML_PATH = IS_LOCAL ? '../NourishByEkta/index.html' : '/proxy/index.html';
const SITE_IMG_BASE  = IS_LOCAL ? '../NourishByEkta/images/'    : '/proxy/images/';

// ===========================
// DEFAULT CONTENT
// ===========================
const DEFAULTS = {
    hero: {
        title: "Make Your Gut Health Better,",
        titleAccent: "Transform Your Life",
        subtitle: "Dedicated to helping you make your gut health better and build a healthier relationship with food — through gentle, personalized, and science-backed nutrition care.",
        stat1Num: "2000", stat1Label: "Clients Transformed",
        stat2Num: "2", stat2Label: "Years Experience"
    },
    about: {
        lead: "Dedicated to helping you make your gut health better and build a healthier relationship with food — through calm, consistent, and compassionate care.",
        body: "I hold an M.Sc in Applied Nutrition from ICMR-NIN, one of India's premier nutrition research institutes. With a strong scientific foundation, a background in clinical research, and internationally recognized certifications, I bring evidence-based, whole-food strategies to every client I work with. I believe in gentle, sustainable healing — not extremes.",
        credentials: [
            "M.Sc Applied Nutrition — ICMR-NIN",
            "Certified Diabetes Educator — IDF",
            "Low FODMAP Diet for IBS — Monash University, Australia",
            "Clinical Nutrition Research — ICMR-NIN",
            "All India Rank 11 & State Rank 3 — NCET 2021",
            "State Rank 6 — CPGET 2021",
            "Gut-Brain Axis & Microbiome Nutrition",
            "Women's Health & Hormonal Nutrition — PCOS & Thyroid",
            "Therapeutic Nutrition for Chronic Conditions"
        ]
    },
    services: {
        discovery: { title: "Discovery Call", desc: "Not sure where to start? Let's chat. A no-pressure conversation to understand your health goals and see if we're the right fit.", price: "Free", features: ["15-minute video call", "Health goals discussion", "Personalized next steps", "Zero obligation"] },
        oneMonth: { title: "1 Month Nutrition Program", desc: "A focused, personalized nutrition plan to kickstart your health journey with expert guidance and ongoing support.", price: "₹4,000", features: ["Detailed diet assessment", "Customized monthly meal plan", "4 weekly 30-min video calls", "WhatsApp support", "Progress review & adjustments"] },
        threeMonth: { title: "3 Month Nutrition Program", desc: "The most comprehensive program for deep, lasting transformation. Full clinical support across 12 weeks for sustainable results.", price: "₹10,000", features: ["In-depth health & diet assessment", "Monthly customized meal plans", "12 weekly 30-min video calls", "Priority WhatsApp support", "Lab report interpretation", "Supplement guidance", "End-to-end progress tracking"] }
    },
    approach: [
        { title: "Discover", desc: "Deep dive into your health history, lifestyle, food preferences, and goals. No judgment — just understanding." },
        { title: "Design", desc: "I create a custom nutrition strategy that fits YOUR schedule and taste — not a cookie-cutter plan." },
        { title: "Implement", desc: "We work together to build sustainable habits with actionable steps, recipes, and real-time support." },
        { title: "Evolve", desc: "Regular check-ins to adjust your plan, celebrate wins, and keep momentum going for long-term results." },
        { title: "Nourish", desc: "Introduce whole, real foods that heal and energise — practical meal ideas that feel like pleasure, not restriction." },
        { title: "Track", desc: "Monitor progress through body metrics, lab markers, and how you feel — data-driven insights to keep you on course." },
        { title: "Educate", desc: "Learn the science behind your nutrition so you can make confident, informed food decisions every single day — for life." },
        { title: "Thrive", desc: "Celebrate your transformation and build lifelong habits that sustain your energy, health, and happiness independently." }
    ],
    testimonials: [
        { initial: "A", name: "Anjali R.", tag: "Found relief from severe constipation", text: "I was struggling with severe constipation and gut issues, but thanks to Ekta's calm guidance and customized diet, I finally found relief. Her constant support and homemade solutions have been truly life-changing!" },
        { initial: "S", name: "Sneha K.", tag: "Overcame severe gut health anxiety", text: "Ekta was the only one who truly understood my health anxiety. I had almost lost hope of healing my gut, but her patient listening and targeted supplement protocols brought me entirely out of the darkness." },
        { initial: "R", name: "Rohan M.", tag: "Chronic symptom reduction", text: "For 3 years I dealt with severe nausea, weight loss, and couldn't tolerate protein. Ekta helped me understand my triggers and her protocol drastically reduced all my symptoms. She is no less than a doctor." },
        { initial: "M", name: "Megha V.", tag: "Eliminated bloating & brain fog", text: "I had terrible bloating, brain fog, and crazy weight gain. Her detail-oriented plan never once made me feel like I was on a restrictive diet. I feel active and confident again — this journey has been amazing!" }
    ],
    booking: { whatsapp: "919326752527", instagram: "https://www.instagram.com/nourishbyekta?igsh=aHd2YXBsYjNqNngy", facebook: "https://www.facebook.com/nourishbyekta" },
    footer: { email: "nourishbyekta@gmail.com", phone: "+91 9326752527", copyright: "© 2026 Nourish By Ekta. All rights reserved." }
};

// ===========================
// SUPABASE AUTH — login/logout via Supabase (no hardcoded passwords)
// ===========================
async function supabaseSignIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error_description || err.msg || 'Invalid credentials');
    }
    const data = await res.json();
    AUTH_TOKEN = data.access_token;
    // Store session securely (sessionStorage — cleared on tab close)
    sessionStorage.setItem('nbe_auth_token', data.access_token);
    sessionStorage.setItem('nbe_refresh_token', data.refresh_token);
    return data;
}

async function supabaseSignOut() {
    if (AUTH_TOKEN) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${AUTH_TOKEN}` }
        }).catch(() => {});
    }
    AUTH_TOKEN = null;
    sessionStorage.removeItem('nbe_auth_token');
    sessionStorage.removeItem('nbe_refresh_token');
}

async function restoreSession() {
    const token = sessionStorage.getItem('nbe_auth_token');
    if (!token) return false;
    // Verify token is still valid
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) { AUTH_TOKEN = token; return true; }
    // Try refresh
    const refresh = sessionStorage.getItem('nbe_refresh_token');
    if (refresh) {
        const r2 = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh })
        });
        if (r2.ok) {
            const d = await r2.json();
            AUTH_TOKEN = d.access_token;
            sessionStorage.setItem('nbe_auth_token', d.access_token);
            sessionStorage.setItem('nbe_refresh_token', d.refresh_token);
            return true;
        }
    }
    sessionStorage.removeItem('nbe_auth_token');
    sessionStorage.removeItem('nbe_refresh_token');
    return false;
}

// ===========================
// SUPABASE REST — reads use anon key (public), writes use auth JWT
// ===========================
async function saveToSupabase(content) {
    try {
        if (!AUTH_TOKEN) { console.error('[Admin] Not authenticated'); return false; }
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.1`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ data: content, updated_at: new Date().toISOString() })
        });
        if (res.ok) return true;
        const res2 = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ id: 1, data: content, updated_at: new Date().toISOString() })
        });
        return res2.ok;
    } catch (e) { console.error('[Admin] Save error:', e); return false; }
}

async function loadFromSupabase() {
    try {
        if (typeof SUPABASE_URL === 'undefined') return null;
        // Reads use anon key (public — no auth needed, visitors need this)
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=data&id=eq.1`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Accept': 'application/json' }
        });
        if (!res.ok) return null;
        const rows = await res.json();
        if (!rows || rows.length === 0 || !rows[0]?.data) return null;
        return Object.keys(rows[0].data).length > 0 ? rows[0].data : null;
    } catch { return null; }
}

// ===========================
// STATE
// ===========================
function mergeWithDefaults(saved) {
    const result = JSON.parse(JSON.stringify(DEFAULTS));
    if (!saved) return result;
    for (const key in saved) {
        if (typeof saved[key] === 'object' && !Array.isArray(saved[key]) && saved[key] !== null) {
            result[key] = { ...result[key], ...saved[key] };
        } else {
            result[key] = saved[key];
        }
    }
    return result;
}

function loadContent() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? mergeWithDefaults(JSON.parse(raw)) : JSON.parse(JSON.stringify(DEFAULTS));
    } catch { return JSON.parse(JSON.stringify(DEFAULTS)); }
}

function saveContentLocal(content) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

// ===========================
// AUTH — uses Supabase Auth (no hardcoded passwords)
// ===========================
async function logout() {
    await supabaseSignOut();
    location.reload();
}

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', async () => {
    // Try to restore existing session
    const hasSession = await restoreSession();
    if (hasSession) {
        showEditor();
    } else {
        document.getElementById('loginScreen').classList.remove('hidden');
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput').value.trim();
        const pw = document.getElementById('passwordInput').value;
        const errEl = document.getElementById('loginError');
        const btn = e.target.querySelector('.btn-login');

        if (!email || !pw) { errEl.textContent = 'Please enter email and password.'; return; }

        btn.textContent = 'Signing in…';
        btn.disabled = true;
        errEl.textContent = '';

        try {
            await supabaseSignIn(email, pw);
            showEditor();
        } catch (err) {
            errEl.textContent = err.message || 'Login failed. Check your credentials.';
            btn.textContent = 'Sign In';
            btn.disabled = false;
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('publishBtn').addEventListener('click', publishChanges);

    // Section navigation
    document.querySelectorAll('.section-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.section;
            const el = document.getElementById(id) || document.querySelector(`[id="${id}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state
                document.querySelectorAll('.section-nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // Device toggle
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const sc = document.getElementById('siteContainer');
            sc.classList.remove('preview-tablet', 'preview-mobile');
            if (btn.dataset.device === 'tablet') sc.classList.add('preview-tablet');
            if (btn.dataset.device === 'mobile') sc.classList.add('preview-mobile');
        });
    });
});

// ===========================
// SHOW EDITOR — fetch site HTML & inject
// ===========================
async function showEditor() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminToolbar').classList.remove('hidden');
    document.getElementById('siteWrapper').classList.remove('hidden');

    // Load content from cloud
    const cloudData = await loadFromSupabase();
    if (cloudData) saveContentLocal(mergeWithDefaults(cloudData));

    // Fetch the main site's HTML
    try {
        const res = await fetch(SITE_HTML_PATH);
        const html = await res.text();
        injectSiteHTML(html);
    } catch (e) {
        document.getElementById('siteContainer').innerHTML =
            '<div style="padding:60px;text-align:center;color:#999;">Could not load website. Make sure NourishByEkta folder is in the same parent directory.</div>';
        console.error('[Admin] Failed to load site HTML:', e);
    }
}

// ===========================
// INJECT SITE HTML
// ===========================
function injectSiteHTML(fullHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHTML, 'text/html');

    // Extract body content (skip scripts and external CSS links)
    const body = doc.body;

    // Remove script tags (we don't want the main site's JS running)
    body.querySelectorAll('script').forEach(s => s.remove());

    // Fix image paths — images/xxx → ../NourishByEkta/images/xxx
    body.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('images/')) {
            img.setAttribute('src', SITE_IMG_BASE + src.replace('images/', ''));
        }
    });

    // Remove the skip-nav link
    const skipNav = body.querySelector('.skip-nav');
    if (skipNav) skipNav.remove();

    // Inject into container
    const container = document.getElementById('siteContainer');
    container.innerHTML = body.innerHTML;

    // Now make everything editable & apply saved content
    const content = loadContent();
    applyContentAndMakeEditable(content);

    // Disable all links inside the site container
    container.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    // Disable buttons inside the site
    container.querySelectorAll('button').forEach(btn => {
        if (!btn.closest('.admin-toolbar')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    });
}

// ===========================
// APPLY CONTENT & MAKE EDITABLE
// ===========================
function applyContentAndMakeEditable(c) {
    const sc = document.getElementById('siteContainer');
    if (!sc) return;

    // --- HERO ---
    if (c.hero) {
        const titleEl = sc.querySelector('.hero-title');
        if (titleEl) {
            // Set the text node (before the <span>)
            const textNode = [...titleEl.childNodes].find(n => n.nodeType === 3);
            if (textNode) textNode.textContent = c.hero.title + '\n';
        }
        makeEditable(sc.querySelector('.hero-title-accent'), 'hero.titleAccent', c.hero.titleAccent);
        makeEditable(sc.querySelector('.hero-subtitle'), 'hero.subtitle', c.hero.subtitle);

        // Stats
        const statNums = sc.querySelectorAll('.stat-number');
        const statLabels = sc.querySelectorAll('.stat-label');
        if (statNums[0]) { statNums[0].textContent = c.hero.stat1Num; statNums[0].dataset.target = c.hero.stat1Num; makeEditable(statNums[0], 'hero.stat1Num', c.hero.stat1Num); }
        if (statLabels[0]) makeEditable(statLabels[0], 'hero.stat1Label', c.hero.stat1Label);
        if (statNums[1]) { statNums[1].textContent = c.hero.stat2Num; statNums[1].dataset.target = c.hero.stat2Num; makeEditable(statNums[1], 'hero.stat2Num', c.hero.stat2Num); }
        if (statLabels[1]) makeEditable(statLabels[1], 'hero.stat2Label', c.hero.stat2Label);

        // Hero title first line — special handling (has a <br> and <span> inside)
        if (titleEl) {
            // Make just the first text node editable by wrapping it
            const firstText = [...titleEl.childNodes].find(n => n.nodeType === 3);
            if (firstText && !titleEl.querySelector('.hero-title-line1')) {
                const wrapper = document.createElement('span');
                wrapper.className = 'hero-title-line1';
                wrapper.textContent = c.hero.title;
                firstText.replaceWith(wrapper);
                // Insert br after wrapper
                const br = titleEl.querySelector('br') || document.createElement('br');
                wrapper.after(br);
                makeEditable(wrapper, 'hero.title', c.hero.title);
            }
        }
    }

    // --- ABOUT ---
    if (c.about) {
        makeEditable(sc.querySelector('.about-lead'), 'about.lead', c.about.lead);
        makeEditable(sc.querySelector('.about-text'), 'about.body', c.about.body);
        const credSpans = sc.querySelectorAll('.about-credentials .credential span');
        if (Array.isArray(c.about.credentials)) {
            c.about.credentials.forEach((text, i) => {
                if (credSpans[i]) makeEditable(credSpans[i], `about.credentials.${i}`, text);
            });
        }
    }

    // --- SERVICES ---
    if (c.services) {
        [['discovery','service-discovery'],['oneMonth','service-1month'],['threeMonth','service-3month']].forEach(([key, id]) => {
            const svc = c.services[key];
            const card = sc.querySelector(`#${id}`);
            if (!svc || !card) return;
            makeEditable(card.querySelector('.service-title'), `services.${key}.title`, svc.title);
            makeEditable(card.querySelector('.service-desc'), `services.${key}.desc`, svc.desc);
            makeEditable(card.querySelector('.price-amount'), `services.${key}.price`, svc.price);
            const lis = card.querySelectorAll('.service-features li');
            if (Array.isArray(svc.features)) {
                svc.features.forEach((f, i) => { if (lis[i]) makeEditable(lis[i], `services.${key}.features.${i}`, f); });
            }
        });
    }

    // --- APPROACH ---
    if (Array.isArray(c.approach)) {
        c.approach.forEach((step, i) => {
            const card = sc.querySelector(`#step-${i + 1}`);
            if (!card) return;
            makeEditable(card.querySelector('h3'), `approach.${i}.title`, step.title);
            makeEditable(card.querySelector('p'), `approach.${i}.desc`, step.desc);
        });
    }

    // --- TESTIMONIALS ---
    if (Array.isArray(c.testimonials)) {
        const cards = sc.querySelectorAll('.testimonial-card');
        c.testimonials.forEach((t, i) => {
            if (!cards[i]) return;
            const textEl = cards[i].querySelector('.testimonial-text');
            if (textEl) makeEditable(textEl, `testimonials.${i}.text`, `"${t.text}"`);
            const nameEl = cards[i].querySelector('strong');
            if (nameEl) makeEditable(nameEl, `testimonials.${i}.name`, t.name);
            const tagEl = cards[i].querySelector('.testimonial-author span');
            if (tagEl) makeEditable(tagEl, `testimonials.${i}.tag`, t.tag);
            const avatarEl = cards[i].querySelector('.testimonial-avatar');
            if (avatarEl) makeEditable(avatarEl, `testimonials.${i}.initial`, t.initial);
        });
    }

    // --- BOOKING ---
    // Booking section text elements
    const bookingTitle = sc.querySelector('.booking-title');
    const bookingText = sc.querySelector('.booking-text');
    if (bookingTitle) makeEditable(bookingTitle, '_display.bookingTitle');
    if (bookingText) makeEditable(bookingText, '_display.bookingText');

    // --- FAQ ---
    const faqQuestions = sc.querySelectorAll('.faq-question');
    const faqAnswers = sc.querySelectorAll('.faq-answer p');
    faqQuestions.forEach((q, i) => makeEditable(q, `_display.faq.${i}.q`));
    faqAnswers.forEach((a, i) => makeEditable(a, `_display.faq.${i}.a`));

    // --- FOOTER ---
    if (c.footer) {
        const emailEl = sc.querySelector('a[href*="mailto"]');
        if (emailEl) { emailEl.textContent = c.footer.email; makeEditable(emailEl, 'footer.email', c.footer.email); }
        const phoneEl = sc.querySelector('.footer-contact a[href*="wa.me"]');
        if (phoneEl) { phoneEl.textContent = c.footer.phone; makeEditable(phoneEl, 'footer.phone', c.footer.phone); }
        const copyEl = sc.querySelector('.footer-bottom p');
        if (copyEl) { copyEl.textContent = c.footer.copyright; makeEditable(copyEl, 'footer.copyright', c.footer.copyright); }
    }

    // --- SECTION LABELS ---
    sc.querySelectorAll('.section-label').forEach(el => makeEditable(el, '_display.sectionLabel'));
    sc.querySelectorAll('.section-title').forEach(el => {
        // Don't re-mark hero title
        if (!el.closest('.hero')) makeEditable(el, '_display.sectionTitle');
    });
    sc.querySelectorAll('.section-subtitle').forEach(el => makeEditable(el, '_display.sectionSubtitle'));

    // Specialization cards
    sc.querySelectorAll('.spec-card').forEach((card, i) => {
        makeEditable(card.querySelector('.spec-title'), `_display.spec.${i}.title`);
        makeEditable(card.querySelector('.spec-desc'), `_display.spec.${i}.desc`);
    });

    // Philosophy cards
    sc.querySelectorAll('.philosophy-card').forEach((card, i) => {
        makeEditable(card.querySelector('h4'), `_display.phil.${i}.title`);
        makeEditable(card.querySelector('p'), `_display.phil.${i}.desc`);
    });
}

// ===========================
// MAKE EDITABLE — core helper
// ===========================
function makeEditable(el, dataPath, value) {
    if (!el) return;
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-editable', dataPath);
    if (value !== undefined) el.textContent = value;

    // Prevent Enter key from creating divs
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            el.blur();
        }
    });

    // On blur — stop editing indicator
    el.addEventListener('blur', () => {
        el.classList.remove('editing');
    });

    el.addEventListener('focus', () => {
        el.classList.add('editing');
    });
}

// ===========================
// COLLECT CONTENT FROM DOM
// ===========================
function collectContentFromDOM() {
    const sc = document.getElementById('siteContainer');
    if (!sc) return loadContent();

    const get = (path) => {
        const el = sc.querySelector(`[data-editable="${path}"]`);
        return el ? el.textContent.trim() : '';
    };

    const content = JSON.parse(JSON.stringify(DEFAULTS));

    // Hero
    content.hero.title = get('hero.title') || DEFAULTS.hero.title;
    content.hero.titleAccent = get('hero.titleAccent') || DEFAULTS.hero.titleAccent;
    content.hero.subtitle = get('hero.subtitle') || DEFAULTS.hero.subtitle;
    content.hero.stat1Num = get('hero.stat1Num') || DEFAULTS.hero.stat1Num;
    content.hero.stat1Label = get('hero.stat1Label') || DEFAULTS.hero.stat1Label;
    content.hero.stat2Num = get('hero.stat2Num') || DEFAULTS.hero.stat2Num;
    content.hero.stat2Label = get('hero.stat2Label') || DEFAULTS.hero.stat2Label;

    // About
    content.about.lead = get('about.lead') || DEFAULTS.about.lead;
    content.about.body = get('about.body') || DEFAULTS.about.body;
    content.about.credentials = DEFAULTS.about.credentials.map((def, i) => get(`about.credentials.${i}`) || def);

    // Services
    ['discovery', 'oneMonth', 'threeMonth'].forEach(key => {
        const def = DEFAULTS.services[key];
        content.services[key] = {
            title: get(`services.${key}.title`) || def.title,
            desc: get(`services.${key}.desc`) || def.desc,
            price: get(`services.${key}.price`) || def.price,
            features: def.features.map((f, i) => get(`services.${key}.features.${i}`) || f)
        };
    });

    // Approach
    content.approach = DEFAULTS.approach.map((def, i) => ({
        title: get(`approach.${i}.title`) || def.title,
        desc: get(`approach.${i}.desc`) || def.desc
    }));

    // Testimonials
    content.testimonials = DEFAULTS.testimonials.map((def, i) => {
        let text = get(`testimonials.${i}.text`) || def.text;
        // Strip surrounding quotes if present
        text = text.replace(/^[""]|[""]$/g, '').trim();
        return {
            initial: get(`testimonials.${i}.initial`) || def.initial,
            name: get(`testimonials.${i}.name`) || def.name,
            tag: get(`testimonials.${i}.tag`) || def.tag,
            text: text
        };
    });

    // Footer
    content.footer.email = get('footer.email') || DEFAULTS.footer.email;
    content.footer.phone = get('footer.phone') || DEFAULTS.footer.phone;
    content.footer.copyright = get('footer.copyright') || DEFAULTS.footer.copyright;

    // Keep booking from localStorage (not inline-editable easily)
    const saved = loadContent();
    content.booking = saved.booking || DEFAULTS.booking;

    return content;
}

// ===========================
// SAVE DRAFT (local only)
// ===========================
function saveDraft() {
    const content = collectContentFromDOM();
    saveContentLocal(content);
    showToast('💾 Draft saved locally!');
}

// ===========================
// PUBLISH (save to Supabase)
// ===========================
async function publishChanges() {
    const content = collectContentFromDOM();
    saveContentLocal(content);

    const btn = document.getElementById('publishBtn');
    btn.textContent = '⏳ Publishing…';
    btn.disabled = true;

    const ok = await saveToSupabase(content);

    btn.textContent = '🚀 Publish';
    btn.disabled = false;

    if (ok) {
        showToast('🚀 Published! Your live site is updated.');
    } else {
        showToast('⚠ Saved locally but cloud sync failed. Check connection.');
    }
}

// ===========================
// TOAST
// ===========================
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3500);
}
