
document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

    if (window.innerWidth > 767) {
        ScrollSmoother.create({
            smooth: 1,
            effects: true,
            smoothTouch: 0.1
        });
    }

    heroTitleAnimation();
    popInAnimation();
    initGlobalScrollAnimations();
    initFadeRightAnimations();
    initHowItWorksMobileScroll();
    initLazyVideos();
    initPrelaunchForm();
    initPremiumFormBottom();
    initPremiumFormHeader();
    initHowItWorksVideoModal();
    initPricingModal();
});


function initPricingModal() {
    const modal = document.getElementById('pricing-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.pricing-modal__overlay');
    const closeBtn = modal.querySelector('.pricing-modal__close');
    const triggers = document.querySelectorAll('.pricing');

    function openModal() {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    triggers.forEach(btn => btn.addEventListener('click', openModal));
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function initHowItWorksVideoModal() {
    const modal = document.getElementById('how-video-modal');
    if (!modal) return;

    const video = modal.querySelector('[data-modal-video]');
    if (!video) return;

    const overlay = modal.querySelector('.video-modal__overlay');
    const closeBtn = modal.querySelector('.video-modal__close');
    const triggers = document.querySelectorAll('button[aria-label="Watch how it works video"]');
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const desktopVideo = 'assets/video/Metemi-INTRO-wide_3.mp4';
    const mobileVideo = 'assets/video/Metemi-INTRO-story_3.mp4';
    const desktopPoster = 'assets/video/posters/Metemi-INTRO-wide_3.webp';
    const mobilePoster = 'assets/video/posters/Metemi-INTRO-story_3.webp';
    let lastFocusedElement = null;

    function getVideoSrc() {
        return mobileQuery.matches ? mobileVideo : desktopVideo;
    }

    function getPosterSrc() {
        return mobileQuery.matches ? mobilePoster : desktopPoster;
    }

    function openModal(trigger) {
        lastFocusedElement = trigger || document.activeElement;
        video.poster = getPosterSrc();
        video.src = getVideoSrc();
        video.load();
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn?.focus();
        video.play().catch(() => { });
    }

    function closeModal() {
        video.pause();
        video.removeAttribute('src');
        video.removeAttribute('poster');
        video.load();
        document.body.style.overflow = '';
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }

    triggers.forEach(btn => btn.addEventListener('click', () => openModal(btn)));
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
}


function initLazyVideos() {
    const videos = document.querySelectorAll('video:not([data-modal-video])');
    if (!videos.length) return; // Guard clause

    // Pre-bind requestAnimationFrame helper
    const rAF = window.requestAnimationFrame || ((cb) => setTimeout(cb, 1000 / 60));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Defer play to next frame to avoid jank
                rAF(() => entry.target.play().catch(() => { }));
            } else {
                rAF(() => entry.target.pause());
            }
        });
    }, { threshold: 0.1 }); // Lower threshold from 0.25 to 0.1 for faster discovery

    videos.forEach(video => {
        video.pause();
        observer.observe(video);
    });
}

