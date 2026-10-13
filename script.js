let currentUser = null;
let userSubjects = [];

let selectedEmoji = '📚';
let selectedColor = '#a78bfa';
let activeSubjectIdForMaterial = null;

function openAuthModal(mode) {
    const modal = document.getElementById("auth-modal");
    const signinBox = document.getElementById("signin-form-box");
    const loginBox = document.getElementById("login-form-box");

    modal.classList.remove("hidden");
    if (mode === 'signin') {
        signinBox.classList.remove("hidden");
        loginBox.classList.add("hidden");
    } else {
        loginBox.classList.remove("hidden");
        signinBox.classList.add("hidden");
    }
}

function closeAuthModal() {
    document.getElementById("auth-modal").classList.add("hidden");
}

function handleSignup() {
    const user = document.getElementById("signin-username").value.trim();
    const pass = document.getElementById("signin-password").value.trim();

    if (!user || !pass) return alert("Please enter both username and password.");

    let users = JSON.parse(localStorage.getItem("studyzone_accounts")) || {};
    if (users[user]) return alert("Account already exists! Please Log-in.");

    users[user] = { password: pass, subjects: [] };
    localStorage.setItem("studyzone_accounts", JSON.stringify(users));
    alert("Account created successfully!");
    loginSession(user);
}

function handleLogin() {
    const user = document.getElementById("login-username").value.trim();
    const pass = document.getElementById("login-password").value.trim();

    let users = JSON.parse(localStorage.getItem("studyzone_accounts")) || {};
    if (!users[user] || users[user].password !== pass) return alert("Invalid username or password.");

    loginSession(user);
}

function loginSession(username) {
    currentUser = username;
    localStorage.setItem("studyzone_session", username);
    closeAuthModal();
    document.getElementById("welcome-screen").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
    document.getElementById("user-display").textContent = `👤 ${username}`;
    loadUserSubjects();
}

function logoutUser() {
    localStorage.removeItem("studyzone_session");
    window.location.reload();
}

window.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem("studyzone_session");
    if (savedUser) loginSession(savedUser);
});

// --- Subject Creation Modal ---
function openSubjectModal() {
    document.getElementById("subject-modal").classList.remove("hidden");
}

function closeSubjectModal() {
    document.getElementById("subject-modal").classList.add("hidden");
    document.getElementById("new-subject-name").value = "";
    document.getElementById("has-branches-check").checked = false;
    document.getElementById("subject-branches-names-box").classList.add("hidden");
    document.getElementById("subject-branches-input").value = "";
}

function selectEmoji(el, emoji) {
    document.querySelectorAll(".emoji-option").forEach(e => e.classList.remove("selected"));
    el.classList.add("selected");
    selectedEmoji = emoji;
}

function selectColor(el, color) {
    document.querySelectorAll(".color-option").forEach(e => e.classList.remove("selected"));
    el.classList.add("selected");
    selectedColor = color;
}

function toggleBranchesOption() {
    const checked = document.getElementById("has-branches-check").checked;
    const box = document.getElementById("subject-branches-names-box");
    if (checked) box.classList.remove("hidden");
    else box.classList.add("hidden");
}

function saveNewSubject() {
    const name = document.getElementById("new-subject-name").value.trim();
    const hasBranches = document.getElementById("has-branches-check").checked;
    const branchesInput = document.getElementById("subject-branches-input").value.trim();

    if (!name) return alert("Please enter a subject name.");

    let branchesList = [];
    if (hasBranches && branchesInput) {
        branchesList = branchesInput.split(',').map(b => ({ name: b.trim(), content: "" })).filter(b => b.name);
    }

    const newSub = {
        id: Date.now(),
        name: name,
        emoji: selectedEmoji,
        color: selectedColor,
        hasBranches: hasBranches,
        branches: branchesList
    };

    userSubjects.push(newSub);
    saveUserSubjects();
    renderSubjects();
    closeSubjectModal();
}

// --- Material / Content Adding Modal ---
function openMaterialModal(subjectId) {
    activeSubjectIdForMaterial = subjectId;
    const subject = userSubjects.find(s => s.id === subjectId);
    if (!subject) return;

    document.getElementById("material-text-input").value = "";
    document.getElementById("material-file-input").value = "";

    const branchSelectContainer = document.getElementById("branch-select-container");
    const branchSelect = document.getElementById("material-branch-select");

    if (subject.hasBranches && subject.branches.length > 0) {
        branchSelectContainer.classList.remove("hidden");
        branchSelect.innerHTML = subject.branches.map((b, idx) => `<option value="${idx}">${b.name}</option>`).join('');
    } else {
        branchSelectContainer.classList.add("hidden");
    }

    document.getElementById("material-modal").classList.remove("hidden");
}

function closeMaterialModal() {
    document.getElementById("material-modal").classList.add("hidden");
    activeSubjectIdForMaterial = null;
}

