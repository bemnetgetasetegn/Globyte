// =============================
// Chatbot - Globyte Assistant
// =============================



// DOM Elements
const chatbotFab = document.getElementById('chatbotFab');
const chatbotContainer = document.getElementById('chatbotContainer');
const closeChatbotBtn = document.getElementById('closeChatbot');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChat');

// Store chat history
let chatHistory = [];

// -----------------------------
// Utility Functions
// -----------------------------

// Toggle chatbot visibility
function toggleChatbot() {
    chatbotContainer.classList.toggle('hidden');
    if (!chatbotContainer.classList.contains('hidden')) {
        if (chatHistory.length === 0) {
            appendMessage('Hello! Welcome to Globyte. How can I help you today?', 'bot');
        }
        chatInput.focus();
    }
}

// Append messages with Tailwind styling
function appendMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('flex');

    const bubble = document.createElement('div');
    if (sender === 'user') {
        bubble.className = "bg-[#3A3E56] text-white px-3 py-2 rounded-lg w-fit ml-auto my-1";
    } else {
        bubble.className = "bg-[#85B8B2] text-white px-3 py-2 rounded-lg w-fit my-1";
    }
    bubble.textContent = text;

    messageElement.appendChild(bubble);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save history
    chatHistory.push({ text, sender });
}

// Show loading indicator
function showLoadingIndicator() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loadingIndicator';
    loadingElement.className = "flex space-x-1 mt-2";
    loadingElement.innerHTML = `
        <span class="w-2 h-2 bg-[#85B8B2] rounded-full animate-bounce"></span>
        <span class="w-2 h-2 bg-[#85B8B2] rounded-full animate-bounce delay-150"></span>
        <span class="w-2 h-2 bg-[#85B8B2] rounded-full animate-bounce delay-300"></span>
    `;
    chatMessages.appendChild(loadingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideLoadingIndicator() {
    const loadingElement = document.getElementById('loadingIndicator');
    if (loadingElement) loadingElement.remove();
}

// -----------------------------
// Knowledge Base
// -----------------------------
const knowledgeBase = {
    "Globyte": "Globyte LLC is an IT and business consulting firm that helps organizations grow through innovative technology, data solutions, and strategic business insights. We specialize in cloud infrastructure, AI integration, and digital transformation.",
    "Why Choose Globyte": "We offer end-to-end services from IT strategy to implementation with a focus on cloud, AI, data, and user experience. Our team combines technical excellence with business acumen to deliver impactful, customized solutions",
    "Services": "We offer IT consulting, business consulting, AI & machine learning integration, cloud computing, cybersecurity, software development, managed IT services, IT training, and more.",
    "Cybersecurity": "We perform risk assessments and implement safeguards like encryption, firewalls, and incident response plans to secure your systems.",
    "Cloud Solutions": "We enable efficient cloud migration and management across AWS, Azure, and Google Cloud, optimizing cost, scalability, and performance.",
    "Software Development": "We design and develop customized applications tailored to meet unique business needs, from concept to deployment.",
    "Data Management": "We implement secure data storage, reliable backup systems, and advanced analytics tools for actionable insights.",
    "AI & ML Integration": "We develop tailored AI solutions such as chatbots, workflow automation, and predictive analytics to enhance decision-making.",
    "Team": "Our team includes cloud-certified architects, UI/UX designers, developers, project managers, and business consultants working together to ensure top-quality solutions.",
    "Process": "Our process includes 1) Discovery & Assessment, 2) Gap Analysis, 3) Solution Design, 4) Implementation & Integration, 5) Monitoring & Continuous Improvement.",
    "Contact": "You can reach us at globyteconsulting@gmail.com or call +17202803704.",
    "Location": "Please contact us at globyteconsulting@gmail.com or call +17202803704."
};

// Search FAQ
function searchFAQ(question) {
    const lowerQuestion = question.toLowerCase();
    for (const [key, value] of Object.entries(knowledgeBase)) {
        if (lowerQuestion.includes(key.toLowerCase())) {
            return value;
        }
    }
    return null;
}

// -----------------------------
// Chat Logic
// -----------------------------
async function sendMessage() {
    const prompt = chatInput.value.trim();
    if (prompt === '') return;

    appendMessage(prompt, 'user');
    chatInput.value = '';
    showLoadingIndicator();

    try {
        const lowerPrompt = prompt.toLowerCase();

        // Simple responses
        if (["hi", "hello", "hey", "hy"].some(g => lowerPrompt.includes(g))) {
            hideLoadingIndicator();
            appendMessage("Hello 👋! How can I assist you today?", 'bot');
            return;
        }
        if (["thank", "thanks"].some(t => lowerPrompt.includes(t))) {
            hideLoadingIndicator();
            appendMessage("You're welcome! 😊 Anything else I can help you with?", 'bot');
            return;
        }
        if (["bye", "goodbye"].some(b => lowerPrompt.includes(b))) {
            hideLoadingIndicator();
            appendMessage("Goodbye! 👋 Feel free to reach out anytime.", 'bot');
            return;
        }

        // Check knowledge base
        const faqResponse = searchFAQ(prompt);
        if (faqResponse) {
            hideLoadingIndicator();
            appendMessage(faqResponse, 'bot');
            return;
        }

        // Fallback: Use Groq API
        const GROQ_API_KEY = "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"; // ⚠️ Replace with your real key
        const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

        const context = Object.entries(knowledgeBase)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n\n");

        const messages = [
            {
                role: "system",
                content: `You are a helpful assistant for Globyte, an IT and business consulting firm. 
                Use the knowledge base below to answer questions:
                ${context}
                If unsure, politely suggest contacting human support.`
            },
            { role: "user", content: prompt }
        ];

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0.7,
                max_tokens: 512
            })
        });

        hideLoadingIndicator();

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            appendMessage(data.choices[0].message.content, 'bot');
        } else {
            appendMessage("I'm not sure how to answer that. Can I connect you with a human representative?", 'bot');
        }

    } catch (error) {
        console.error("Chatbot error:", error);
        hideLoadingIndicator();
        appendMessage("⚠️ I'm having trouble right now. Please try again later.", 'bot');
    }
}

// -----------------------------
// Event Listeners
// -----------------------------
chatbotFab.addEventListener('click', toggleChatbot);
closeChatbotBtn.addEventListener('click', toggleChatbot);
sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});
