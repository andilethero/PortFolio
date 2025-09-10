document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

    // --- Project Info Toggle & Animation ---
    let currentAnimation = null; // To track the current GSAP animation

    document.querySelectorAll('.item-label[data-target]').forEach(label => {
        label.addEventListener('click', () => {
            const targetId = label.getAttribute('data-target');
            const infoBox = document.getElementById(targetId);

            // Close any currently open info box
            document.querySelectorAll('.project-info.active').forEach(openBox => {
                if (openBox !== infoBox) {
                    openBox.classList.remove('active');
                }
            });

            // Toggle the clicked one
            infoBox.classList.toggle('active');

            // If it was opened, start the typewriter animation
            if (infoBox.classList.contains('active')) {
                const textContainer = infoBox.querySelector('.info-text');
                const fullText = infoBox.querySelector('.hidden-text').textContent;
                
                // Kill any previous animation on this element
                if (textContainer.gsapAnimation) {
                    textContainer.gsapAnimation.kill();
                }

                // Animate
                textContainer.textContent = ''; // Clear previous text
                textContainer.gsapAnimation = gsap.to(textContainer, {
                    duration: 2,
                    text: fullText,
                    ease: "none"
                });
            }
        });
    });

    // --- Projects Section Reveal on Scroll ---
    const projectRevealTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".projects-section",
            start: "top 75%",
            toggleActions: "play none none none",
        }
    });

    projectRevealTl.from(".project-item", {
        duration: 0.8,
        opacity: 0,
        y: 25,
        stagger: 0.2,
        ease: "power3.out",
    });

    // --- "Click Me" Hint Animation ---
    projectRevealTl.to(".click-me-prompt", {
        keyframes: [
            { opacity: 1, duration: 0.7 },
            { opacity: 0, duration: 0.7 },
            { opacity: 1, duration: 0.7 },
            { opacity: 0, duration: 0.7 },
            { opacity: 1, duration: 0.7 },
            { opacity: 0, duration: 0.7 }
        ],
        ease: "power1.inOut",
    }, ">0.5"); // Starts 0.5s after the last item has revealed

    const checkpoints = [
        { selector: '.container' },
        { selector: '.about-section' },
        { selector: '.projects-section' },
        { selector: '.contact-section' }
    ];

    function getSectionOffsets() {
        return checkpoints.map(cp => {
            const sec = document.querySelector(cp.selector);
            return sec ? sec.getBoundingClientRect().top + window.scrollY : 0;
        });
    }

    // --- Click-to-scroll functionality ---
    const checkpointElements = document.querySelectorAll('.compass-checkpoint');
    checkpointElements.forEach((checkpoint, index) => {
        checkpoint.addEventListener('click', () => {
            gsap.to(window, {
                duration: 1.5,
                scrollTo: {
                    y: checkpoints[index].selector,
                    offsetY: 20 // Small offset from the top
                },
                ease: "power2.inOut"
            });
        });
    });

    // --- Scroll-based compass update ---
    function updateCompassOnScroll() {
        const offsets = getSectionOffsets();
        const scroll = window.scrollY + window.innerHeight / 2;
        let activeIdx = 0;
        let percent = 0;

        if (scroll <= offsets[0]) {
            percent = 0;
        } else if (scroll >= offsets[offsets.length - 1]) {
            percent = 100;
            activeIdx = checkpoints.length - 1;
        } else {
            for (let i = 0; i < offsets.length - 1; i++) {
                if (scroll >= offsets[i] && scroll < offsets[i + 1]) {
                    activeIdx = i;
                    const sectionSpan = offsets[i + 1] - offsets[i];
                    const sectionScroll = scroll - offsets[i];
                    percent = (i + sectionScroll / sectionSpan) * (100 / (checkpoints.length - 1));
                    break;
                }
            }
        }
        
        window.requestAnimationFrame(() => {
            const tick = document.getElementById('compass-tick');
            tick.style.top = `calc(${percent}% - 2px)`;

            const labels = document.querySelectorAll('.compass-label');
            checkpointsEls.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
            labels.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
        });
    }

    const checkpointsEls = document.querySelectorAll('.compass-checkpoint');
    window.addEventListener('scroll', updateCompassOnScroll);
    window.addEventListener('resize', updateCompassOnScroll);
    updateCompassOnScroll(); // Initial call

    // --- Dark Section Color Change for Compass ---
    const darkSections = document.querySelectorAll('.projects-section, .resume-left');
    darkSections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: self => {
                if (self.isActive) {
                    document.getElementById('compass').classList.add('is-on-dark');
                } else {
                    document.getElementById('compass').classList.remove('is-on-dark');
                }
            }
        });
    });

    // Resume section interactivity
    const resumeLinks = document.querySelectorAll('.resume-link');
    const resumeDetails = {
      education: document.getElementById('resume-education'),
      experience: document.getElementById('resume-experience'),
      certifications: document.getElementById('resume-certifications')
    };
    const resumeTitle = document.getElementById('resume-title');
    const resumeNumber = document.querySelector('.resume-number');

    const titles = {
      education: 'Education',
      experience: 'Experience',
      certifications: 'Certifications'
    };
    const numbers = {
      education: '1',
      experience: '2',
      certifications: '3'
    };

    resumeLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const type = link.getAttribute('href').replace('#', '');

        // Highlight active link
        resumeLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Fade out all details
        Object.values(resumeDetails).forEach(detail => {
          if (detail.style.display !== 'none') {
            gsap.to(detail, { opacity: 0, duration: 0.3, onComplete: () => { detail.style.display = 'none'; } });
          }
        });

        // Fade in selected details
        const showDetail = resumeDetails[type];
        if (showDetail) {
          resumeTitle.textContent = titles[type];
          resumeNumber.textContent = numbers[type];
          setTimeout(() => {
            showDetail.style.display = '';
            const paragraphs = showDetail.querySelectorAll('p');
            gsap.set(paragraphs, { opacity: 0, x: 60 });
            gsap.fromTo(showDetail, { opacity: 0, x: 60 }, {
              opacity: 1, x: 0, duration: 0.5, ease: 'power2.out',
              onComplete: () => {
                gsap.to(paragraphs, {
                  opacity: 1,
                  x: 0,
                  duration: 0.9,
                  ease: 'power2.out',
                  stagger: 0.18
                });
              }
            });
          }, 300);
        }
      });
    });
});
 
