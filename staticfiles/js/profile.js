document.addEventListener('DOMContentLoaded', () => {
    // Remove all client-side authentication logic
    // This was causing the redirect to Login.html
    
    // No need for getUserData() or any localStorage checks
    // Django handles authentication server-side

    // Just handle the sign out button click
    const signOutLink = document.querySelector('.sign-out a');
    if (signOutLink) {
        signOutLink.addEventListener('click', (e) => {
            // No need to prevent default since the link should work normally
            // e.preventDefault();
            // No need for manual redirect as the link already points to logout URL
        });
    }
});


