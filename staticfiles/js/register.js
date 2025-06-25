// register.js - Updated for Django integration
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form#registerForm"); // Assuming your form has id="registerForm"
    
    if (form) {
        const submitButton = form.querySelector("button[type=\"submit\"]");
        let errorDiv = form.querySelector(".error-message-container"); // Look for an existing error container

        if (!errorDiv) { // Create one if it doesn't exist
            errorDiv = document.createElement("div");
            errorDiv.className = "error-message-container"; // General container for error messages
            // Insert before the submit button or at a specific place
            if (submitButton) {
                form.insertBefore(errorDiv, submitButton);
            } else {
                form.appendChild(errorDiv); // Fallback
            }
        }

        form.addEventListener("submit", function(event) {
            // Client-side validation before submitting to Django
            errorDiv.innerHTML = ""; // Clear previous errors
            let isValid = true;
            let errorMessages = [];

            const usernameInput = form.querySelector("input[name=\"username\"]");
            const emailInput = form.querySelector("input[name=\"email\"]");
            const passwordInput = form.querySelector("input[name=\"password\"]"); // Django uses password1
            const password1Input = form.querySelector("input[name=\"password1\"]");
            const password2Input = form.querySelector("input[name=\"password2\"]");
            
            // Username validation (basic)
            if (usernameInput && usernameInput.value.trim() === "") {
                errorMessages.push("Username is required.");
                isValid = false;
            }

            // Email validation
            if (emailInput) {
                const email = emailInput.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (email === "") {
                    errorMessages.push("Email is required.");
                    isValid = false;
                } else if (!emailRegex.test(email)) {
                    errorMessages.push("Please enter a valid email address.");
                    isValid = false;
                }
            }

            // Password validation
            let mainPassword = null;
            if (password1Input && password2Input) { // Standard Django UserCreationForm fields
                mainPassword = password1Input.value;
                if (password1Input.value.length < 8) {
                    errorMessages.push("Password must be at least 8 characters long.");
                    isValid = false;
                }
                if (password1Input.value !== password2Input.value) {
                    errorMessages.push("Passwords do not match.");
                    isValid = false;
                }
            } else if (passwordInput) { // If using a single password field (less common for signup)
                 mainPassword = passwordInput.value;
                 if (mainPassword.length < 8) {
                    errorMessages.push("Password must be at least 8 characters long.");
                    isValid = false;
                }
                // Add confirm password field to your HTML or handle differently
                const confirmPasswordInput = form.querySelector("input[name=\"confirmPassword\"]");
                 if (confirmPasswordInput && mainPassword !== confirmPasswordInput.value){
                    errorMessages.push("Passwords do not match.");
                    isValid = false;
                 }
            }

            if (!isValid) {
                event.preventDefault(); // Stop form submission
                errorMessages.forEach(msg => {
                    const p = document.createElement("p");
                    p.className = "error-message";
                    p.textContent = msg;
                    errorDiv.appendChild(p);
                });
                errorDiv.style.display = "block";
            } else {
                // If client-side validation passes, the form will submit normally to Django
                // Django will then perform server-side validation.
                // Success/error messages from Django will be handled by template rendering.
                errorDiv.style.display = "none"; 
            }
        });
    }
});

// Remove or comment out XLSX and localStorage specific functions if not used elsewhere
/*
var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};

function filledCell(cell) {
    return cell !== '' && cell != null;
}

function loadFileData(filename) {
    // ... (original XLSX logic) ...
}

function sanitizeInput(input) { // Keep if used for general sanitization, but Django handles XSS
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}
*/

