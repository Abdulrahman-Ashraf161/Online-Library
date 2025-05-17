document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    const searchCategory = document.querySelector('.search-category');
    const searchInput = document.querySelector('.search-input');
    const booksGrid = document.querySelector('.books-grid');
    const adminPanel = document.getElementById('admin-panel');

    // Check if user is admin
    const userData = getUserData();
    if (userData.username === 'admin') {
        adminPanel.style.display = 'block';
    }

    // Load featured books
    const loadBooks = () => {
        booksGrid.innerHTML = '<p>Loading books...</p>';
        const books = getBooksData();
        console.log('Books loaded from localStorage:', books);

        // Check if books are loaded
        if (!books || books.length === 0) {
            booksGrid.innerHTML = '<p>No books available. Please load books from list-books.html first.</p>';
            return;
        }

        booksGrid.innerHTML = '';
        // Load specific books by ID for Hot Books section
        const hotBookIds = ['31', '32', '33', '34', '35', '36'];
        const hotBooks = books.filter(book => hotBookIds.includes(book.id));

        if (hotBooks.length === 0) {
            booksGrid.innerHTML = '<p>No hot books found. Please ensure the books are loaded in localStorage.</p>';
            return;
        }

        hotBooks.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book';
            bookDiv.innerHTML = `
                <img src="${book.image || 'https://via.placeholder.com/120x180'}" alt="${book.title}">
                <p>${book.title}</p>
            `;
            bookDiv.style.cursor = 'pointer';
            bookDiv.addEventListener('click', () => {
                console.log(`Clicked on book with ID: ${book.id}`);
                window.location.href = `view_book_details.html?bookId=${book.id}`;
            });
            booksGrid.appendChild(bookDiv);
        });
    };

    // Search functionality
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = searchCategory.value;
            const query = sanitizeInput(searchInput.value.toLowerCase());
            const books = getBooksData();

            const filteredBooks = books.filter(book => {
                const value = book[category]?.toLowerCase();
                return value?.includes(query);
            });

            booksGrid.innerHTML = '';
            filteredBooks.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.className = 'book';
                bookDiv.innerHTML = `
                    <img src="${book.image || 'https://via.placeholder.com/120x180'}" alt="${book.title}">
                    <p>${book.title}</p>
                `;
                bookDiv.style.cursor = 'pointer';
                bookDiv.addEventListener('click', () => {
                    console.log(`Clicked on search result book with ID: ${book.id}`); 
                    window.location.href = `view_book_details.html?bookId=${book.id}`;
                });
                booksGrid.appendChild(bookDiv);
            });
        });
    }

    // Initial load
    loadBooks();
});