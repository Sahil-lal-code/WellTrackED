// js/mental.js - COMPLETELY FIXED VERSION
console.log('🧠 MENTAL.JS LOADED SUCCESSFULLY!');

let currentMood = 'neutral';
let isWaiting = false;
const API_BASE_URL = 'https://studybuddy-backend-bvio.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Mental DOM loaded - Initializing chat');
    
    // DOM elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const exportPdfBtn = document.getElementById('export-pdf');
    const moodBtn = document.getElementById('mood-btn');
    const moodSelector = document.getElementById('mood-selector');
    const quickActions = document.querySelectorAll('.quick-action');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiContainer = document.getElementById('emoji-container');

    // Validate essential elements
    if (!chatMessages || !userInput || !sendBtn) {
        console.error('❌ Critical elements missing!');
        console.error('chatMessages:', chatMessages);
        console.error('userInput:', userInput);
        console.error('sendBtn:', sendBtn);
        return;
    }

    console.log('✅ All DOM elements found');

    // Event listeners
    sendBtn.addEventListener('click', processAndSendMessage);
    console.log('✅ Send button listener attached');

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processAndSendMessage();
        }
    });
    console.log('✅ Input keypress listener attached');

    // Mood selector toggle
    if (moodBtn && moodSelector) {
        moodBtn.addEventListener('click', () => {
            moodSelector.style.display = moodSelector.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Mood selection
    document.querySelectorAll('.mood-option').forEach(option => {
        option.addEventListener('click', function() {
            currentMood = this.getAttribute('data-mood');
            document.querySelectorAll('.mood-option').forEach(opt => 
                opt.classList.remove('selected')
            );
            this.classList.add('selected');
            if (moodSelector) {
                moodSelector.style.display = 'none';
            }
            console.log('😊 Mood changed to:', currentMood);
            
            // Auto-fill input with mood
            userInput.value = `I'm feeling ${currentMood}`;
            userInput.focus();
        });
    });

    // Quick action buttons
    quickActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const prompt = btn.getAttribute('data-prompt');
            console.log('🚀 Quick action clicked:', prompt);
            userInput.value = prompt;
            processAndSendMessage();
        });
    });
    console.log('✅ Quick actions listeners attached');

    // Emoji button functionality
    if (emojiBtn && emojiContainer) {
        emojiBtn.addEventListener('click', () => {
            emojiContainer.style.display = emojiContainer.style.display === 'block' ? 'none' : 'block';
        });

        // Add emoji to input when clicked
        emojiContainer.querySelectorAll('.emoji-list span').forEach(emoji => {
            emoji.addEventListener('click', function() {
                userInput.value += this.textContent;
                userInput.focus();
            });
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiBtn.contains(e.target) && !emojiContainer.contains(e.target)) {
                emojiContainer.style.display = 'none';
            }
        });
    }

    // Voice button functionality
    if (voiceBtn) {
        let recognition = null;
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                processAndSendMessage();
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                addBotMsg("Voice input failed. Please type your message.");
            };

            voiceBtn.addEventListener('click', () => {
                if (recognition) {
                    recognition.start();
                }
            });
        } else {
            voiceBtn.style.display = 'none';
        }
    }

    // PDF Export functionality
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPDF);
    }

    // Initial message
    if (chatMessages.children.length <= 1) {
        setTimeout(() => {
            addBotMsg("Hello there! 👋 I'm Buddy, your mental health companion. I'm here to listen without judgment and offer support whenever you need it. How are you feeling today?");
        }, 1000);
    }

    // Mental Health API function - STANDALONE
    async function sendMentalMessage(data) {
        try {
            console.log('📤 Sending mental health request to:', `${API_BASE_URL}/api/mental/chat`);
            console.log('📦 Request data:', data);
            
            const response = await fetch(`${API_BASE_URL}/api/mental/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log('📨 Response status:', response.status);
            console.log('📨 Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Mental API response:', result);
            return result.response;
            
        } catch (error) {
            console.error('❌ Mental API error:', error);
            throw error;
        }
    }

    // Main message processing function
    async function processAndSendMessage() {
        console.log('🚀 processAndSendMessage called');
        
        if (isWaiting) {
            console.log('⚠️ Already waiting for response');
            return;
        }
        
        const message = userInput.value.trim();
        console.log('💬 Message to send:', message);
        
        if (!message) {
            console.log('⚠️ Empty message');
            return;
        }

        isWaiting = true;
        addUserMsg(message);
        userInput.value = '';
        
        // Hide emoji picker and mood selector when sending
        if (emojiContainer) emojiContainer.style.display = 'none';
        if (moodSelector) moodSelector.style.display = 'none';
        
        showTyping();

        try {
            // Special response for developer questions
            const lowerCaseMessage = message.toLowerCase();
            if (lowerCaseMessage.includes('who developed you') || 
                lowerCaseMessage.includes('who created you') ||
                lowerCaseMessage.includes('who made you')) {
                
                removeTyping();
                const creatorResponse = `I was developed by Sahil Lal, an engineering student and full stack web developer. He created me with ❤️ to provide mental health support and positive conversations.`;
                addBotMsg(creatorResponse);
                console.log('👨‍💻 Developer question handled');
                
            } else {
                // Normal message processing
                console.log('🔗 Calling mental health API...');
                const response = await sendMentalMessage({
                    message: message,
                    mood: currentMood
                    // Removed isMentalHealth field to match backend
                });

                console.log('✅ Got API response:', response);
                removeTyping();
                addBotMsg(response || "I'm here to listen. How can I support you today?");
            }
        } catch (error) {
            console.error('❌ Process error:', error);
            removeTyping();
            addBotMsg("I'm having trouble connecting right now. Please check your internet connection and try again.");
        } finally {
            isWaiting = false;
            console.log('🔚 Message processing complete');
        }
    }

    // PDF Export function
    async function exportToPDF() {
        console.log('Exporting to PDF...');
        
        try {
            const element = chatMessages.cloneNode(true);
            const pdfContainer = document.createElement('div');
            pdfContainer.style.padding = '20px';
            pdfContainer.style.backgroundColor = '#fff';
            pdfContainer.style.color = '#000'; 
            
            const title = document.createElement('h2');
            title.textContent = 'Mental Health Conversation';
            title.style.textAlign = 'center';
            title.style.marginBottom = '10px';
            title.style.color = '#000';
            pdfContainer.appendChild(title);
            
            const date = document.createElement('p');
            date.textContent = new Date().toLocaleString();
            date.style.textAlign = 'center';
            date.style.marginBottom = '20px';
            date.style.color = '#333';
            pdfContainer.appendChild(date);
            
            pdfContainer.appendChild(element);
            
            const options = {
                margin: 15,
                filename: 'Mental_Health_Conversation.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    logging: true,
                    useCORS: true,
                    backgroundColor: '#fff'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };
            
            await html2pdf().set(options).from(pdfContainer).save();
            console.log('PDF exported successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            addBotMsg("Sorry, I couldn't generate the PDF. Please try again.");
        }
    }

    // Helper functions
    function addUserMsg(text) {
        console.log('👤 Adding user message:', text);
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.innerHTML = `
            <div class="message-content">
                <div class="message-bubble"><p>${escapeHtml(text)}</p></div>
            </div>
            <div class="message-time">${getCurrentTime()}</div>
        `;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function addBotMsg(text) {
        console.log('🤖 Adding bot message:', text);
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        
        const formattedText = escapeHtml(text).replace(/\n/g, '<br>');
        
        msgDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">
                    <img src="assets/avatars/therapist.png" alt="Therapist" onerror="this.style.display='none'">
                </div>
                <div class="message-bubble"><p>${formattedText}</p></div>
            </div>
            <div class="message-time">${getCurrentTime()}</div>
        `;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTyping() {
        console.log('⌨️ Showing typing indicator');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTyping() {
        console.log('❌ Removing typing indicator');
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Make functions available globally for testing
    window.processAndSendMessage = processAndSendMessage;
    window.testMental = function() {
        console.log('🧪 Manual test triggered');
        userInput.value = 'Hello, I need someone to talk to';
        processAndSendMessage();
    };

    console.log('✅ Mental health chat fully initialized and ready!');
});

// Global test function
window.testMentalBackendConnection = async function() {
    console.log('🧪 Testing mental health backend connection...');
    try {
        const testData = {
            message: "Hello, I'm feeling a bit anxious today",
            mood: "anxious"
        };
        
        console.log('📤 Test request:', testData);
        
        const response = await fetch('https://studybuddy-backend-bvio.onrender.com/api/mental/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📨 Test response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Mental Backend test SUCCESS:', data);
            alert('Mental Health Backend connection successful! Response: ' + data.response);
            return data;
        } else {
            console.error('❌ Mental Backend test FAILED:', response.status);
            alert('Mental Health Backend connection failed! Status: ' + response.status);
        }
    } catch (error) {
        console.error('❌ Mental Backend test ERROR:', error);
        alert('Mental Health Backend connection error: ' + error.message);
    }
};

// Safety monitoring system (kept from original)
const SAFETY_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'want to die', 
    'better off dead', 'harm myself', 'self harm', 'cutting myself'
];