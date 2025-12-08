document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    // --- Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const nav = document.querySelector('.nav');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Animate hamburger to X (optional enhancement)
            navToggle.classList.toggle('active');
        });
    }

    // --- Close Mobile Menu on Link Click ---
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
        });
    });

    // --- Smart Header (Scrolled State) ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
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
                    const text = counter.innerText;
                    // Extract number and suffix (e.g., "36+" -> 36, "+")
                    const value = parseFloat(text.replace(/[^\d.]/g, ''));
                    const isInt = text.indexOf('.') === -1;
                    const suffix = text.replace(/[\d.]/g, ''); // "+", "★"

                    // Specific logic for rating to ensure 4.9 shows
                    const target = value;
                    let current = 0;
                    const duration = 2000; // 2 seconds
                    const stepTime = 20;
                    const steps = duration / stepTime;
                    const increment = target / steps;

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
