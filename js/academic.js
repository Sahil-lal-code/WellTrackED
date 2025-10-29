// js/academic.js - COMPLETELY FIXED VERSION
console.log('🎯 ACADEMIC.JS LOADED SUCCESSFULLY!');

let currentSubject = 'general';
let isWaiting = false;
const API_BASE_URL = 'https://studybuddy-backend-bvio.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Academic DOM loaded - Initializing chat');
    
    // DOM elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const exportPdfBtn = document.getElementById('export-pdf');
    const fileBtn = document.getElementById('file-btn');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    const subjectBtn = document.getElementById('subject-btn');
    const subjectSelector = document.getElementById('subject-selector');
    const quickActions = document.querySelectorAll('.quick-action');

    // Validate essential elements
    if (!chatMessages || !userInput || !sendBtn) {
        console.error('❌ Critical elements missing!');
        console.error('chatMessages:', chatMessages);
        console.error('userInput:', userInput);
        console.error('sendBtn:', sendBtn);
        return;
    }

    console.log('✅ All DOM elements found');

    // Hide file upload for now
    if (fileBtn) fileBtn.style.display = 'none';
    if (fileInput) fileInput.style.display = 'none';
    if (filePreview) filePreview.style.display = 'none';

    // Speech recognition setup
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
    } else {
        if (voiceBtn) voiceBtn.style.display = 'none';
    }

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

    if (voiceBtn && recognition) {
        voiceBtn.addEventListener('click', () => {
            recognition.start();
        });
    }

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPDF);
    }

    if (subjectBtn && subjectSelector) {
        subjectBtn.addEventListener('click', () => {
            subjectSelector.style.display = subjectSelector.style.display === 'flex' ? 'none' : 'flex';
        });
    }

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

    // Subject selection
    document.querySelectorAll('.subject-option').forEach(option => {
        option.addEventListener('click', () => {
            currentSubject = option.dataset.subject;
            document.querySelectorAll('.subject-option').forEach(opt => 
                opt.classList.remove('selected')
            );
            option.classList.add('selected');
            if (subjectSelector) {
                subjectSelector.style.display = 'none';
            }
            console.log('📚 Subject changed to:', currentSubject);
        });
    });

    // Initial message
    if (chatMessages.children.length <= 1) {
        setTimeout(() => {
            addBotMsg("Hello! I'm your Academic Assistant. Ask me anything about Math, Physics, or Computer Science! 🎓");
        }, 1000);
    }

    // Academic API function - STANDALONE
    async function sendAcademicMessage(data) {
        try {
            console.log('📤 Sending academic request to:', `${API_BASE_URL}/api/academic/chat`);
            console.log('📦 Request data:', data);
            
            const response = await fetch(`${API_BASE_URL}/api/academic/chat`, {
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
            console.log('✅ Academic API response:', result);
            return result.response;
            
        } catch (error) {
            console.error('❌ Academic API error:', error);
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
        showTyping();

        try {
            // Special response for developer questions
            const lowerCaseMessage = message.toLowerCase();
            if (lowerCaseMessage.includes('who developed you') || 
                lowerCaseMessage.includes('who created you') ||
                lowerCaseMessage.includes('who made you')) {
                
                removeTyping();
                const creatorResponse = `I was developed by Sahil Lal, an engineering student and full stack web developer. He created me with ❤️ to provide academic assistance and learning support.`;
                addBotMsg(creatorResponse);
                console.log('👨‍💻 Developer question handled');
                
            } else {
                // Normal message processing
                console.log('🔗 Calling academic API...');
                const response = await sendAcademicMessage({
                    message: message,
                    subject: currentSubject
                });

                console.log('✅ Got API response:', response);
                removeTyping();
                addBotMsg(response || "I'm here to help with your academic questions!");
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
            title.textContent = 'Academic Conversation';
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
                filename: 'Academic_Conversation.pdf',
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
                    <img src="assets/avatars/professor.png" alt="Professor" onerror="this.style.display='none'">
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
    window.testAcademic = function() {
        console.log('🧪 Manual test triggered');
        userInput.value = 'Hello, can you explain algebra?';
        processAndSendMessage();
    };

    console.log('✅ Academic chat fully initialized and ready!');
});

// Global test function
window.testBackendConnection = async function() {
    console.log('🧪 Testing backend connection...');
    try {
        const testData = {
            message: "Hello, this is a test message",
            subject: "math"
        };
        
        console.log('📤 Test request:', testData);
        
        const response = await fetch('https://studybuddy-backend-bvio.onrender.com/api/academic/chat', {
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
            console.log('✅ Backend test SUCCESS:', data);
            alert('Backend connection successful! Response: ' + data.response);
            return data;
        } else {
            console.error('❌ Backend test FAILED:', response.status);
            alert('Backend connection failed! Status: ' + response.status);
        }
    } catch (error) {
        console.error('❌ Backend test ERROR:', error);
        alert('Backend connection error: ' + error.message);
    }
};