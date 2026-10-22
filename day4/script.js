const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

function getWordCount(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        return 0;
    }
    return trimmed.split(/\s+/).length;
}

function updateCounts() {
    const text = noteText.value;
    const charLen = text.length;
    const words = getWordCount(text);

    charCount.textContent = `${charLen} / 200 characters`;
    wordCount.textContent = `${words} words`;

    if (charLen > 200) {
        charCount.classList.add("over");
        charCount.classList.remove("warning");
    } else if (charLen > 180) {
        charCount.classList.add("warning");
        charCount.classList.remove("over");
    } else {
        charCount.classList.remove("warning");
        charCount.classList.remove("over");
    }
}

function clearAll() {
    noteText.value = "";
    localStorage.removeItem("draft");
    updateCounts();
}

function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "Light mode";
    } else {
        document.body.classList.remove("dark");
        themeToggle.textContent = "Dark mode";
    }
}

// Event listeners
noteText.addEventListener("input", () => {
    updateCounts();
    localStorage.setItem("draft", noteText.value);
});

noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearAll();
    }
});

clearBtn.addEventListener("click", clearAll);

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    if (isDark) {
        themeToggle.textContent = "Light mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "Dark mode";
        localStorage.setItem("theme", "light");
    }
});

// Restore saved draft and theme on page load, then update counts
const savedDraft = localStorage.getItem("draft");
if (savedDraft !== null) {
    noteText.value = savedDraft;
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    applyTheme(savedTheme);
}

updateCounts();
