const messagesEl = document.getElementById('messages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');

const welcomeBanner = `
    <div class="welcome-banner">
        <div class="welcome-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
            </svg>
        </div>
        <h3>How can I help you today?</h3>
        <p>Ask a question, brainstorm ideas, or start a conversation.</p>
    </div>
`;

const welcomeMessage = `
    <div class="message assistant">
        <div class="message-avatar assistant-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
            </svg>
        </div>
        <div class="message-body">
            <div class="message-meta">
                <span class="message-sender">AI Assistant</span>
                <span class="message-time">Just now</span>
            </div>
            <div class="message-content">
                <p>Hi! I'm your AI assistant. Ask me anything to get started — I'm here to help with questions, writing, coding, and more.</p>
            </div>
        </div>
    </div>
`;

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(role, text) {
    const message = document.createElement('div');
    message.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = role === 'user' ? 'message-avatar' : 'message-avatar assistant-avatar';

    if (role === 'user') {
        avatar.textContent = 'You';
    } else {
        avatar.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
            </svg>
        `;
    }

    const body = document.createElement('div');
    body.className = 'message-body';

    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.innerHTML = `
        <span class="message-sender">${role === 'user' ? 'You' : 'AI Assistant'}</span>
        <span class="message-time">${formatTime(new Date())}</span>
    `;

    const content = document.createElement('div');
    content.className = 'message-content';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    content.appendChild(paragraph);

    body.appendChild(meta);
    body.appendChild(content);
    message.appendChild(avatar);
    message.appendChild(body);
    messagesEl.appendChild(message);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function updateSendButton() {
    sendBtn.disabled = !messageInput.value.trim();
}

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    const banner = messagesEl.querySelector('.welcome-banner');
    if (banner) banner.remove();

    appendMessage('user', text);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    updateSendButton();
    messageInput.focus();
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (messageInput.value.trim()) {
            chatForm.requestSubmit();
        }
    }
});

messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + 'px';
    updateSendButton();
});

newChatBtn.addEventListener('click', () => {
    messagesEl.innerHTML = welcomeBanner + welcomeMessage;
    messageInput.focus();
});

messageInput.focus();
updateSendButton();
