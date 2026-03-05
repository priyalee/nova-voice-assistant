const startBtn = document.getElementById("startBtn")
const statusText = document.getElementById("statusText")
const speechText = document.getElementById("speechText")
const responseText = document.getElementById("responseText")

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

if (!SpeechRecognition) {
  alert("Speech Recognition not supported in this browser")
  throw new Error("Speech Recognition unsupported")
}

const recognition = new SpeechRecognition()

recognition.lang = "en-US"
recognition.continuous = true
recognition.interimResults = false
recognition.maxAlternatives = 1

let isListening = false
let isSpeaking = false

startBtn.addEventListener("click", () => {
  if (!isListening) {
    recognition.start()
  }
})

recognition.onstart = () => {
  isListening = true
  document.body.className = "listening"
  statusText.textContent = "Listening for 'Nova'..."
}

recognition.onresult = (event) => {
  const result = event.results[event.results.length - 1][0]

  if (result.confidence < 0.55) return

  const transcript = result.transcript.toLowerCase().trim()

  speechText.textContent = transcript

  const wakeWord = "nova"

  if (!transcript.startsWith(wakeWord)) return

  const command = transcript.replace(wakeWord, "").trim()

  if (!command) {
    respond("Yes?")
    return
  }

  document.body.className = "processing"
  statusText.textContent = "Processing..."

  processCommand(command)
}

recognition.onerror = () => {
  document.body.className = ""
  statusText.textContent = "Speech recognition error"
}

recognition.onend = () => {
  if (isListening && !isSpeaking) {
    recognition.start()
  }
}

function processCommand(command) {
  for (const cmd of commands) {
    if (cmd.pattern.test(command)) {
      cmd.action(command)
      return
    }
  }

  fallbackSearch(command)
}

const commands = [
  {
    pattern: /^open (.+)/,
    action: (command) => {
      const site = command.replace("open ", "").trim()

      const domain = site
        .replace(/\s+/g, "")
        .replace(".com", "")
        .replace(".in", "")

      const url = "https://" + domain + ".com"

      respond("Opening " + site)

      window.open(url, "_blank", "noopener,noreferrer")
    }
  },

  {
    pattern: /^search (.+)/,
    action: (command) => {
      const query = command.replace("search ", "")

      respond("Searching for " + query)

      window.open(
        "https://www.google.com/search?q=" +
          encodeURIComponent(query),
        "_blank",
        "noopener,noreferrer"
      )
    }
  },

  {
    pattern: /^time$/,
    action: () => {
      const time = new Date().toLocaleTimeString()

      respond("The time is " + time)
    }
  },

  {
    pattern: /^date$/,
    action: () => {
      const date = new Date().toDateString()

      respond("Today is " + date)
    }
  },

  {
    pattern: /^(hello|hi)$/,
    action: () => {
      respond("Hello. How can I help you?")
    }
  }
]

function fallbackSearch(query) {
  respond("Searching Google for " + query)

  window.open(
    "https://www.google.com/search?q=" +
      encodeURIComponent(query),
    "_blank",
    "noopener,noreferrer"
  )
}

function respond(message) {
  responseText.textContent = message

  document.body.className = "speaking"
  statusText.textContent = "Speaking..."

  isSpeaking = true

  const speech = new SpeechSynthesisUtterance(message)

  speech.lang = "en-US"

  speech.onend = () => {
    isSpeaking = false
    document.body.className = "listening"
    statusText.textContent = "Listening for 'Nova'..."
  }

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(speech)
}