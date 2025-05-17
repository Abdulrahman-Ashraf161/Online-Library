// Ensure this script is loaded after utils.js if it contains getBooksData, saveBooksData, or sanitizeInput
// For Django integration, getBooksData and saveBooksData will be replaced by AJAX calls.

document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.querySelector(".search-input");
    // const searchCategorySelect = document.querySelector(".search-category"); // If needed for search logic
    const bookListContainer = document.getElementById("search-results-list") || document.querySelector(".book-list"); // General container
    const categorySections = {
        technology: document.querySelector(".book-list[data-category=\"Technology\"]"),
        kids: document.querySelector(".book-list[data-category=\"Kids\"]"),
        philosophy: document.querySelector(".book-list[data-category=\"Philosophy\"]"),
        horror: document.querySelector(".book-list[data-category=\"Horror\"]"),
        history: document.querySelector(".book-list[data-category=\"History\"]"),
    };

    // Function to display messages in modal
    function showModalMessage(message, isSuccess = true) {
        const modal = document.getElementById("messageModal");
        const modalMessageText = document.getElementById("modalMessageText");
        const closeButton = modal.querySelector(".close-button");

        modalMessageText.textContent = message;
        modalMessageText.className = isSuccess ? "success-message" : "error-message"; // Add classes for styling
        modal.style.display = "block";

        closeButton.onclick = function() {
            modal.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    // Function to render books (can be used for initial load and search results)
    function renderBooks(books, container) {
        container.innerHTML = ""; // Clear previous results
        if (books.length === 0) {
            container.innerHTML = "<p>No books found.</p>";
            return;
        }

        books.forEach(book => {
            const bookItem = document.createElement("div");
            bookItem.className = "book-item";
            bookItem.dataset.id = book.id;

            // Determine if current user is admin (this needs to be passed from Django template or a global JS var)
            // For now, let's assume a global variable `currentUserIsAdmin` is set in the template.
            // const isAdmin = typeof currentUserIsAdmin !== 'undefined' && currentUserIsAdmin;
            // A better way: check for admin-specific elements or rely on server to not send admin buttons for non-admins.

            let buttonsHTML = `
                <a href="/books/${book.id}/" class="details-button">View Details</a>
            `;

            // Check if user is authenticated (global var `currentUserIsAuthenticated`)
            // const isAuthenticated = typeof currentUserIsAuthenticated !== 'undefined' && currentUserIsAuthenticated;

            // The Django template now handles conditional button rendering, JS will handle actions.
            // We just need to ensure the buttons have correct data attributes for AJAX.
            
            // Placeholder for image - actual image path should come from book.image_url or similar
            const imageUrl = book.image_url || `/static/photos/default_book.png`;

            bookItem.innerHTML = `
                <img src="${imageUrl}" alt="${book.name}">
                <h3>${book.name}</h3>
                <p>Author: ${book.author}</p>
                <p>Category: ${book.category}</p>
                <p>Status: ${book.is_available ? "Available" : "Borrowed"}</p>
                ${buttonsHTML}
            `;
            
            // Add borrow button if it exists in the template-rendered HTML for this book
            const borrowButtonPlaceholder = document.querySelector(`.book-item[data-id='${book.id}'] .borrow-button`);
            if (borrowButtonPlaceholder) {
                 const borrowButton = document.createElement('button');
                 borrowButton.className = 'borrow-button';
                 borrowButton.dataset.bookId = book.id;
                 borrowButton.textContent = 'Borrow';
                 if (!book.is_available) borrowButton.disabled = true;
                 bookItem.appendChild(borrowButton);
            }

            // Add admin buttons if they exist
            const editLinkPlaceholder = document.querySelector(`.book-item[data-id='${book.id}'] .edit-button`);
            if (editLinkPlaceholder) {
                const editLink = document.createElement('a');
                editLink.href = `/admin/books/edit/${book.id}/`;
                editLink.className = 'edit-button';
                editLink.textContent = 'Edit';
                bookItem.appendChild(editLink);
            }
            const deleteButtonPlaceholder = document.querySelector(`.book-item[data-id='${book.id}'] .delete-button`);
            if (deleteButtonPlaceholder) {
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.dataset.bookId = book.id;
                deleteButton.dataset.deleteUrl = `/admin/books/delete/${book.id}/`;
                deleteButton.textContent = 'Delete';
                bookItem.appendChild(deleteButton);
            }

            container.appendChild(bookItem);
        });
    }

    // AJAX Search
    if (searchForm) {
        searchForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const query = searchInput.value;
            const searchURL = searchForm.action; // Get URL from form's action attribute
            
            fetch(`${searchURL}?q=${encodeURIComponent(query)}`, {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest", // Important for Django to recognize AJAX
                    "Accept": "application/json",
                },
            })
            .then(response => response.json())
            .then(data => {
                const resultsContainer = document.getElementById("search-results-list") || document.querySelector("section > .book-list"); // Fallback if specific ID not found
                if (!resultsContainer) {
                    console.error("Search results container not found");
                    return;
                }
                // Clear category sections if displaying search results in a general area
                Object.values(categorySections).forEach(sec => { if (sec) sec.innerHTML = ''; });
                document.querySelectorAll("section > h2").forEach(h2 => h2.style.display = 'none'); // Hide category titles
                
                const searchResultsTitle = document.createElement('h2');
                searchResultsTitle.textContent = `Search Results for "${query}"`;
                resultsContainer.parentNode.insertBefore(searchResultsTitle, resultsContainer); // Add title before results

                renderBooks(data.books, resultsContainer);
            })
            .catch(error => {
                console.error("Error during search:", error);
                showModalMessage("Search failed. Please try again.", false);
            });
        });
    }

    // Event delegation for borrow and delete buttons
    document.body.addEventListener("click", function(event) {
        // Borrow book
        if (event.target.classList.contains("borrow-button")) {
            event.preventDefault();
            const bookId = event.target.dataset.bookId;
            const borrowURL = `/books/borrow/${bookId}/`; // Construct URL

            fetch(borrowURL, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken, // Defined in the HTML template
                },
            })
            .then(response => response.json().then(data => ({status: response.status, body: data})))
            .then(({status, body}) => {
                if (status === 200 && body.status === "success") {
                    showModalMessage(body.message || "Book borrowed successfully!");
                    event.target.textContent = "Borrowed";
                    event.target.disabled = true;
                    // Optionally, update the status text on the page
                    const statusElement = event.target.closest('.book-item').querySelector('p:nth-of-type(3)'); // Assuming status is the 3rd <p>
                    if(statusElement) statusElement.textContent = "Status: Borrowed";
                } else {
                    showModalMessage(body.message || "Failed to borrow book.", false);
                }
            })
            .catch(error => {
                console.error("Error borrowing book:", error);
                showModalMessage("An error occurred. Please try again.", false);
            });
        }

        // Delete book (Admin)
        if (event.target.classList.contains("delete-button")) {
            event.preventDefault();
            const bookId = event.target.dataset.bookId;
            const deleteURL = event.target.dataset.deleteUrl; // Get URL from button's data attribute

            if (!deleteURL) {
                console.error("Delete URL not found on button");
                return;
            }

            if (confirm("Are you sure you want to delete this book?")) {
                fetch(deleteURL, {
                    method: "POST", // Or DELETE, if your backend supports it and CSRF is handled
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                })
                .then(response => response.json().then(data => ({status: response.status, body: data})))
                .then(({status, body}) => {
                    if (status === 200 && body.status === "success") {
                        showModalMessage(body.message || "Book deleted successfully!");
                        event.target.closest(".book-item").remove(); // Remove book item from DOM
                    } else {
                        showModalMessage(body.message || "Failed to delete book.", false);
                    }
                })
                .catch(error => {
                    console.error("Error deleting book:", error);
                    showModalMessage("An error occurred. Please try again.", false);
                });
            }
        }
    });

    // Initial load of books (if not search results page)
    // This part might need adjustment based on how initial books are loaded by Django template.
    // If Django already renders all books, this JS initial load might not be needed or
    // could be used to enhance already rendered static HTML with dynamic buttons if necessary.
    // For now, assuming Django template handles initial rendering of categorized books.

});