function initGlobalScrollAnimations() {
    // Select meaningful elements that should fade up, excluding header-section and structural SVG elements
    const targets = document.querySelectorAll(`
        section:not(#header-section) h3,
        section:not(#header-section) h4,
        section:not(#header-section) h5,
        section:not(#header-section) p,
        section:not(#header-section) video,
        section:not(#header-section) form,
        section:not(#header-section) button,
        section:not(#header-section) img:not(.krakow-text):not(.metemi-text):not(.bg):not([anim-fade-right]),
        section:not(#header-section) .card,
        footer > div,
        footer > img:not(.bg)
    `);

    const parentDelays = new Map();

    targets.forEach(el => {
        // Skip elements with specific JS animations or hidden elements (display:none)
        if (el.closest('[anim-pop-in]') || el.hasAttribute('anim-pop-in') || el.closest('[data-how-mobile-isolated]')) {
            return;
        }
        if (getComputedStyle(el).display === 'none') {
            return;
        }

        // Stagger siblings sharing the same parent
        const parent = el.parentElement;
        const delay = parentDelays.get(parent) || 0;
        parentDelays.set(parent, delay + 0.13);

        const isVideo = el.tagName === 'VIDEO';

        gsap.fromTo(el,
            { y: 110, opacity: 0, scale: 0.82, rotation: isVideo ? 0 : 4 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 1.15,
                delay: delay,
                ease: "back.out(1.6)",
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}


function heroTitleAnimation() {
    const heroLogo = document.querySelector("[hero-logo]");
    const heroTitle = document.querySelector(".title-big");
    const subTitle = document.querySelector(".subtitle");
    const krakowTitle = document.querySelector(".main-title-krakow");
    const burger = document.querySelector(".burger-btn");
    const howButton = document.querySelector("#header-section .how-btn");

    // Split text for animations
    const logoSplit = new SplitText(heroLogo, {
        type: "words",
        wordsClass: "split-word",
    });

    const titleSplit = new SplitText(heroTitle, {
        type: "lines",
        linesClass: "split-line",
    });

    // Create master timeline
    const tl = gsap.timeline();

    // Logo animations (run simultaneously at position 0)
    tl.fromTo(
        heroLogo,
        { opacity: 0 },
        {
            opacity: 1.0,
            duration: 1.5,
            ease: "power4.inOut",
        },
        0
    ).fromTo(
        logoSplit.words,
        { letterSpacing: "0.4em" },
        {
            letterSpacing: "0em",
            duration: 1.5,
            ease: "power4.inOut",
        },
        0
    );

    tl.to(
        heroTitle,
        {
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
        },
        "-=0.95"
    ).from(
        titleSplit.lines,
        {
            duration: 0.9,
            y: "75%",
            opacity: 0,
            ease: "back.out",
            stagger: 0.1,
        },
        "<" // Start at the same time as the previous animation
    );

    tl.fromTo(
        subTitle,
        {
            y: 20,
            opacity: 0,
        },
        {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
        },
        "-=0.6"
    )

    tl.fromTo(
        krakowTitle,
        {
            y: 20,
            opacity: 0,
        },
        {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
        },
        "-=1"
    )

    tl.fromTo(
        burger,
        {
            x: -40,
            opacity: 0,
        },
        {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
        },
        "-=1"
    );

    tl.fromTo(
        howButton,
        {
            y: 44,
            opacity: 0,
            scale: 0.94,
        },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.75,
            ease: "back.out(1.8)",
            clearProps: "transform",
        },
        "-=0.6"
    );

    createWordSwitcher({
        selector: ".word-switcher",
        phrases: ["people", "groups"],
        delay: 1,
        splitType: "chars",
    });
}

// Generic word switcher animation that can be used with any element
function createWordSwitcher(config) {
    const {
        selector,
        phrases,
        delay = 1,
        splitType = "chars", // "chars" or "words"
    } = config;

    const element = document.querySelector(selector);
    if (!element || typeof SplitText === "undefined") {
        console.error(
            `SplitText plugin not loaded or element not found: ${selector}`
        );
        return;
    }

    let currentIndex = 0;
    let currentSplit = null;

    // Cache regex patterns outside the function closure for perf
    const mobilePatterns = [
        { find: /^(Meet people from )(.+)$/i, replace: "$1<br>$2" },
        { find: /^(Meet people )(at|in) (your .+)$/i, replace: "$1$2<br>$3" },
    ];

    // Function to format text with line breaks for mobile
    const formatTextForMobile = (text) => {
        if (window.innerWidth > 767) return text;

        for (let i = 0; i < mobilePatterns.length; i++) {
            const pattern = mobilePatterns[i];
            if (pattern.find.test(text)) {
                return text.replace(pattern.find, pattern.replace);
            }
        }
        return text;
    };

    // Initialize with first phrase
    const initialText = formatTextForMobile(phrases[currentIndex]);
    element.innerHTML = initialText;

    // Store initial dimensions to prevent layout shift
    const initialHeight = element.offsetHeight;
    element.style.minHeight = `${initialHeight}px`;

    currentSplit = new SplitText(element, { type: splitType });

    // Function to animate transition
    function animateSwitch() {
        const nextIndex = (currentIndex + 1) % phrases.length;
        const units =
            splitType === "chars" ? currentSplit.chars : currentSplit.words;

        // Animate out current units with stagger (randomized)
        gsap.to(units, {
            duration: 0.2,
            y: 30,
            opacity: 0,
            rotation: () => gsap.utils.random(-15, 15),
            scale: 0.5,
            ease: "back.in(2)",
            stagger: {
                each: 0.015,
                from: "random",
            },
            onComplete: () => {
                // Revert split and update text
                currentSplit.revert();
                const nextText = formatTextForMobile(phrases[nextIndex]);
                element.innerHTML = nextText;
                currentSplit = new SplitText(element, { type: splitType });

                const newUnits =
                    splitType === "chars" ? currentSplit.chars : currentSplit.words;

                // Set initial state for new units (coming from below)
                gsap.set(newUnits, {
                    y: 30,
                    opacity: 0,
                    rotation: () => gsap.utils.random(-15, 15),
                    scale: 0.5,
                });

                // Animate in new units with stagger (also randomized)
                gsap.to(newUnits, {
                    duration: 0.2,
                    y: 0,
                    opacity: 1,
                    rotation: 0,
                    scale: 1,
                    ease: "back.out(2)",
                    stagger: {
                        each: 0.015,
                        from: "random",
                    },
                    onComplete: () => {
                        currentIndex = nextIndex;
                        // Wait before next transition
                        gsap.delayedCall(delay, animateSwitch);
                    },
                });
            },
        });
    }

    // Start the animation cycle after initial delay
    gsap.delayedCall(delay, animateSwitch);
}

function popInAnimation() {
    const elements = document.querySelectorAll("[anim-pop-in]");

    elements.forEach((element) => {
        // Check if this is a dm-wrapper with a dm-gray or dm-red child
        const dmElement = element.querySelector(".dm-gray, .dm-red");
        const isDmMessage = Boolean(dmElement);

        // Set initial state
        const initRotation = isDmMessage ? 0 : gsap.utils.random(-18, 18);
        const initX = isDmMessage && dmElement.classList.contains("dm-gray") ? 54 : -18;
        gsap.set(element, {
            scale: isDmMessage ? 0.86 : 0,
            opacity: 0,
            x: initX,
            y: isDmMessage ? 58 : 80,
            rotation: initRotation,
        });

        // If it's a DM element, set initial blur to 0
        if (isDmMessage) {
            gsap.set(dmElement, {
                "--blur-amount": "0px",
            });
        }

        if (isDmMessage) {
            const delay = dmElement.classList.contains("dm-gray") ? 0.62 : 0;
            const tl = gsap.timeline({
                delay,
                scrollTrigger: {
                    trigger: element.closest(".dm-container") || element,
                    start: "top 85%",
                    end: "top 40%",
                    toggleActions: "play none none reverse",
                    markers: false,
                    onEnter: () => {
                        gsap.set(dmElement, { "--blur-amount": "0px" });
                    },
                    onLeaveBack: () => {
                        gsap.set(dmElement, { "--blur-amount": "0px" });
                    },
                },
            });

            tl.to(element, {
                duration: 0.62,
                scale: 1.04,
                opacity: 1,
                x: 0,
                y: -6,
                rotation: 0,
                ease: "power3.out",
            }).to(element, {
                duration: 0.26,
                scale: 1,
                y: 0,
                ease: "power2.out",
            }).to(dmElement, {
                "--blur-amount": "13px",
                duration: 0.38,
                ease: "power2.out",
            }, "-=0.06");

            return;
        }

        // Create the pop-in animation
        gsap.to(element, {
            duration: 2.2,
            scale: 1,
            opacity: 1,
            y: 0,
            rotation: 0,
            ease: "elastic.out(2.0,0.22)",
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                end: "top 40%",
                toggleActions: "play none none reverse",
                markers: false,
                onEnter: () => {
                    // Reset blur when entering
                    if (dmElement) {
                        gsap.set(dmElement, { "--blur-amount": "0px" });
                    }
                },
                onLeaveBack: () => {
                    // Reset blur when scrolling back up
                    if (dmElement) {
                        gsap.set(dmElement, { "--blur-amount": "0px" });
                    }
                },
            },
            onComplete: () => {
                // After pop-in completes, animate the blur in
                if (dmElement) {
                    gsap.to(dmElement, {
                        "--blur-amount": "13px",
                        duration: 0.6,
                        ease: "power2.inOut",
                    });
                }
            },
            onReverseComplete: () => {
                // Reset blur when animation reverses
                if (dmElement) {
                    gsap.set(dmElement, { "--blur-amount": "0px" });
                }
            },
        });
    });
}

function initFadeRightAnimations() {
    const elements = document.querySelectorAll('[anim-fade-right]');
    if (!elements.length) return;

    elements.forEach(el => {
        const startPos = el.dataset.start || 'top 80%';

        gsap.fromTo(el,
            { x: -200, opacity: 0, scale: 0.75, rotation: -10 },
            {
                x: 0,
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 1.5,
                ease: 'back.out(2.0)',
                scrollTrigger: {
                    trigger: el,
                    start: startPos,
                    toggleActions: 'play none none reverse',
                }
            }
        );
    });
}

function initHowItWorksMobileScroll() {
    if (window.innerWidth > 767) return;

    const container = document.getElementById('how-mobile-pin-container');
    if (!container) return;

    const cards = [
        container.querySelector('#how-mobile-card-1'),
        container.querySelector('#how-mobile-card-2'),
        container.querySelector('#how-mobile-card-3'),
    ].filter(Boolean);
    const buttons = [...container.querySelectorAll('[data-how-mobile-btn]')];
    const cardsWrapper = container.querySelector('.how-mobile-cards');

    if (!cards.length || !cardsWrapper) return;

    const OFFSET = 250;
    let current = 0;
    let animating = false;

    // Set initial positions – card 0 centred, others off to the right
    cards.forEach((card, idx) => {
        gsap.set(card, { xPercent: idx * OFFSET - 50 });
    });

    function goTo(idx) {
        if (idx === current && !animating) return;
        current = Math.max(0, Math.min(idx, cards.length - 1));
        animating = true;

        buttons.forEach((btn, i) => btn.classList.toggle('how-mobile-dot-active', i === current));

        const tl = gsap.timeline({ onComplete: () => { animating = false; } });
        cards.forEach((card, i) => {
            tl.to(card, {
                xPercent: (i - current) * OFFSET - 50,
                duration: 0.42,
                ease: 'power2.inOut',
            }, 0);
        });
    }

    // Dot buttons
    buttons.forEach((btn, idx) => btn.addEventListener('click', () => goTo(idx)));

    // Touch swipe (horizontal only, doesn't block vertical scroll)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLocked = false;

    cardsWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchLocked = false;
    }, { passive: true });

    cardsWrapper.addEventListener('touchmove', (e) => {
        if (touchLocked) return;
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        // Lock direction on first significant move
        if (dx > 8 || dy > 8) touchLocked = true;
    }, { passive: true });

    cardsWrapper.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Only react to clearly horizontal swipes
        if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 44) {
            goTo(current + (dx < 0 ? 1 : -1));
        }
    }, { passive: true });
}

