let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
    const searchTerm = word.toLowerCase();

    return notes.filter(note =>
        note.text.toLowerCase().includes(searchTerm)
    );
}

function longestNote() {
    if (notes.length === 0) {
        return null;
    }

    let longest = notes[0];

    for (const note of notes) {
        if (note.text.length > longest.text.length) {
            longest = note;
        }
    }

    return longest;
}

function countByCategory() {
    const counts = {};

    for (const note of notes) {
        if (counts[note.category]) {
            counts[note.category]++;
        } else {
            counts[note.category] = 1;
        }
    }

    return counts;
}

function getSummary() {
    const counts = countByCategory();
    const total = notes.length;
    const noteWord = total === 1 ? "note" : "notes";

    return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

function isDuplicate(text) {
    const normalizedText = text.trim().toLowerCase().replace(/\s+/g, " ");

    return notes.some(note =>
        note.text.trim().toLowerCase().replace(/\s+/g, " ") === normalizedText
    );
}

function addNote(text, category) {
    const trimmedText = text.trim();

    if (trimmedText.length < 1 || trimmedText.length > 200) {
        console.log("Note must be between 1 and 200 characters.");
        return false;
    }

    if (isDuplicate(trimmedText)) {
        console.log("Note is a duplicate.");
        return false;
    }

    const validCategories = ["personal", "work", "study"];

    if (!validCategories.includes(category)) {
        console.log("Invalid category.");
        return false;
    }

    const newId = notes.length > 0
        ? Math.max(...notes.map(note => note.id)) + 1
        : 1;

    notes.push({
        id: newId,
        text: trimmedText,
        category: category
    });

    return true;
}

console.log(searchNotes("javascript")); // Expected: [{ id: 4, text: "Revise JavaScript arrays", category: "study" }]
console.log(searchNotes("python")); // Expected: []

console.log(longestNote()); // Expected: { id: 3, text: "Email the project report to Grace", category: "work" }
notes = [];
console.log(longestNote()); // Expected: null

notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];

console.log(countByCategory()); // Expected: { personal: 2, study: 2, work: 1 }
console.log(countByCategory().personal); // Expected: 2

console.log(getSummary()); // Expected: "5 notes: 2 personal, 1 work, 2 study."
notes = [{ id: 1, text: "Only one note", category: "personal" }];
console.log(getSummary()); // Expected: "1 note: 1 personal, 0 work, 0 study."

notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];

console.log(isDuplicate("Buy milk and bread")); // Expected: true
console.log(isDuplicate("  BUY MILK AND BREAD  ")); // Expected: true

console.log(addNote("Learn JavaScript functions", "study")); // Expected: true
console.log(addNote("Buy milk and bread", "personal")); // Expected: false (duplicate)
console.log(addNote("New valid note", "invalid")); // Expected: false (invalid category)
console.log(addNote("", "personal")); // Expected: false (invalid length)

console.log(isDuplicate("Buy  milk   and bread")); // Expected: true
