document.addEventListener("DOMContentLoaded", function () {
  console.log("My Books page loaded");

  // Helper function to format dates
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Function to get CSRF token
  function getCsrfToken() {
    const cookieName = "csrftoken";
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, cookieName.length + 1) === cookieName + "=") {
          cookieValue = decodeURIComponent(
            cookie.substring(cookieName.length + 1)
          );
          break;
        }
      }
    }
    return cookieValue;
  }

  // Function to show success notification
  function showSuccess(message, title = "Success") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = "notification success";
    
    // Add HTML content with title and message
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-title">${title}</span>
        <button class="close-btn">&times;</button>
      </div>
      <div class="notification-body">
        ${message}
      </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);
    
    // Set up close button
    notification.querySelector(".close-btn").addEventListener("click", function() {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Function to show error notification
  function showError(message, title = "Error") {
    // Similar to showSuccess but with error styling
    const notification = document.createElement("div");
    notification.className = "notification error";
    
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-title">${title}</span>
        <button class="close-btn">&times;</button>
      </div>
      <div class="notification-body">
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);
    
    notification.querySelector(".close-btn").addEventListener("click", function() {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Function to load borrowed books from server
  function loadBorrowedBooks() {
    const bookList = document.querySelector(".book-list");
    if (!bookList) return;

    // Show loading state
    bookList.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading your books...</p>
      </div>
    `;

    // Fetch borrowed books from server
    fetch('/my-books/data/', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => {
      // Clear existing content
      bookList.innerHTML = "";

      if (data.borrowed_books.length === 0) {
        // Show message if no books borrowed
        bookList.innerHTML = `
          <div class="no-books-message">
            <p>You haven't borrowed any books yet.</p>
            <div class="browse-books-btn-container">
              <a href="/books/" class="browse-books-btn">Browse Books</a>
            </div>
          </div>
        `;
        return;
      }

      // Add each borrowed book to the list
      data.borrowed_books.forEach((book) => {
        const bookItem = document.createElement("div");
        bookItem.className = "book-item";
        bookItem.dataset.id = book.id;

        bookItem.innerHTML = `
          <div class="book-image">
            <img src="${book.image_url || "/static/photos/default_book.png"}" alt="${book.title}">
          </div>
          <div class="book-info">
            <h3>${book.title}</h3>
            <p>Due: ${formatDate(book.due_date)}</p>
          </div>
          <div class="book-actions">
            <a href="/books/details/${book.id}/" class="details-btn">Details</a>
            <button class="return-btn" data-book-id="${book.id}">Return</button>
          </div>
        `;

        bookList.appendChild(bookItem);
      });
    })
    .catch(error => {
      console.error('Error loading borrowed books:', error);
      bookList.innerHTML = `
        <div class="error-message">
          <p>Failed to load your books. Please try again later.</p>
          <button onclick="loadBorrowedBooks()" class="retry-btn">Retry</button>
        </div>
      `;
    });
  }

  // Add event delegation for return buttons
  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("return-btn")) {
      event.preventDefault();
      console.log("Return button clicked");

      const bookId = event.target.getAttribute("data-book-id");
      console.log("Book ID:", bookId);

      if (!bookId) {
        console.error("No book ID found on button");
        return;
      }

      // Get the book item
      const bookItem = event.target.closest(".book-item");
      const bookTitle = bookItem.querySelector("h3").textContent;

      // Show loading state
      event.target.textContent = "Returning...";
      event.target.disabled = true;

      // Send AJAX request to server
      const csrfToken = getCsrfToken();
      const returnURL = `/books/return/${bookId}/`;

      fetch(returnURL, {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Response data:", data);
          
          if (data.status === 'success') {
            // Show success message
            showSuccess(`"${bookTitle}" has been returned successfully!`);

            // Animate removal of book item
            bookItem.style.opacity = "0";
            setTimeout(() => {
              bookItem.remove();

              // Check if there are no more books
              if (document.querySelectorAll('.book-item').length === 0) {
                loadBorrowedBooks(); // This will show the "no books" message
              }
            }, 300);
          } else {
            // Reset button if error
            event.target.textContent = "Return";
            event.target.disabled = false;
            
            // Show error message
            showError(data.message || "Failed to return book");
          }
        })
        .catch((error) => {
          console.error("Error returning book:", error);
          
          // Reset button if error
          event.target.textContent = "Return";
          event.target.disabled = false;
          
          showError("Error connecting to server. Please try again.");
        });
    }
  });

  // Load borrowed books when page loads
  loadBorrowedBooks();
  console.log("Borrowed books loaded");
});