function initPrelaunchForm() {
    const form = document.getElementById('prelaunch-form');
    if (!form) return;

    // Cache DOM queries outside the event listener
    const emailInput = form.querySelector('input[name="email"]');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;

        // Store form height to prevent layout shift
        const formHeight = form.offsetHeight;
        form.style.minHeight = `${formHeight}px`;

        // Disable the submit button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // Execute reCAPTCHA v3
            const token = await window.grecaptcha.execute('6Lfd_G0sAAAAAGg946QXAQI9IUmgbc7Lwy35BLl4', { action: 'prelaunch' });

            // Prepare form data
            const formData = new URLSearchParams();
            formData.append('email', email);
            formData.append('recaptcha_token', token);

            // Send POST request to API
            const response = await fetch('https://api.metemi.com/app/prelaunch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            if (response.ok) {
                // Success - replace form with thank you message
                gsap.to(form, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        const thankYouMessage = document.createElement('div');
                        thankYouMessage.className = 'thank-you-message text-center';
                        thankYouMessage.style.minHeight = `${formHeight}px`;
                        thankYouMessage.innerHTML = `
                            <p class="text-3xl font-semibold text-gradient">Thank you!</p>
                            <p class="text-xl text-gradient mt-4">You've been added to the early access list.</p>
                        `;

                        form.parentNode.replaceChild(thankYouMessage, form);

                        gsap.fromTo(thankYouMessage,
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                        );
                    }
                });
            } else {
                // Error from server
                console.error('Server error:', await response.text());
                alert('Something went wrong. Please try again later.');

                // Re-enable the submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe';
            }
        } catch (error) {
            // Network or other error
            console.error('Form submission error:', error);
            alert('Something went wrong. Please try again later.');

            // Re-enable the submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
        }
    });
}

