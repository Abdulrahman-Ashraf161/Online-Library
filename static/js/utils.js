function getBooksData() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

function saveBooksData(books) {
    localStorage.setItem('books', JSON.stringify(books));
}

function getUserData() {
    return JSON.parse(localStorage.getItem('user')) || {};
}

function saveUserData(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Utility functions
function validateForm() {
    console.log("Form validation");
    return true;
}

