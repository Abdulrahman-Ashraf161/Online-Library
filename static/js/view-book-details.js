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
        
        // Disable button to prevent multiple clicks
        const borrowButton = document.querySelector(`.borrow-button[data-book-id="${bookId}"]`);
        if (borrowButton) {
            borrowButton.disabled = true;
            borrowButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
        
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
                // Show success message
                showMessage(data.message || 'Book borrowed successfully!', true);
                
                // Update book quantity display if it exists
                const quantityElement = document.querySelector('.book-quantity');
                if (quantityElement) {
                    const currentQuantity = parseInt(quantityElement.textContent.match(/\d+/)[0]);
                    const newQuantity = Math.max(0, currentQuantity - 1);
                    quantityElement.textContent = `Available Copies: ${newQuantity}`;
                    
                    // If no more copies, disable the borrow button
                    if (newQuantity === 0 && borrowButton) {
                        borrowButton.disabled = true;
                        borrowButton.innerHTML = '<i class="fas fa-times"></i> Not Available';
                        borrowButton.classList.add('not-available');
                    } else if (borrowButton) {
                        // Re-enable the button for additional borrowing
                        borrowButton.disabled = false;
                        borrowButton.innerHTML = '<i class="fas fa-book"></i> Borrow Book';
                    }
                } else if (borrowButton) {
                    // If we can't find the quantity element, just re-enable the button
                    borrowButton.disabled = false;
                    borrowButton.innerHTML = '<i class="fas fa-book"></i> Borrow Book';
                }
                
                // Add the book to the borrowed books section if it exists
                addToBorrowedBooks(data.book_data);
            } else {
                // Show error message
                showMessage(data.message || 'Failed to borrow book.', false);
                
                // Re-enable button
                if (borrowButton) {
                    borrowButton.disabled = false;
                    borrowButton.innerHTML = '<i class="fas fa-book"></i> Borrow Book';
                }
            }
        })
        .catch(error => {
            console.error('Error borrowing book:', error);
            showMessage('An error occurred. Please try again.', false);
            
            // Re-enable button
            if (borrowButton) {
                borrowButton.disabled = false;
                borrowButton.innerHTML = '<i class="fas fa-book"></i> Borrow Book';
            }
        });
    }
    
    // Function to add the book to the borrowed books section
    function addToBorrowedBooks(bookData) {
        const borrowedBooksSection = document.querySelector('.borrowed-books-section');
        if (!borrowedBooksSection) return;
        
        // Create a new borrowed book element
        const borrowedBookElement = document.createElement('div');
        borrowedBookElement.className = 'borrowed-book';
        borrowedBookElement.innerHTML = `
            <div class="book-image">
                <img src="${bookData.image_url || '/static/photos/default_book.png'}" alt="${bookData.title}">
            </div>
            <div class="book-info">
                <h4>${bookData.title}</h4>
                <p>Author: ${bookData.author}</p>
                <p>Borrowed: ${bookData.borrowed_date}</p>
                <p>Due: ${bookData.due_date}</p>
            </div>
        `;
        
        // Add to the borrowed books section
        const borrowedBooksList = borrowedBooksSection.querySelector('.borrowed-books-list') || borrowedBooksSection;
        borrowedBooksList.appendChild(borrowedBookElement);
        
        // Show the section if it was hidden
        borrowedBooksSection.style.display = 'block';
    }
    
    // Function to show messages
    function showMessage(message, isSuccess) {
        const messageContainer = document.querySelector('.message-container') || createMessageContainer();
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isSuccess ? 'success' : 'error'}`;
        messageElement.innerHTML = `
            <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="close-message"><i class="fas fa-times"></i></button>
        `;
        
        messageContainer.appendChild(messageElement);
        
        // Add event listener to close button
        messageElement.querySelector('.close-message').addEventListener('click', function() {
            messageElement.remove();
            if (messageContainer.children.length === 0) {
                messageContainer.style.display = 'none';
            }
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
                if (messageContainer.children.length === 0) {
                    messageContainer.style.display = 'none';
                }
            }
        }, 5000);
    }
    
    // Function to create message container if it doesn't exist
    function createMessageContainer() {
        const container = document.createElement('div');
        container.className = 'message-container';
        document.body.appendChild(container);
        return container;
    }
    
    // Function to get CSRF token from cookies
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