function initPremiumFormHeader() {
    const form = document.getElementById('premium-form-header');
    if (!form) return;

    // Cache DOM queries outside the event listener
    const emailInput = form.querySelector('input[name="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const container = document.querySelector('.premium-form-header');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;

        // Store container height to prevent layout shift
        const containerHeight = container.offsetHeight;
        container.style.minHeight = `${containerHeight}px`;

        // Disable the submit button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // Execute reCAPTCHA v3
            const token = await window.grecaptcha.execute('6Lfd_G0sAAAAAGg946QXAQI9IUmgbc7Lwy35BLl4', { action: 'prelaunch' });

            // Prepare form data
            const formData = new URLSearchParams();
            formData.append('email', email);
            formData.append('recaptcha_token', token);

            // Send POST request to API
            const response = await fetch('https://api.metemi.com/app/prelaunch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            if (response.ok) {
                // Success - replace entire container content with thank you message
                gsap.to(container, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        container.innerHTML = `
                            <div class="thank-you-message text-center flex flex-col items-center justify-center" style="min-height: ${containerHeight}px">
                                <p class="text-3xl font-semibold text-gradient">Thank you!</p>
                                <p class="text-xl text-gradient mt-4">You've been added to the early access list.</p>
                            </div>
                        `;

                        gsap.fromTo(container,
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                        );
                    }
                });
            } else {
                // Error from server
                console.error('Server error:', await response.text());
                alert('Something went wrong. Please try again later.');

                // Re-enable the submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe';
            }
        } catch (error) {
            // Network or other error
            console.error('Form submission error:', error);
            alert('Something went wrong. Please try again later.');

            // Re-enable the submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
        }
    });
}

