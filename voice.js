const cover = document.getElementById("cover");
const notebook = document.getElementById("notebook");

const startBtn = document.getElementById("startBtn");
const talkBtn = document.getElementById("talkBackBtn");
const cancelBtn = document.getElementById("cancelBtn");

const speechText = document.getElementById("speechText");
const chatLog = document.getElementById("chatLog");
const status = document.getElementById("status");

cover.addEventListener("animationend", () => {
  cover.style.display = "none";
  notebook.classList.add("open");
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = true;

let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();

  voices.forEach((v, i) => {
    const option = document.createElement("option");

    option.value = i;
    option.textContent = v.name;
  });
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

startBtn.onclick = () => {
  recognition.start();
};

cancelBtn.onclick = () => {
  recognition.stop();
  speechSynthesis.cancel();

  status.innerText = "Idle";
};

talkBtn.onclick = () => {
  const text = prompt("What should Nova say?");

  if (text) speak(text);
};

recognition.onstart = () => {
  status.innerText = "Listening...";
};

recognition.onend = () => {
  status.innerText = "Idle";
};

recognition.onresult = (e) => {
  const transcript =
    e.results[e.results.length - 1][0].transcript.toLowerCase();

  speechText.innerText = transcript;

  addChat("You", transcript);

  if (!transcript.startsWith("nova")) return;

  const command = transcript.replace("nova", "").trim();

  processCommand(command);
};

function addChat(user, msg) {
  const p = document.createElement("p");

  p.innerText = user + ": " + msg;

  chatLog.appendChild(p);

  chatLog.scrollTop = chatLog.scrollHeight;
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utter);

  addChat("Nova", text);
}

function processCommand(cmd) {
  if (cmd === "") {
    speak("Yes?");
    return;
  }

  if (cmd.includes("time")) {
    const t = new Date().toLocaleTimeString();

    speak("The time is " + t);

    return;
  }

  if (cmd.includes("hello")) {
    speak("Hello! I'm Nova.");

    return;
  }

  speak("You said " + cmd);
}
