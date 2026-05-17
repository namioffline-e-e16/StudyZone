// Welcome Screen
const enterBtn = document.getElementById("enter-btn");
const welcomeScreen = document.getElementById("welcome-screen");
const mainContent = document.getElementById("main-content");

enterBtn.addEventListener("click", () => {
    welcomeScreen.style.display = "none";
    mainContent.classList.remove("hidden");
});

// Motivational Quotes
const quotes = [
    "Push yourself, because no one else will do it for you.",
    "Small progress is still progress.",
    "Your future self will thank you.",
    "Study hard now, shine later.",
    "Dream big. Start small. Stay consistent.",
    "You are capable of amazing things."
];

function changeQuote() {
    const quote = document.getElementById("quote");

    quote.textContent =
        quotes[Math.floor(Math.random() * quotes.length)];
}

setInterval(changeQuote, 5000);

// --------------------
// Pomodoro Timer
// --------------------
let timer;
let totalTime = 25 * 60;
let timeLeft = totalTime;
let isRunning = false;

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    document.getElementById("timer").textContent =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    if (timeLeft <= 0) {
        clearInterval(timer);
        alert("Pomodoro finished! Take a break 🌸");
        isRunning = false;
        return;
    }

    timeLeft--;
}

function startTimer() {
    if (!isRunning) {
        timer = setInterval(updateTimer, 1000);
        isRunning = true;
    }
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = totalTime;
    updateTimer();
}

updateTimer();

// --------------------
// To-Do List
// --------------------
function addTask() {
    const taskInput =
        document.getElementById("taskInput");

    const task = taskInput.value.trim();

    if (task === "") return;

    const li = document.createElement("li");
    li.textContent = task;

    li.addEventListener("click", () => {
        li.style.textDecoration = "line-through";
        li.style.opacity = "0.7";
    });

    document
        .getElementById("taskList")
        .appendChild(li);

    taskInput.value = "";
}

// --------------------
// Lesson Summarizer
// --------------------
let lessonContent = "";

document
    .getElementById("lessonFile")
    .addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        lessonContent = e.target.result;
        document.getElementById("lessonText").value =
            lessonContent;
    };

    reader.readAsText(file);
});

function summarizeLesson() {
    const text =
        document.getElementById("lessonText")
        .value.trim();

    if (!text) {
        alert("Please paste or upload a lesson.");
        return;
    }

    lessonContent = text;

    // Basic summary
    const sentences = text
        .split(/[.!?]/)
        .filter(sentence =>
            sentence.trim().length > 20
        );

    const summary = sentences
        .slice(0, 5)
        .join(". ");

    document.getElementById(
        "summaryOutput"
    ).textContent =
        summary || "No summary found.";
}

// --------------------
// Flashcards Generator
// --------------------
function generateFlashcards() {

    if (!lessonContent) {
        alert("Please summarize or upload a lesson first.");
        return;
    }

    const flashcardsContainer =
        document.getElementById("flashcards");

    flashcardsContainer.innerHTML = "";

    const sentences = lessonContent
        .split(/[.!?]/)
        .filter(sentence =>
            sentence.trim().length > 25
        )
        .slice(0, 6);

    sentences.forEach((sentence, index) => {

        const card =
            document.createElement("div");

        card.className = "flashcard";

        const question =
            `Question ${index + 1}`;

        const answer =
            sentence.trim();

        card.textContent = question;

        card.addEventListener("click", () => {

            if (
                card.textContent === question
            ) {
                card.textContent = answer;
            } else {
                card.textContent = question;
            }
        });

        flashcardsContainer.appendChild(card);
    });
}

// --------------------
// Focus Mode
// --------------------
function focusMode() {

    const focusText =
        document.getElementById("focusText");

    focusText.textContent =
        "🚫 Focus Mode Enabled! Stay away from distractions and keep studying.";
}