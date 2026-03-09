/* Elements */

const cover = document.getElementById("cover");
const app = document.getElementById("app");

const startBtn = document.getElementById("startBtn");
const talkBtn = document.getElementById("talkBackBtn");
const cancelBtn = document.getElementById("cancelBtn");

const speechText = document.getElementById("speechText");
const chatLog = document.getElementById("chatLog");
const status = document.getElementById("status");


/* Cover animation → show app */

cover.addEventListener("animationend", () => {
  cover.style.display = "none";
  app.classList.add("show");
});


/* Speech Recognition */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = true;


/* Voices */

let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();


/* Buttons */

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


/* Recognition Events */

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


/* Chat */

function addChat(user, msg) {

  const p = document.createElement("p");

  p.innerText = `${user}: ${msg}`;

  chatLog.appendChild(p);

  chatLog.scrollTop = chatLog.scrollHeight;
}


/* Speak */

function speak(text) {

  const utter = new SpeechSynthesisUtterance(text);

  speechSynthesis.speak(utter);

  addChat("Nova", text);
}


/* Commands */

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