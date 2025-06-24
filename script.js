// Global Variables
let particles = [];
let canvas, ctx;
let mouseX = 0, mouseY = 0;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initNavigation();
    initTypewriter();
    initScrollAnimations();
    initFloatingGenie();
    initSkillBars();
});

// Particle System
function initParticles() {
    canvas = document.getElementById('particlesCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    createParticles();
    animateParticles();
    
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', updateMouse);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticles() {
    particles = [];
    const particleCount = Math.min(100, window.innerWidth / 10);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: Math.random() > 0.5 ? '#00d4ff' : '#a855f7'
        });
    }
}

function updateMouse(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary collision
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Mouse interaction
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            particle.x -= dx * 0.001;
            particle.y -= dy * 0.001;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
    });
    
    // Draw connections
    particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - distance / 80)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
    });
    
    requestAnimationFrame(animateParticles);
}

// Navigation
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            navMenu.classList.remove('active');
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });
}

// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 80; // Account for navbar height
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Typewriter Effect
function initTypewriter() {
    const typewriter = document.getElementById('typewriter');
    const text = 'Developer. Dreamer. Doer.';
    let index = 0;
    let isDeleting = false;
    let currentText = '';
    
    function type() {
        if (!isDeleting && index <= text.length) {
            currentText = text.substring(0, index);
            typewriter.textContent = currentText;
            index++;
            setTimeout(type, 100);
        } else if (isDeleting && index >= 0) {
            currentText = text.substring(0, index);
            typewriter.textContent = currentText;
            index--;
            setTimeout(type, 50);
        } else if (!isDeleting && index > text.length) {
            setTimeout(() => {
                isDeleting = true;
                type();
            }, 2000);
        } else if (isDeleting && index < 0) {
            setTimeout(() => {
                isDeleting = false;
                type();
            }, 500);
        }
    }
    
    setTimeout(type, 1000);
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Animate skill bars when skills section is visible
                if (entry.target.classList.contains('skills')) {
                    animateSkillBars();
                }
                
                // Animate timeline items
                if (entry.target.classList.contains('timeline-item')) {
                    entry.target.style.animationDelay = `${Array.from(entry.target.parentNode.children).indexOf(entry.target) * 0.2}s`;
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.timeline-item, .project-card, .skill-category, .gallery-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });
    
    // Observe skills section
    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        observer.observe(skillsSection);
    }
}

// Floating Genie Animation
function initFloatingGenie() {
    const genie = document.getElementById('floatingGenie');
    let isHovered = false;
    
    // Add click interaction
    genie.addEventListener('click', () => {
        // Create sparkle effect
        createSparkles(genie);
        
        // Random motivational messages
        const messages = [
            "Keep coding! 💻",
            "Dream big! ✨",
            "Never give up! 🚀",
            "You're awesome! ⭐",
            "Build the future! 🌟"
        ];
        
        showMessage(messages[Math.floor(Math.random() * messages.length)]);
    });
    
    // Hover effects
    genie.addEventListener('mouseenter', () => {
        isHovered = true;
        genie.style.animationPlayState = 'paused';
        genie.style.transform = 'scale(1.2)';
        genie.style.cursor = 'pointer';
        genie.style.filter = 'brightness(1.5)';
    });
    
    genie.addEventListener('mouseleave', () => {
        isHovered = false;
        genie.style.animationPlayState = 'running';
        genie.style.transform = 'scale(1)';
        genie.style.filter = 'brightness(1)';
    });
}

function createSparkles(element) {
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = '#00d4ff';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1001';
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
        sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
        
        document.body.appendChild(sparkle);
        
        // Animate sparkle
        sparkle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => sparkle.remove();
    }
}

function showMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(0, 212, 255, 0.9)';
    message.style.color = 'white';
    message.style.padding = '1rem 2rem';
    message.style.borderRadius = '2rem';
    message.style.fontSize = '1.2rem';
    message.style.fontWeight = 'bold';
    message.style.zIndex = '2000';
    message.style.pointerEvents = 'none';
    message.style.fontFamily = 'Orbitron, monospace';
    
    document.body.appendChild(message);
    
    // Animate message
    message.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' }
    ], {
        duration: 3000,
        easing: 'ease-in-out'
    }).onfinish = () => message.remove();
}

// Skill Bars Animation
function initSkillBars() {
    // This will be called when the skills section is visible
}

function animateSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');
    skillFills.forEach((fill, index) => {
        setTimeout(() => {
            const width = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = width;
            }, 100);
        }, index * 200);
    });
}

// Form Interactions
function initForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add form submission logic here
            showNotification('Message sent successfully!', 'success');
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '2rem';
    notification.style.right = '2rem';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.color = 'white';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '2000';
    notification.textContent = message;
    
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #00ff88, #44ff88)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #ff4444, #ff6666)';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #00d4ff, #0099cc)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    notification.animate([
        { transform: 'translateX(100%)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.animate([
            { transform: 'translateX(0)', opacity: 1 },
            { transform: 'translateX(100%)', opacity: 0 }
        ], {
            duration: 300,
            easing: 'ease-in'
        }).onfinish = () => notification.remove();
    }, 3000);
}

// Parallax Effect
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Project Card Interactions
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) rotateX(5deg)';
            card.style.boxShadow = '0 30px 60px rgba(0, 212, 255, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateX(0deg)';
            card.style.boxShadow = 'none';
        });
    });
}

// Gallery Lightbox
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Add lightbox functionality here
            showNotification('Gallery feature coming soon!', 'info');
        });
    });
}

// Social Links Tracking
function initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-card, .link-card');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Add analytics tracking here
            console.log('Social link clicked:', link.textContent.trim());
        });
    });
}

// Performance Optimization
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Reduce particle count on mobile
    if (window.innerWidth < 768) {
        particles = particles.slice(0, 30);
    }
}

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initForms();
    initParallax();
    initProjectCards();
    initGallery();
    initSocialLinks();
    optimizePerformance();
});

// Window resize handler
window.addEventListener('resize', () => {
    // Recreate particles on resize
    createParticles();
    
    // Adjust genie size on mobile
    const genie = document.getElementById('floatingGenie');
    if (window.innerWidth < 768) {
        genie.style.width = '60px';
        genie.style.height = '60px';
    } else {
        genie.style.width = '80px';
        genie.style.height = '80px';
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const sections = document.querySelectorAll('section');
        const currentSection = getCurrentSection();
        const nextSection = sections[currentSection + 1];
        if (nextSection) {
            scrollToSection(nextSection.id);
        }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const sections = document.querySelectorAll('section');
        const currentSection = getCurrentSection();
        const prevSection = sections[currentSection - 1];
        if (prevSection) {
            scrollToSection(prevSection.id);
        }
    }
});

function getCurrentSection() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;
    
    for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollPosition) {
            return i;
        }
    }
    return 0;
}

// Easter eggs
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        // Easter egg activated!
        document.body.style.filter = 'hue-rotate(180deg)';
        showMessage('🎉 Secret mode activated! 🎉');
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 5000);
        konamiCode = [];
    }
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}