function saveSubjectMaterial() {
    const textInfo = document.getElementById("material-text-input").value.trim();
    const fileInput = document.getElementById("material-file-input");
    const subject = userSubjects.find(s => s.id === activeSubjectIdForMaterial);

    if (!subject) return;

    const processContent = (contentToAdd) => {
        if (subject.hasBranches && subject.branches.length > 0) {
            const branchIndex = document.getElementById("material-branch-select").value;
            if (subject.branches[branchIndex]) {
                subject.branches[branchIndex].content = subject.branches[branchIndex].content 
                    ? subject.branches[branchIndex].content + "\n\n" + contentToAdd 
                    : contentToAdd;
            }
        } else {
            if (!subject.generalContent) subject.generalContent = "";
            subject.generalContent = subject.generalContent ? subject.generalContent + "\n\n" + contentToAdd : contentToAdd;
        }

        saveUserSubjects();
        renderSubjects();
        closeMaterialModal();
    };

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = e.target.result;
            const combined = textInfo ? textInfo + "\n\n[File Content]:\n" + fileData : fileData;
            processContent(combined);
        };
        reader.readAsText(file);
    } else if (textInfo) {
        processContent(textInfo);
    } else {
        alert("Please enter notes or upload a file.");
    }
}

function loadUserSubjects() {
    let users = JSON.parse(localStorage.getItem("studyzone_accounts")) || {};
    if (users[currentUser]) {
        userSubjects = users[currentUser].subjects || [];
        renderSubjects();
    }
}

function saveUserSubjects() {
    let users = JSON.parse(localStorage.getItem("studyzone_accounts")) || {};
    if (users[currentUser]) {
        users[currentUser].subjects = userSubjects;
        localStorage.setItem("studyzone_accounts", JSON.stringify(users));
    }
}

function deleteSubject(id) {
    userSubjects = userSubjects.filter(sub => sub.id !== id);
    saveUserSubjects();
    renderSubjects();
}

function renderSubjects() {
    const container = document.getElementById("subjectsContainer");
    container.innerHTML = "";

    if (userSubjects.length === 0) {
        container.innerHTML = `<p style="color: #64748b; font-style: italic;">No subjects added yet. Click "+ Add Subject" to begin!</p>`;
        return;
    }

    userSubjects.forEach(sub => {
        const card = document.createElement("div");
        card.className = "subject-item-card";
        card.style.borderLeftColor = sub.color;

        let contentHTML = "";
        if (sub.hasBranches && sub.branches.length > 0) {
            contentHTML = `<div class="branches-list">` + sub.branches.map(b => `
                <div class="branch-item-box">
                    <div class="branch-title">🔹 ${b.name}</div>
                    <div class="branch-content">${b.content || '<span style="color:#64748b; font-style:italic;">No content added yet.</span>'}</div>
                </div>
            `).join('') + `</div>`;
        } else {
            contentHTML = `<div class="branch-item-box" style="margin-top:10px;">
                <div class="branch-content">${sub.generalContent || '<span style="color:#64748b; font-style:italic;">No content added yet. Click "Add Material" below.</span>'}</div>
            </div>`;
        }

        card.innerHTML = `
            <div class="subject-card-top">
                <div class="subject-title-area">
                    <span class="subject-icon">${sub.emoji}</span>
                    <span class="subject-name">${sub.name}</span>
                </div>
                <button class="delete-btn" onclick="deleteSubject(${sub.id})">❌</button>
            </div>
            ${contentHTML}
            <div class="subject-actions">
                <button class="add-material-btn" onclick="openMaterialModal(${sub.id})">➕ Add Material / PDF</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- General Tools (Pomodoro, Todo, Summarizer, etc.) ---
const quotes = [
    "Push yourself, because no one else will do it for you.",
    "Small progress is still progress.",
    "Your future self will thank you.",
    "Study hard now, shine later."
];
setInterval(() => {
    document.getElementById("quote").textContent = quotes[Math.floor(Math.random() * quotes.length)];
}, 5000);

let timer, timeLeft = 25 * 60, isRunning = false;
function updateTimer() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    document.getElementById("timer").textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;
    if (timeLeft <= 0) { clearInterval(timer); alert("Pomodoro finished!"); isRunning = false; return; }
    timeLeft--;
}
function startTimer() { if (!isRunning) { timer = setInterval(updateTimer, 1000); isRunning = true; } }
function pauseTimer() { clearInterval(timer); isRunning = false; }
function resetTimer() { clearInterval(timer); isRunning = false; timeLeft = 25 * 60; updateTimer(); }

function addTask() {
    const input = document.getElementById("taskInput");
    if (!input.value.trim()) return;
    const li = document.createElement("li");
    li.textContent = input.value.trim();
    li.onclick = () => { li.style.textDecoration = "line-through"; li.style.opacity = "0.5"; };
    document.getElementById("taskList").appendChild(li);
    input.value = "";
}

let lessonContent = "";
document.getElementById("lessonFile")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        lessonContent = evt.target.result;
        document.getElementById("lessonText").value = lessonContent;
    };
    reader.readAsText(file);
});

function summarizeLesson() {
    const text = document.getElementById("lessonText").value.trim();
    if (!text) return alert("Please enter text or upload a file.");
    lessonContent = text;
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20);
    document.getElementById("summaryOutput").textContent = sentences.slice(0, 5).join(". ") || "No summary found.";
}

function generateFlashcards() {
    if (!lessonContent) return alert("Please summarize a lesson first.");
    const container = document.getElementById("flashcards");
    container.innerHTML = "";
    lessonContent.split(/[.!?]/).filter(s => s.trim().length > 25).slice(0, 6).forEach((s, i) => {
        const card = document.createElement("div");
        card.className = "flashcard";
        const q = `Question ${i + 1}`, a = s.trim();
        card.textContent = q;
        card.onclick = () => { card.textContent = card.textContent === q ? a : q; };
        container.appendChild(card);
    });
}

function focusMode() {
    document.getElementById("focusText").textContent = "🚫 Focus Mode Enabled!";
}