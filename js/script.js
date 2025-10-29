document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // About modal functionality
    const aboutBtn = document.getElementById('about-btn');
    const modal = document.getElementById('about-modal');
    const closeBtn = document.querySelector('.close-modal');

    aboutBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Update daily quote
    const quotes = [
        "The only way to learn mathematics is to do mathematics. — Paul Halmos",
        "Physics is really nothing more than a search for ultimate simplicity. — Bill Bryson",
        "Take care of your mental health; it's the foundation for everything else. — Unknown",
        "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
        "You don't have to be perfect to be amazing. — Unknown",
        "The expert in anything was once a beginner. — Helen Hayes"
    ];

    const quoteElement = document.querySelector('.daily-quote');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElement.textContent = randomQuote;

    // Card hover effects
    const cards = document.querySelectorAll('.chatbot-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.querySelector('.card-pulse').style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', () => {
            card.querySelector('.card-pulse').style.opacity = '0';
        });
    });

    // Theme switcher functionality with localStorage
    const themeSwitch = document.getElementById('theme-switch');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }

    // Theme switcher
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });
});