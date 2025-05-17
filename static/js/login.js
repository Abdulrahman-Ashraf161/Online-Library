document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-container form');
    const loginButton = document.querySelector('.login-button');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#fd2c2c';
    errorDiv.style.display = 'none';
    form.insertBefore(errorDiv, loginButton);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        const users = JSON.parse(localStorage.getItem('users')) || [];

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            errorDiv.textContent = 'Invalid email or password.';
            errorDiv.style.display = 'block';
            return;
        }

        localStorage.setItem('user', JSON.stringify(user));
        errorDiv.style.color = '#27ae60';
        errorDiv.textContent = 'Login successful!';
        errorDiv.style.display = 'block';
        setTimeout(() => {
            try {
                window.location.href = 'profile.html';
            } catch (err) {
                errorDiv.style.color = '#fd2c2c';
                errorDiv.textContent = 'Error: profile.html not found. Please check the file path.';
                errorDiv.style.display = 'block';
            }
        }, 1000);
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