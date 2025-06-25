document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.edit-form form');
    const coverPreview = document.getElementById('cover-preview');
    const bookIdInput = document.getElementById('book-id');
    const titleInput = document.getElementById('book-title');
    const authorInput = document.getElementById('book-author');
    const categoryInput = document.getElementById('book-category');
    const descriptionInput = document.getElementById('book-description');
    const imageInput = document.getElementById('book-image');
    const quantityInput = document.getElementById('book-quantity');
    const statusInput = document.getElementById('book-status');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#fd2c2c';
    errorDiv.style.display = 'none';
    form.prepend(errorDiv);

    // Get bookId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');

    // Load book data
    const books = getBooksData();
    const book = books.find(b => b.id === bookId);

    if (book) {
        bookIdInput.value = book.id;
        titleInput.value = book.title || '';
        authorInput.value = book.author || '';
        categoryInput.value = book.category || '';
        descriptionInput.value = book.description || '';
        imageInput.value = book.image || '';
        quantityInput.value = book.quantity || 1;
        statusInput.value = book.status || 'Available';
        coverPreview.src = book.image || 'https://via.placeholder.com/300x400';
    } else {
        errorDiv.textContent = 'Book not found.';
        errorDiv.style.display = 'block';
        form.querySelector('.save-button').disabled = true;
    }

    // Update cover preview on image URL change
    imageInput.addEventListener('input', () => {
        const imageUrl = imageInput.value.trim();
        coverPreview.src = imageUrl || 'https://via.placeholder.com/300x400';
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        // Validate inputs
        if (!titleInput.value.trim()) {
            errorDiv.textContent = 'Title is required.';
            errorDiv.style.display = 'block';
            return;
        }
        if (!authorInput.value.trim()) {
            errorDiv.textContent = 'Author is required.';
            errorDiv.style.display = 'block';
            return;
        }
        if (!categoryInput.value.trim()) {
            errorDiv.textContent = 'Category is required.';
            errorDiv.style.display = 'block';
            return;
        }
        if (imageInput.value.trim() && !isValidUrl(imageInput.value.trim())) {
            errorDiv.textContent = 'Please enter a valid image URL.';
            errorDiv.style.display = 'block';
            return;
        }

        const updatedBook = {
            id: bookIdInput.value,
            title: sanitizeInput(titleInput.value.trim()),
            author: sanitizeInput(authorInput.value.trim()),
            category: sanitizeInput(categoryInput.value.trim()),
            description: sanitizeInput(descriptionInput.value.trim()),
            image: imageInput.value.trim() || 'https://via.placeholder.com/300x400',
            quantity: quantityInput.value.trim() || 1,
            status: statusInput.value,
            published: book?.published || 'N/A',
            language: book?.language || 'English'
        };

        const index = books.findIndex(b => b.id === bookId);
        if (index !== -1) {
            books[index] = updatedBook;
            saveBooksData(books);
            errorDiv.style.color = '#27ae60';
            errorDiv.textContent = 'Book updated successfully!';
            errorDiv.style.display = 'block';
            setTimeout(() => {
                window.location.href = `view_book_details.html?bookId=${bookId}`;
            }, 1000);
        } else {
            errorDiv.textContent = 'Error updating book.';
            errorDiv.style.display = 'block';
        }
    });

    // Helper function to validate URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});
