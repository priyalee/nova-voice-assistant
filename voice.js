// Elements
const startBtn = document.getElementById("startBtn");
const talkBackBtn = document.getElementById("talkBackBtn");
const cancelBtn = document.getElementById("cancelBtn");
const speechText = document.getElementById("speechText");
const chatLog = document.getElementById("chatLog");
const voiceSelect = document.getElementById("voiceSelect");

// Status
let statusText = document.getElementById("statusText") || (() => {
  const p = document.createElement("p");
  p.id = "statusText";
  p.style.margin = "10px 0";
  p.style.fontWeight = "bold";
  p.style.fontSize = "14px";
  p.textContent = "Idle";
  document.querySelector(".container").prepend(p);
  return p;
})();

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) alert("Speech Recognition not supported");

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isListening = false;
let isSpeaking = false;
let expectingResponse = false;
let lastQuestion = "";
let voices = [];

// Load voices
function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  voiceSelect.innerHTML = '<option value="">Default Voice</option>';
  voices.forEach((v, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(option);
  });
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// Start Listening
startBtn.addEventListener("click", () => {
  if (!isListening) recognition.start();
});

// Talk Back
talkBackBtn.addEventListener("click", () => {
  if (!isSpeaking) {
    const text = prompt("What should Nova say?");
    if (text) speak(text);
  }
});

// Cancel
cancelBtn.addEventListener("click", () => {
  if (isListening) recognition.stop();
  if (isSpeaking) window.speechSynthesis.cancel();
  resetState();
});

function resetState() {
  isListening = false;
  isSpeaking = false;
  expectingResponse = false;
  lastQuestion = "";
  document.body.className = "";
  statusText.textContent = "Idle";
}

// Recognition events
recognition.onstart = () => {
  isListening = true;
  document.body.className = "listening";
  statusText.textContent = "Listening for 'Nova'...";
};

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
  if (event.results[event.results.length - 1][0].confidence < 0.55) return;
  speechText.textContent = transcript;

  const userMsg = document.createElement("p");
  userMsg.textContent = "You: " + transcript;
  userMsg.style.margin = "5px 0";
  chatLog.appendChild(userMsg);
  chatLog.scrollTop = chatLog.scrollHeight;

  const wakeWord = "nova";
  if (!transcript.startsWith(wakeWord)) return;

  const command = transcript.replace(wakeWord, "").trim();
  if (!command) return speak("Yes?");

  document.body.className = "processing";
  statusText.textContent = "Processing...";
  processCommand(command);
};

recognition.onerror = (err) => {
  console.error("SpeechRecognition error:", err);
  resetState();
};

recognition.onend = () => {
  isListening = false;
  if (!isSpeaking) resetState();
};

// Speak with selected voice
function speak(message) {
  if (!message) return;
  isSpeaking = true;
  document.body.className = "speaking";
  statusText.textContent = "Speaking...";

  const utter = new SpeechSynthesisUtterance(message);
  const selectedIndex = voiceSelect.value;
  if (selectedIndex !== "") utter.voice = voices[selectedIndex];
  utter.lang = "en-US";

  utter.onend = () => {
    isSpeaking = false;
    document.body.className = "listening";
    statusText.textContent = "Listening for 'Nova'...";
    if (!isListening) recognition.start();
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);

  // Append Nova message to chat
  const msg = document.createElement("p");
  msg.textContent = "Nova: " + message;
  msg.style.margin = "5px 0";
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Reading Modes
document.getElementById("readConversation").addEventListener("click", () => {
  const text = Array.from(chatLog.querySelectorAll("p")).map(p => p.textContent).join(". ");
  speak(text || "Conversation is empty");
});

document.getElementById("readScreen").addEventListener("click", () => {
  const containerText = document.querySelector(".container").innerText;
  speak(containerText);
});