document.addEventListener("DOMContentLoaded", function () {
  console.log("My Books page loaded");

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

  // Function to show message
  function showMessage(message, isSuccess = true) {
    // Create a message element
    const messageElement = document.createElement("div");
    messageElement.className = isSuccess ? "success-message" : "error-message";
    messageElement.textContent = message;

    // Add the message to the page
    const container = document.querySelector(".container") || document.body;
    container.insertBefore(messageElement, container.firstChild);

    // Auto-remove the message after 3 seconds
    setTimeout(() => {
      messageElement.style.opacity = "0";
      setTimeout(() => messageElement.remove(), 300);
    }, 3000);
  }

  // Function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Function to load borrowed books from localStorage
  function loadBorrowedBooks() {
    const bookList = document.querySelector(".book-list");
    if (!bookList) return;

    // Get borrowed books from localStorage
    const borrowedBooks =
      JSON.parse(localStorage.getItem("borrowedBooks")) || [];

    // Clear existing content
    bookList.innerHTML = "";

    if (borrowedBooks.length === 0) {
      // Show message if no books borrowed
      bookList.innerHTML = `
        <div class="no-books-message">
          <p>You haven't borrowed any books yet.</p>
          <a href="/books/" class="browse-books-btn">Browse Books</a>
        </div>
      `;
      return;
    }

    // Add each borrowed book to the list
    borrowedBooks.forEach((book) => {
      const bookItem = document.createElement("div");
      bookItem.className = "book-item";
      bookItem.dataset.id = book.id;

      bookItem.innerHTML = `
        <div class="book-image">
          <img src="${book.image || "/static/photos/default_book.png"}" alt="${
        book.title
      }">
        </div>
        <div class="book-info">
          <h3>${book.title}</h3>
          <p>Author: ${book.author}</p>
          <p>Category: ${book.category || "N/A"}</p>
          <p>Borrowed on: ${formatDate(book.borrowDate)}</p>
          <p>Due date: ${formatDate(book.dueDate)}</p>
        </div>
        <div class="book-actions">
          <a href="/books/${book.id}/" class="details-btn">Details</a>
          <button class="return-btn" data-book-id="${book.id}">Return</button>
        </div>
      `;

      bookList.appendChild(bookItem);
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

      // Get borrowed books from localStorage
      let borrowedBooks =
        JSON.parse(localStorage.getItem("borrowedBooks")) || [];

      // Remove the book from borrowed books
      borrowedBooks = borrowedBooks.filter((book) => book.id !== bookId);
      localStorage.setItem("borrowedBooks", JSON.stringify(borrowedBooks));

      // Update the book status in localStorage
      const books = JSON.parse(localStorage.getItem("books")) || [];
      const bookIndex = books.findIndex((book) => book.id === bookId);
      if (bookIndex !== -1) {
        books[bookIndex].status = "Available";
        localStorage.setItem("books", JSON.stringify(books));
      }

      // Show success message
      showMessage(`"${bookTitle}" has been returned successfully!`);

      // Animate removal of book item
      bookItem.style.opacity = "0";
      setTimeout(() => {
        bookItem.remove();

        // Check if there are no more books
        if (borrowedBooks.length === 0) {
          loadBorrowedBooks(); // This will show the "no books" message
        }
      }, 300);

      // Optional: Send AJAX request to server if needed
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
        .then((response) => {
          console.log("Response status:", response.status);
          return response.json();
        })
        .then((data) => {
          console.log("Response data:", data);
        })
        .catch((error) => {
          console.error("Error returning book:", error);
        });
    }
  });

  // Load borrowed books when page loads
  loadBorrowedBooks();
  console.log("Borrowed books loaded");
});
