document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const booksGrid = document.querySelector('.books-grid');
    const searchForm = document.getElementById('search-form');
    
    // Handle search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchQuery = document.getElementById('search-input').value;
            
            // Redirect to search page with query parameter
            window.location.href = `/books/search/?q=${encodeURIComponent(searchQuery)}`;
        });
    }
    
    // Add click event listeners to book elements
    if (booksGrid) {
        const bookElements = booksGrid.querySelectorAll('.book');
        bookElements.forEach(book => {
            book.addEventListener('click', function() {
                const bookId = this.getAttribute('data-id');
                if (bookId) {
                    window.location.href = `/books/${bookId}/`;
                }
            });
        });
    }
});
