document.addEventListener('DOMContentLoaded', function() {
    // Get all borrow buttons
    const borrowButtons = document.querySelectorAll('.borrow-button');
    
    // Add click event listeners to borrow buttons
    borrowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-book-id');
            borrowBook(bookId);
        });
    });
    
    // Function to handle book borrowing via AJAX
    function borrowBook(bookId) {
        // Get CSRF token from cookie
        const csrftoken = getCookie('csrftoken');
        
        fetch(`/books/borrow/${bookId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Book borrowed successfully!');
                // Reload page to show updated status
                window.location.reload();
            } else {
                alert(data.message || 'Failed to borrow book.');
            }
        })
        .catch(error => {
            console.error('Error borrowing book:', error);
            alert('An error occurred. Please try again.');
        });
    }
    
    // Helper function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
