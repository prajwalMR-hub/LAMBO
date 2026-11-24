document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const runningAnimations = new Set();

    function playMotion(element, frames, options = {}) {
        if (!element || reducedMotion.matches) return;
        const animation = element.animate(frames, {
            duration: 700,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            ...options,
        });
        runningAnimations.add(animation);
        const cleanup = () => runningAnimations.delete(animation);
        animation.onfinish = cleanup;
        animation.oncancel = cleanup;
        return animation;
    }

    // =========================================================================
    // Preloader
    // =========================================================================
    const preloader = document.getElementById('preloader');
    const heroEntrance = document.querySelectorAll('.hero-content > *, .hero-stat');
    // Own the hero sequence so it starts after, not behind, the loader.
    heroEntrance.forEach(element => {
        element.removeAttribute('data-aos');
        element.removeAttribute('data-aos-delay');
    });
    let pageRevealed = false;
    function revealPage() {
        if (pageRevealed) return;
        pageRevealed = true;
        preloader.classList.add('hidden');
        heroEntrance.forEach((element, index) => playMotion(element, [
            { opacity: 0, transform: 'translateY(32px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 1000, delay: 200 + index * 110, fill: 'backwards' }));
    }
    window.addEventListener('load', () => setTimeout(revealPage, 400));
    // Remote media must never keep the page behind a loader.
    setTimeout(revealPage, reducedMotion.matches ? 0 : 1800);

    // =========================================================================
    // Custom Cursor
    // =========================================================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (window.matchMedia('(pointer: fine)').matches && cursorDot && cursorRing) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX - 3 + 'px';
            cursorDot.style.top = mouseY - 3 + 'px';
        });

        let ringFrame;
        function animateRing() {
            if (reducedMotion.matches || document.hidden) {
                ringFrame = null;
                return;
            }
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = ringX - 15 + 'px';
            cursorRing.style.top = ringY - 15 + 'px';
            ringFrame = requestAnimationFrame(animateRing);
        }
        function resumeRing() {
            if (!ringFrame) animateRing();
        }
        reducedMotion.addEventListener('change', resumeRing);
        document.addEventListener('visibilitychange', resumeRing);
        animateRing();

        // Hover effects for interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .gallery-item, .model-card, input, select, textarea');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
        });
    }

    // =========================================================================
    // Navbar Scroll Effect
    // =========================================================================
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // =========================================================================
    // Mobile Menu Toggle (Hamburger)
    // =========================================================================
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuIcon && navLinks) {
        mobileMenuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuIcon.classList.toggle('active');
        });

        // Close mobile menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuIcon.classList.remove('active');
            });
        });
    }

    // =========================================================================
    // Active Nav Link on Scroll
    // =========================================================================
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    function setActiveNav() {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navAnchors.forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === '#' + id) {
                        a.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', setActiveNav);

    // =========================================================================
    // Scroll progress and heading accents (no continuous scroll loop)
    // =========================================================================
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);
    let scrollFrame = 0;
    function updateProgress() {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
        progressBar.style.transform = `scaleX(${progress})`;
        scrollFrame = 0;
    }
    function scheduleProgress() {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
    }
    window.addEventListener('scroll', scheduleProgress, { passive: true });
    window.addEventListener('resize', scheduleProgress);
    new ResizeObserver(scheduleProgress).observe(document.body);
    updateProgress();

    const headingObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('accent-visible');
            headingObserver.unobserve(entry.target);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.section-title').forEach(title => headingObserver.observe(title));

    // =========================================================================
    // Hero Particles
    // =========================================================================
    const particlesContainer = document.getElementById('hero-particles');
    if (particlesContainer) {
        for (let i = 0; i < (finePointer.matches ? 24 : 10); i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 8 + 5) + 's';
            particle.style.animationDelay = (Math.random() * 5) + 's';
            particle.style.width = (Math.random() * 3 + 1) + 'px';
            particle.style.height = particle.style.width;
            particlesContainer.appendChild(particle);
        }
    }

    // Pause decorative media offscreen and honor live motion preference changes.
    const hero = document.getElementById('hero');
    const heroVideo = document.querySelector('.hero-video');
    let heroVisible = true;
    function syncAmbientMotion() {
        const paused = reducedMotion.matches || document.hidden || !heroVisible;
        hero.classList.toggle('motion-paused', paused);
        if (heroVideo) {
            if (paused) heroVideo.pause();
            else heroVideo.play().catch(() => { /* Poster remains when autoplay is blocked. */ });
        }
        if (reducedMotion.matches) {
            runningAnimations.forEach(animation => animation.cancel());
            revealPage();
        }
    }
    new IntersectionObserver(entries => {
        heroVisible = entries[0].isIntersecting;
        syncAmbientMotion();
    }).observe(hero);
    reducedMotion.addEventListener('change', syncAmbientMotion);
    document.addEventListener('visibilitychange', syncAmbientMotion);
    syncAmbientMotion();

    // =========================================================================
    // AOS — Animate On Scroll Init
    // =========================================================================
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            disable: () => reducedMotion.matches,
        });
    } else {
        // Keep content readable if the animation CDN is unavailable.
        document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
    }

    // =========================================================================
    // Performance Counters (with Intersection Observer)
    // =========================================================================
    let countersStarted = false;

    function startCounters() {
        if (countersStarted) return;
        countersStarted = true;

        const statNumbers = document.querySelectorAll('.stat-number');
        const statDecimals = document.querySelectorAll('.stat-number-decimal');

        statNumbers.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = reducedMotion.matches ? 1 : Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.innerText = Math.ceil(eased * target);
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            }
            requestAnimationFrame(updateCounter);
        });

        statDecimals.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = reducedMotion.matches ? 1 : Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.innerText = (eased * target).toFixed(1);
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target.toFixed(1);
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    const performanceSection = document.getElementById('performance');
    if (performanceSection) {
        const perfObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounters();
                    perfObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        perfObserver.observe(performanceSection);
    }

    // =========================================================================
    // Pointer-driven depth; rotate is independent of AOS's reveal transform.
    // =========================================================================
    const tiltCards = document.querySelectorAll('.model-card');
    tiltCards.forEach(card => {
        let frame = 0;
        let pointerX = 0, pointerY = 0;
        function resetTilt() {
            cancelAnimationFrame(frame);
            frame = 0;
            card.style.removeProperty('--tilt-x');
            card.style.removeProperty('--tilt-y');
        }
        card.addEventListener('pointermove', event => {
            if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
            pointerX = event.clientX;
            pointerY = event.clientY;
            if (frame) return;
            frame = requestAnimationFrame(() => {
                const bounds = card.getBoundingClientRect();
                card.style.setProperty('--tilt-x', `${((pointerY - bounds.top) / bounds.height - 0.5) * -5}deg`);
                card.style.setProperty('--tilt-y', `${((pointerX - bounds.left) / bounds.width - 0.5) * 7}deg`);
                frame = 0;
            });
        });
        card.addEventListener('pointerleave', resetTilt);
        card.addEventListener('pointercancel', resetTilt);
        reducedMotion.addEventListener('change', resetTilt);
        finePointer.addEventListener('change', resetTilt);
    });

    // =========================================================================
    // Gallery Filter
    // =========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            let visibleIndex = 0;
            galleryItems.forEach(item => {
                item.getAnimations().forEach(animation => animation.cancel());
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                    item.classList.add('aos-animate');
                    playMotion(item, [
                        { opacity: 0, scale: '0.94', translate: '0 18px' },
                        { opacity: 1, scale: '1', translate: '0 0' },
                    ], { delay: visibleIndex++ * 55, fill: 'backwards' });
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
        });
    });

    // =========================================================================
    // Gallery Lightbox
    // =========================================================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentLightboxIndex = 0;

    function getVisibleGalleryItems() {
        return Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
    }

    function openLightbox(index) {
        const visible = getVisibleGalleryItems();
        if (index < 0 || index >= visible.length) return;

        currentLightboxIndex = index;
        const img = visible[index].querySelector('img');
        const caption = visible[index].querySelector('.gallery-item-overlay span');

        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption ? caption.textContent : '';
        lightboxImg.getAnimations().forEach(animation => animation.cancel());
        playMotion(lightboxImg, [
            { opacity: 0, transform: 'scale(0.96) translateY(12px)' },
            { opacity: 1, transform: 'scale(1) translateY(0)' },
        ]);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const visible = getVisibleGalleryItems();
            const visibleIndex = visible.indexOf(item);
            openLightbox(visibleIndex);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            const visible = getVisibleGalleryItems();
            currentLightboxIndex = (currentLightboxIndex - 1 + visible.length) % visible.length;
            openLightbox(currentLightboxIndex);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            const visible = getVisibleGalleryItems();
            currentLightboxIndex = (currentLightboxIndex + 1) % visible.length;
            openLightbox(currentLightboxIndex);
        });
    }

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
    });

    // Close lightbox on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // =========================================================================
    // Form Validation & Submission
    // =========================================================================
    const bookingForm = document.getElementById('booking-form');
    const formStatus = document.getElementById('form-status');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const model = document.getElementById('model-select').value;

            if (name && email && phone && model) {
                const submitBtn = bookingForm.querySelector('button[type="submit"]');
                const originalHTML = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    formStatus.textContent = '✓ Thank you! Your request has been received. Our concierge will contact you shortly.';
                    formStatus.className = 'form-status success';
                    bookingForm.reset();

                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;

                    setTimeout(() => {
                        formStatus.style.display = 'none';
                        formStatus.className = 'form-status';
                    }, 5000);
                }, 1800);
            }
        });
    }

    // =========================================================================
    // Newsletter Form
    // =========================================================================
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterStatus = newsletterForm ? newsletterForm.querySelector('.form-status') : null;
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            const btn = newsletterForm.querySelector('button');

            if (input.value && newsletterStatus) {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btn.disabled = true;

                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.disabled = false;
                    newsletterStatus.textContent = '✓ Thank you for subscribing! Updates are on their way.';
                    newsletterStatus.className = 'form-status success';
                    input.value = '';

                    setTimeout(() => {
                        newsletterStatus.style.display = 'none';
                        newsletterStatus.className = 'form-status';
                    }, 5000);
                }, 1200);
            }
        });
    }

    // =========================================================================
    // Back to Top Button
    // =========================================================================
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        });
    }

    // =========================================================================
    // Smooth scroll for all anchor links
    // =========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.getElementById(targetId.slice(1));
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
            }
        });
    });
});
