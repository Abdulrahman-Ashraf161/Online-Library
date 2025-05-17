document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.edit-profile-form');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const birthdateInput = document.getElementById('birthdate');
    const emailInput = document.getElementById('email');
    const profilePictureInput = document.getElementById('profilePicture');
    const profilePicturePreview = document.getElementById('profilePicturePreview');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#fd2c2c';
    errorDiv.style.display = 'none';
    form.insertBefore(errorDiv, form.querySelector('.save-button'));

    const userData = getUserData();
    firstNameInput.value = userData.firstName || '';
    lastNameInput.value = userData.lastName || '';
    birthdateInput.value = userData.birthdate || '';
    emailInput.value = userData.email || '';
    if (userData.profilePicture) {
        profilePicturePreview.src = userData.profilePicture;
        profilePicturePreview.style.display = 'block';
    }

    // معاينة الصورة لما المستخدم يختار صورة
    profilePictureInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePicturePreview.src = event.target.result;
                profilePicturePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        // فاليديشن
        if (!firstNameInput.value.trim()) {
            errorDiv.textContent = 'First name is required.';
            errorDiv.style.display = 'block';
            return;
        }

        if (!lastNameInput.value.trim()) {
            errorDiv.textContent = 'Last name is required.';
            errorDiv.style.display = 'block';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            errorDiv.textContent = 'Please enter a valid email address.';
            errorDiv.style.display = 'block';
            return;
        }

        const oldEmail = userData.email;

        const updatedUserData = {
            ...userData,
            firstName: sanitizeInput(firstNameInput.value),
            lastName: sanitizeInput(lastNameInput.value),
            birthdate: birthdateInput.value,
            email: emailInput.value,
            profilePicture: profilePicturePreview.src || userData.profilePicture || ''
        };

        saveUserData(updatedUserData);

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === oldEmail);
        if (userIndex !== -1) {
            users[userIndex] = updatedUserData;
            localStorage.setItem('users', JSON.stringify(users));
        }

        errorDiv.style.color = '#27ae60';
        errorDiv.textContent = 'Profile updated successfully!';
        errorDiv.style.display = 'block';
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
    });
});