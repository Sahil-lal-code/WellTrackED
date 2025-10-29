document.addEventListener('DOMContentLoaded', function() {
    const themeSwitch = document.getElementById('theme-switch');
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply the saved theme
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeSwitch.checked = false;
    }
    
    // Theme switcher event listener
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
        
        // Force update UI elements that might not update automatically
        updateDarkModeElements();
    });
    
    // Function to update elements that need manual theme updating
    function updateDarkModeElements() {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Update message bubbles
        document.querySelectorAll('.message-bubble').forEach(bubble => {
            if (bubble.classList.contains('user-message')) {
                bubble.style.background = isDarkMode ? '#4a5568' : '#4361ee';
            } else {
                bubble.style.background = isDarkMode ? '#2d3748' : 'rgba(67, 97, 238, 0.1)';
                bubble.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(67, 97, 238, 0.2)';
            }
        });
        
        // Update input container
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            inputContainer.style.background = isDarkMode ? '#2d3748' : 'rgba(255, 255, 255, 0.15)';
            inputContainer.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.18)';
        }
        
        // Update quick actions
        document.querySelectorAll('.quick-action').forEach(action => {
            action.style.background = isDarkMode ? '#4a5568' : 'rgba(67, 97, 238, 0.1)';
            action.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(67, 97, 238, 0.2)';
        });
    }
    
    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeSwitch.checked = e.matches;
        localStorage.setItem('theme', newTheme);
        updateDarkModeElements();
    });
});