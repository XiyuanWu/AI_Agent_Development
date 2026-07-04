const messagesEl = document.getElementById('messages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');

let conversationId = sessionStorage.getItem('conversationId');

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

function getCsrfToken() {
    if (window.CSRF_TOKEN) return window.CSRF_TOKEN;
    const match = document.cookie.match(/(^| )csrftoken=([^;]+)/);
    return match ? match[2] : '';
}

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

    return message;
}

function showLoading() {
    const message = appendMessage('assistant', 'Thinking...');
    message.id = 'loadingMessage';
    message.querySelector('.message-content p').style.color = '#9ca3af';
}

function hideLoading() {
    const loading = document.getElementById('loadingMessage');
    if (loading) loading.remove();
}

async function sendMessage(text) {
    const banner = messagesEl.querySelector('.welcome-banner');
    if (banner) banner.remove();

    appendMessage('user', text);
    showLoading();
    sendBtn.disabled = true;

    try {
        const response = await fetch('/api/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({ message: text, conversation_id: conversationId }),
        });

        const data = await response.json().catch(() => ({}));
        hideLoading();

        if (!response.ok) {
            appendMessage('assistant', data.error || 'Something went wrong.');
            return;
        }

        appendMessage('assistant', data.reply || 'No reply received.');

        if (data.conversation_id) {
            conversationId = data.conversation_id;
            sessionStorage.setItem('conversationId', conversationId);
        }
    } catch (error) {
        hideLoading();
        appendMessage('assistant', 'Network error. Please try again.');
    } finally {
        updateSendButton();
        messageInput.focus();
    }
}

function updateSendButton() {
    sendBtn.disabled = !messageInput.value.trim();
}

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    messageInput.value = '';
    messageInput.style.height = 'auto';
    updateSendButton();
    sendMessage(text);
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
    conversationId = null;
    sessionStorage.removeItem('conversationId');
    messagesEl.innerHTML = welcomeBanner + welcomeMessage;
    messageInput.focus();
    updateSendButton();
});

async function loadHistory() {
    if (!conversationId) return;

    try {
        const response = await fetch(`/api/chat/?conversation_id=${conversationId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.messages?.length) return;

        messagesEl.innerHTML = '';
        data.messages.forEach((msg) => appendMessage(msg.role, msg.content));
    } catch (error) {
        // ignore load errors on page open
    }
}

loadHistory();
messageInput.focus();
updateSendButton();
