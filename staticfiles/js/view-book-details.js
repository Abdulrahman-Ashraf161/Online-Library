document.addEventListener('DOMContentLoaded', () => {
    const bookCover = document.querySelector('.book-cover img');
    const bookTitle = document.querySelector('.book-title');
    const bookAuthor = document.querySelector('.book-author');
    const detailsGrid = document.querySelector('.details-grid');
    const description = document.querySelector('.description p');
    const borrowButton = document.querySelector('.borrow-button');

    // Get bookId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');

    const books = getBooksData();
    const book = books.find(b => b.id === bookId);

    if (book) {
        bookCover.src = book.image || 'https://via.placeholder.com/300x400';
        bookCover.alt = book.title || 'Book Cover';
        bookTitle.textContent = book.title || 'Unknown Title';
        bookAuthor.textContent = `by ${book.author || 'Unknown Author'}`;
        detailsGrid.innerHTML = `
            <div class="detail-label">ID:</div>
            <div class="detail-value">${book.id}</div>
            <div class="detail-label">Category:</div>
            <div class="detail-value">${book.category || 'N/A'}</div>
            <div class="detail-label">Published:</div>
            <div class="detail-value">${book.published || 'N/A'}</div>
            <div class="detail-label">Pages:</div>
            <div class="detail-value">${book.pages || 'N/A'}</div>
            <div class="detail-label">Language:</div>
            <div class="detail-value">${book.language || 'English'}</div>
            <div class="detail-label">Status:</div>
            <div class="detail-value">
                <span class="status ${book.status?.toLowerCase().replace(' ', '-') || 'not-available'}">
                    ${book.status || 'Not Available'}
                </span>
            </div>
        `;
        description.textContent = book.description || 'No description available.';
    } else {
        bookTitle.textContent = 'Book Not Found';
        bookAuthor.textContent = '';
        detailsGrid.innerHTML = `
            <div class="detail-label">ID:</div>
            <div class="detail-value">${bookId}</div>
            <div class="detail-label">Category:</div>
            <div class="detail-value">N/A</div>
            <div class="detail-label">Published:</div>
            <div class="detail-value">N/A</div>
            <div class="detail-label">Pages:</div>
            <div class="detail-value">N/A</div>
            <div class="detail-label">Language:</div>
            <div class="detail-value">N/A</div>
            <div class="detail-label">Status:</div>
            <div class="detail-value">
                <span class="status not-available">Not Available</span>
            </div>
        `;
        description.textContent = 'Book not found in the library.';
        borrowButton.style.display = 'none';
    }

    // Handle Borrow button
    borrowButton.addEventListener('click', () => {
        if (!book) {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'Book not found.';
            errorDiv.style.color = '#fd2c2c';
            errorDiv.style.marginTop = '10px';
            borrowButton.after(errorDiv);
            setTimeout(() => errorDiv.remove(), 2000);
            return;
        }

        if (book.status !== 'Available') {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'This book is not available for borrowing.';
            errorDiv.style.color = '#fd2c2c';
            errorDiv.style.marginTop = '10px';
            borrowButton.after(errorDiv);
            setTimeout(() => errorDiv.remove(), 2000);
            return;
        }

        let borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
        if (!borrowedBooks.find(b => b.id === book.id)) {
            borrowedBooks.push(book);
            localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));
            book.status = 'Not Available';
            saveBooksData(books);
            const successDiv = document.createElement('div');
            successDiv.textContent = 'Book borrowed successfully!';
            successDiv.style.color = '#27ae60';
            successDiv.style.marginTop = '10px';
            borrowButton.after(successDiv);
            setTimeout(() => {
                successDiv.remove();
                window.location.href = 'MyBooks.html';
            }, 1000);
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'You have already borrowed this book.';
            errorDiv.style.color = '#fd2c2c';
            errorDiv.style.marginTop = '10px';
            borrowButton.after(errorDiv);
            setTimeout(() => errorDiv.remove(), 2000);
        }
    });
});