function initPremiumFormBottom() {
    const form = document.getElementById('premium-form-bottom');
    if (!form) return;

    // Cache DOM queries outside the event listener
    const emailInput = form.querySelector('input[name="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const container = document.querySelector('.premium-form-bottom');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;

        // Store container height to prevent layout shift
        const containerHeight = container.offsetHeight;
        container.style.minHeight = `${containerHeight}px`;

        // Disable the submit button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // Execute reCAPTCHA v3
            const token = await window.grecaptcha.execute('6Lfd_G0sAAAAAGg946QXAQI9IUmgbc7Lwy35BLl4', { action: 'prelaunch' });

            // Prepare form data
            const formData = new URLSearchParams();
            formData.append('email', email);
            formData.append('recaptcha_token', token);

            // Send POST request to API
            const response = await fetch('https://api.metemi.com/app/prelaunch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            if (response.ok) {
                // Success - replace entire container content with thank you message
                gsap.to(container, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        container.innerHTML = `
                            <div class="thank-you-message text-center flex flex-col items-center justify-center" style="min-height: ${containerHeight}px">
                                <p class="text-3xl font-semibold text-gradient">Thank you!</p>
                                <p class="text-xl text-gradient mt-4">You've been added to the early access list.</p>
                            </div>
                        `;

                        gsap.fromTo(container,
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                        );
                    }
                });
            } else {
                // Error from server
                console.error('Server error:', await response.text());
                alert('Something went wrong. Please try again later.');

                // Re-enable the submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe';
            }
        } catch (error) {
            // Network or other error
            console.error('Form submission error:', error);
            alert('Something went wrong. Please try again later.');

            // Re-enable the submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
        }
    });
}


