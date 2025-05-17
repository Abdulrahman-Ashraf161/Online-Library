document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.querySelector('.auth-form');
    const adminContent = document.querySelector('.admin-content');
    const newBookForm = document.getElementById('new-book-form');
    const booksTable = document.querySelector('.books-table tbody');
    const deleteModal = document.getElementById('delete-modal');
    const refreshBtn = document.getElementById('refresh-btn');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#fd2c2c';
    errorDiv.style.display = 'none';
    authForm.appendChild(errorDiv);

    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

    // Hide admin content initially unless logged in
    if (!isAdminLoggedIn) {
        adminContent.style.display = 'none';
    } else {
        adminContent.style.display = 'block';
    }

    // Admin authentication (hardcoded for demo)
    const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Set admin as logged in
            localStorage.setItem('adminLoggedIn', 'true');
            adminContent.style.display = 'block';
            authForm.style.display = 'none'; // Hide the login form after successful login
        } else {
            errorDiv.textContent = 'Invalid username or password.';
            errorDiv.style.display = 'block';
            localStorage.setItem('adminLoggedIn', 'false');
            adminContent.style.display = 'none';
        }
    });

    // Load books from localStorage
    const loadBooks = () => {
        const books = getBooksData() || [
            { id: '1', title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', image: 'https://m.media-amazon.com/images/I/41xShlnTZTL._SY425_.jpg', status: 'Available', description: 'A handbook of agile software craftsmanship.', pages: '464', published: '2008', language: 'English' },
            { id: '2', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen et al.', category: 'Technology', image: 'https://m.media-amazon.com/images/I/41SNoh5ZhOL._SY425_.jpg', status: 'Available', description: 'A comprehensive guide to algorithms.', pages: '1312', published: '2009', language: 'English' },
            { id: '3', title: 'The Web Application Hacker\'s Handbook', author: 'Dafydd Stuttard & Marcus Pinto', category: 'Computer Security', image: 'https://m.media-amazon.com/images/I/51XwG0Qn1VL._SY425_.jpg', status: 'Not Available', description: 'A guide to web application security.', pages: '912', published: '2011', language: 'English' },
            { id: '4', title: 'Design Patterns', author: 'Erich Gamma et al.', category: 'Technology', image: 'https://m.media-amazon.com/images/I/51k+BvsOl2L._SY425_.jpg', status: 'Available', description: 'Reusable solutions to common software design problems.', pages: '395', published: '1994', language: 'English' }
        ];
        renderBooks(books);
        saveBooksData(books);
    };

    // Render books in table
    const renderBooks = (books) => {
        booksTable.innerHTML = '';
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${book.image || ''}" alt="${book.title}" class="book-cover"></td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category || ''}</td>
                <td class="action-btns">
                    <a href="edit_book_details.html?bookId=${book.id}" class="btn btn-edit btn-sm">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <button class="btn btn-delete btn-sm delete-btn" data-id="${book.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            booksTable.appendChild(row);
        });
    };

    // Add new book
    newBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const books = getBooksData();
        const newBook = {
            id: document.getElementById('book-id').value || Date.now().toString(),
            title: sanitizeInput(document.getElementById('book-title').value),
            author: sanitizeInput(document.getElementById('book-author').value),
            category: document.getElementById('book-category').value,
            image: document.getElementById('book-image').value,
            pages: document.getElementById('book-pages').value,
            description: sanitizeInput(document.getElementById('book-description').value),
            status: 'Available',
            published: 'N/A',
            language: 'English'
        };

        books.push(newBook);
        saveBooksData(books);
        renderBooks(books);
        newBookForm.reset();
    });

    // Handle edit and delete buttons
    booksTable.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const bookId = e.target.closest('.delete-btn').dataset.id;
            const books = getBooksData();
            const book = books.find(b => b.id === bookId);

            document.getElementById('delete-book-id').value = book.id;
            document.getElementById('delete-book-title').textContent = book.title;
            document.getElementById('delete-book-author').textContent = book.author;

            deleteModal.style.display = 'flex';
        }
    });

    // Confirm deletion
    document.getElementById('confirm-delete').addEventListener('click', () => {
        const bookId = document.getElementById('delete-book-id').value;
        let books = getBooksData();
        let borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
        books = books.filter(b => b.id !== bookId);
        borrowedBooks = borrowedBooks.filter(b => b.id !== bookId);
        saveBooksData(books);
        localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));
        renderBooks(books);
        deleteModal.style.display = 'none';
        const successDiv = document.createElement('div');
        successDiv.className = 'error-message';
        successDiv.style.color = '#27ae60';
        successDiv.textContent = 'Book deleted successfully!';
        successDiv.style.display = 'block';
        document.querySelector('.books-table').prepend(successDiv);
        setTimeout(() => successDiv.remove(), 2000);
    });

    // Close modals
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });
    });

    // Refresh books
    refreshBtn.addEventListener('click', loadBooks);

    // Initial load
    loadBooks();
});