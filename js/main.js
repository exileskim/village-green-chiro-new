document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const nav = document.querySelector('.nav');
    const body = document.body;

    const focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    let focusTrapEnabled = false;
    let restoreFocusTo = null;

    const getFocusableElements = (container) => {
        if (!container) return [];
        return Array.from(container.querySelectorAll(focusableSelector)).filter((el) => {
            const ariaHidden = el.getAttribute('aria-hidden');
            return !el.hasAttribute('disabled') && ariaHidden !== 'true';
        });
    };

    const onMenuKeydown = (e) => {
        if (!focusTrapEnabled || !navMenu?.classList.contains('active')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeMenu();
            return;
        }

        if (e.key !== 'Tab') return;

        const focusableElements = getFocusableElements(nav);
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
            return;
        }

        if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    const setMenuOpen = (isOpen) => {
        if (!navToggle || !navMenu) return;

        navMenu.classList.toggle('active', isOpen);
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        body.classList.toggle('nav-open', isOpen);

        const mobileCta = document.querySelector('.mobile-cta');
        if (mobileCta) {
            if (isOpen) {
                mobileCta.setAttribute('aria-hidden', 'true');
                mobileCta.setAttribute('inert', '');
            } else {
                mobileCta.removeAttribute('aria-hidden');
                mobileCta.removeAttribute('inert');
            }
        }

        if (isOpen) {
            restoreFocusTo = document.activeElement;
            focusTrapEnabled = true;
            document.addEventListener('keydown', onMenuKeydown);

            const firstMenuLink = navMenu.querySelector('a');
            if (firstMenuLink instanceof HTMLElement) {
                firstMenuLink.focus();
            }
            return;
        }

        focusTrapEnabled = false;
        document.removeEventListener('keydown', onMenuKeydown);
        if (restoreFocusTo instanceof HTMLElement) {
            restoreFocusTo.focus();
        }
        restoreFocusTo = null;
    };

    const closeMenu = () => setMenuOpen(false);

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            setMenuOpen(!navMenu.classList.contains('active'));
        });
    }

    // --- Close Mobile Menu on Link Click ---
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // --- Close Mobile Menu When Switching to Desktop ---
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    if (typeof desktopQuery.addEventListener === 'function') {
        desktopQuery.addEventListener('change', (e) => {
            if (e.matches) closeMenu();
        });
    } else {
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 769) closeMenu();
        }, { passive: true });
    }

    // --- Scroll State + Scrollspy ---
    const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]')).filter((link) => {
        const href = link.getAttribute('href');
        return href && href !== '#';
    });

    const sections = navLinks
        .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
        .filter(Boolean);

    const setActiveNavLink = (id) => {
        navLinks.forEach((link) => link.removeAttribute('aria-current'));
        if (!id) return;

        const activeLink = navLinks.find((link) => link.getAttribute('href') === `#${id}`);
        if (activeLink) activeLink.setAttribute('aria-current', 'location');
    };

    const updateScrollSpy = () => {
        if (!nav || sections.length === 0) return;

        const y = window.scrollY + nav.offsetHeight + 8;
        if (y < sections[0].offsetTop) {
            setActiveNavLink(null);
            return;
        }

        let currentSection = sections[0];
        for (const section of sections) {
            if (section.offsetTop <= y) currentSection = section;
        }

        setActiveNavLink(currentSection.id);
    };

    let scrollTicking = false;
    const onScroll = () => {
        if (scrollTicking) return;
        scrollTicking = true;

        window.requestAnimationFrame(() => {
            if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
            updateScrollSpy();
            scrollTicking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement && nav) {
                e.preventDefault();
                const headerOffset = nav.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: targetId === '#main-content' ? 'auto' : (prefersReducedMotion ? 'auto' : 'smooth')
                });

                if (targetId === '#main-content' && targetElement instanceof HTMLElement) {
                    targetElement.focus({ preventScroll: true });
                }
            }
        });
    });

    // --- Correct Offset When Landing on a Hash URL ---
    if (window.location.hash && nav) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            window.requestAnimationFrame(() => {
                const headerOffset = nav.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'auto' });
            });
        }
    }

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Reveal only once
                }
            });
        }, {
            root: null,
            threshold: 0.15, // Trigger when 15% visible
            rootMargin: "0px"
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- Count-Up Animation for Trust Bar ---
    if (!prefersReducedMotion) {
        const trustNumbers = document.querySelectorAll('.trust-number');
        let hasCounted = false;

        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasCounted) {
                    hasCounted = true;
                    trustNumbers.forEach(counter => {
                        const text = counter.dataset.target || counter.innerText;
                        // Extract number and suffix (e.g., "36+" -> 36, "+")
                        const value = parseFloat(text.replace(/[^\d.]/g, ''));
                        if (Number.isNaN(value)) return;
                        const isInt = text.indexOf('.') === -1;
                        const suffix = text.replace(/[\d.]/g, ''); // "+", "★"

                        // Specific logic for rating to ensure 4.9 shows
                        const target = value;
                        let current = 0;
                        const duration = 2000; // 2 seconds
                        const stepTime = 20;
                        const steps = duration / stepTime;
                        const increment = target / steps;

                        // Set starting value for animation
                        counter.innerText = (isInt ? '0' : '0.0') + suffix;

                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                clearInterval(timer);
                                current = target;
                            }

                            // Format output
                            let displayVal;
                            if (isInt && Number.isInteger(target)) {
                                displayVal = Math.floor(current);
                            } else {
                                displayVal = current.toFixed(1);
                            }

                            counter.innerText = displayVal + suffix;
                        }, stepTime);
                    });
                }
            });
        }, { threshold: 0.5 });

        const trustBar = document.querySelector('.trust-bar');
        if (trustBar) {
            countObserver.observe(trustBar);
        }
    }
});
