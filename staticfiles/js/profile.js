document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();

    if (!userData.email) {
        window.location.href = 'Login.html';
        return;
    }

    const profileHeader = document.querySelector('.profile-header');
    
    if (userData.firstName && userData.lastName) {
        profileHeader.querySelector('h3').textContent = `${sanitizeInput(userData.firstName)} ${sanitizeInput(userData.lastName)}`;
    } else {
        profileHeader.querySelector('h3').textContent = 'Unknown User';
    }

    const profilePicture = profileHeader.querySelector('#profile-picture');
    if (userData.profilePicture) {
        profilePicture.src = userData.profilePicture;
    } else {
        profilePicture.src = '../images/default-profile.png'; // صورة افتراضية
    }

    const signOutLink = document.querySelector('.sign-out a');
    signOutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('borrowedBooks');
        alert('Signed out successfully!');
        window.location.href = 'Login.html';
    });
});