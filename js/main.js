document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobile Navigation
    // --- Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const nav = document.querySelector('.nav');
    const body = document.body;

    const closeMenu = () => {
        navMenu.classList.remove('active');
        if (navToggle) {
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
        body.classList.remove('nav-open');
    };

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
            body.classList.toggle('nav-open', isOpen);
        });
    }

    // --- Close Mobile Menu on Link Click ---
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // --- Close Mobile Menu on Escape ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // --- Smart Header (Scrolled State) ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = nav.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        });
    });

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add('visible'));
        return;
    }

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


    // --- Count-Up Animation for Trust Bar ---
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
});
