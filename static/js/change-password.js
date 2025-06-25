document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.change-password-form');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#fd2c2c';
    errorDiv.style.display = 'none';
    form.insertBefore(errorDiv, form.querySelector('.save-button'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentPassword = form.querySelector('input[placeholder="Enter current password"]').value;
        const newPassword = form.querySelector('input[placeholder="Enter new password"]').value;
        const confirmPassword = form.querySelector('input[placeholder="Confirm new password"]').value;

        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        // فاليديشن
        if (!currentPassword.trim()) {
            errorDiv.textContent = 'Current password is required.';
            errorDiv.style.display = 'block';
            return;
        }

        const userData = getUserData();

        if (currentPassword !== userData.password) {
            errorDiv.textContent = 'Current password is incorrect.';
            errorDiv.style.display = 'block';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorDiv.textContent = 'New password and confirm password do not match.';
            errorDiv.style.display = 'block';
            return;
        }

        if (newPassword.length < 8) {
            errorDiv.textContent = 'New password must be at least 8 characters long.';
            errorDiv.style.display = 'block';
            return;
        }

        userData.password = newPassword;
        saveUserData(userData);

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === userData.email);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
        }

        errorDiv.style.color = '#27ae60';
        errorDiv.textContent = 'Password changed successfully!';
        errorDiv.style.display = 'block';
        form.reset();
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
    });
});

var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};

function filledCell(cell) {
    return cell !== '' && cell != null;
}

function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];

            // Convert sheet to JSON to filter blank rows
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            // Filter out blank rows (rows where all cells are empty, null, or undefined)
            var filteredData = jsonData.filter(row => row.some(filledCell));

            // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
            var headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            // Fallback
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }

            // Convert filtered JSON back to CSV
            var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // Create a new sheet from filtered array of arrays
            csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
            return csv;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
    return gk_fileData[filename] || "";
}