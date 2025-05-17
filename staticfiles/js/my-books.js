document.addEventListener('DOMContentLoaded', () => {
    const bookList = document.querySelector('.book-list');

    const loadBorrowedBooks = () => {
        const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
        bookList.innerHTML = '';

        if (!borrowedBooks.length) {
            bookList.innerHTML = '<div class="no-books-message"><p>No books borrowed yet.</p></div>';
            return;
        }

        borrowedBooks.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book';
            bookDiv.innerHTML = `
                <div class="book-image">
                    <img src="${book.image || 'https://via.placeholder.com/120x180'}" alt="${book.title}">
                </div>
                <h3>${book.title}</h3>
                <button class="return-btn" data-id="${book.id}">Return</button>
            `;
            bookList.appendChild(bookDiv);
        });
    };

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('return-btn')) {
            const bookId = e.target.dataset.id;
            let borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
            let books = getBooksData();

            // Remove book from borrowedBooks
            borrowedBooks = borrowedBooks.filter(b => b.id !== bookId);
            localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));

            // Update book status in books data
            const book = books.find(b => b.id === bookId);
            if (book) {
                book.status = 'Available';
                saveBooksData(books);
            }

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.textContent = 'Book returned successfully!';
            successDiv.style.color = '#27ae60';
            successDiv.style.marginTop = '10px';
            e.target.after(successDiv);
            setTimeout(() => {
                successDiv.remove();
                loadBorrowedBooks();
            }, 1000);
        }
    });

    loadBorrowedBooks();
});