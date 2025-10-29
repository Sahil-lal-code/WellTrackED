// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBRbHMH-xH2MpAaGfeqOmYFdnibe4SuSLo",
    authDomain: "welltracked-708a4.firebaseapp.com",
    projectId: "welltracked-708a4",
    storageBucket: "welltracked-708a4.firebasestorage.app",
    messagingSenderId: "164432154571",
    appId: "1:164432154571:web:59b85e896d2da317bcf04e",
    measurementId: "G-K95WMYP4GC"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase initialized');

// Form Switching
document.getElementById('switch-to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signin-form').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
});

document.getElementById('switch-to-signin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('signin-form').classList.add('active');
});

// Password Toggle
document.getElementById('toggle-signin-password').addEventListener('click', function() {
    const input = document.getElementById('signin-password');
    const icon = this.querySelector('i');
    togglePassword(input, icon);
});

document.getElementById('toggle-signup-password').addEventListener('click', function() {
    const input = document.getElementById('signup-password');
    const icon = this.querySelector('i');
    togglePassword(input, icon);
});

function togglePassword(input, icon) {
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Show Alert Function
function showAlert(message, type = 'error') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) existingAlert.remove();

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
    
    const activeForm = document.querySelector('.auth-form.active');
    activeForm.insertBefore(alertDiv, activeForm.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

// Loading State
function setLoading(button, isLoading) {
    const text = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        button.disabled = true;
        text.style.opacity = '0';
        loader.style.display = 'block';
    } else {
        button.disabled = false;
        text.style.opacity = '1';
        loader.style.display = 'none';
    }
}

// Sign Up
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🚀 Signup started...');
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const parentEmail = document.getElementById('parent-email').value;
    const button = document.getElementById('signup-btn');

    // Basic validation
    if (!email || !password || !parentEmail) {
        showAlert('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters');
        return;
    }

    setLoading(button, true);

    try {
        console.log('Creating user...');
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('User created:', user.uid);
        
        // Save to Firestore
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            parentEmail: parentEmail,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            safetyAlertsEnabled: true
        });
        
        console.log('User data saved to Firestore');
        showAlert('Account created successfully! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Signup error:', error);
        let message = 'Signup failed. Please try again.';
        
        if (error.code === 'auth/email-already-in-use') {
            message = 'Email already exists. Please sign in.';
        } else if (error.code === 'auth/weak-password') {
            message = 'Password is too weak.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email address.';
        }
        
        showAlert(message);
    } finally {
        setLoading(button, false);
    }
});

// Sign In
document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const button = document.getElementById('signin-btn');

    if (!email || !password) {
        showAlert('Please fill in all fields');
        return;
    }

    setLoading(button, true);

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showAlert('Signed in successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signin error:', error);
        let message = 'Sign in failed. Please try again.';
        
        if (error.code === 'auth/user-not-found') {
            message = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Incorrect password.';
        }
        
        showAlert(message);
    } finally {
        setLoading(button, false);
    }
});

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('auth.html')) {
        window.location.href = 'index.html';
    }
});

console.log('✅ Auth system ready');