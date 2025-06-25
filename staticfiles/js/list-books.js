document.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");

  // Function to load books from localStorage
  function loadBooksFromLocalStorage() {
    const booksContainer = document.querySelector(".books-container");
    if (!booksContainer) return;

    // Get books from localStorage
    const books = JSON.parse(localStorage.getItem("books")) || [];

    if (
      !Array.isArray(books) ||
      !books.every((book) => typeof book === "object" && book !== null)
    ) {
      console.error("Invalid books data in localStorage");
      return;
    }

    // Clear existing books
    booksContainer.innerHTML = "";

    // Add each book to the container
    books.forEach((book) => {
      const bookItem = document.createElement("div");
      bookItem.className = "book-item";
      bookItem.innerHTML = `
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <p>Genre: ${book.genre}</p>
        <p>ISBN: ${book.isbn}</p>
        <p>Publication Year: ${book.publication_year}</p>
        <p>Language: ${book.language}</p>
        <p>Pages: ${book.pages}</p>
        <p>Summary: ${book.summary}</p>
        <p>Price: $${book.price}</p>
        <p>Stock: ${book.stock}</p>
        <p class="status available">Available</p>
        <button class="borrow-btn" data-book-id="${book.id}">Borrow</button>
      `;
      booksContainer.appendChild(bookItem);
    });
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

  // Function to get the correct image path
  function getImagePath(imagePath) {
    // If the image path is a full URL (starts with http or https), use it directly
    if (
      imagePath &&
      (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    ) {
      return imagePath;
    }

    // If the image path is a relative path (from the media directory)
    if (imagePath && imagePath.startsWith("/media/")) {
      return imagePath;
    }

    // If the image path is a relative path (from the static directory)
    if (imagePath && !imagePath.startsWith("/")) {
      return `/static/${imagePath}`;
    }

    // Default image path
    return "/static/photos/default_book.png";
  }

  // Add event delegation for borrow buttons
  document.body.addEventListener("click", function (event) {
    if (
      event.target.classList.contains("borrow-btn") &&
      !event.target.disabled
    ) {
      event.preventDefault();
      console.log("Borrow button clicked");

      const bookId = event.target.getAttribute("data-book-id");
      console.log("Book ID:", bookId);

      if (!bookId) {
        console.error("No book ID found on button");
        return;
      }

      // Get the book item
      const bookItem = event.target.closest(".book-item");
      const bookTitle = bookItem.querySelector("h3").textContent;
      const bookAuthor = bookItem
        .querySelector("p:nth-of-type(1)")
        .textContent.replace("Author: ", "");
      const bookCategory = bookItem
        .querySelector("p:nth-of-type(2)")
        .textContent.replace("Category: ", "");

      // Get book image if available
      let bookImage = "";
      const imgElement = bookItem.querySelector("img");
      if (imgElement) {
        bookImage = imgElement.src;
        console.log("Book image found:", bookImage);
      } else {
        console.log("No book image found, using default");
        bookImage = getImagePath("photos/default_book.png");
      }

      // Create a borrowed book object
      const borrowedBook = {
        id: bookId,
        title: bookTitle,
        author: bookAuthor,
        category: bookCategory,
        image: bookImage,
        borrowDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      };

      // Get existing borrowed books from localStorage
      const borrowedBooks =
        JSON.parse(localStorage.getItem("borrowedBooks")) || [];

      // Check if book is already borrowed
      if (borrowedBooks.some((book) => book.id === bookId)) {
        showMessage("You have already borrowed this book.", false);
        return;
      }

      // Add the book to borrowed books
      borrowedBooks.push(borrowedBook);
      localStorage.setItem("borrowedBooks", JSON.stringify(borrowedBooks));

      // Update the book status in localStorage
      const books = JSON.parse(localStorage.getItem("books")) || [];
      const bookIndex = books.findIndex((book) => book.id === bookId);
      if (bookIndex !== -1) {
        books[bookIndex].status = "Not Available";
        localStorage.setItem("books", JSON.stringify(books));
      }

      // Update UI
      event.target.textContent = "Not Available";
      event.target.disabled = true;

      const statusSpan = bookItem.querySelector(".status");
      if (statusSpan) {
        statusSpan.textContent = "Borrowed";
        statusSpan.classList.remove("available");
        statusSpan.classList.add("not-available");
      }

      // Show success message
      showMessage(`"${bookTitle}" has been borrowed successfully!`);

      // Optional: Send AJAX request to server if needed
      const csrfToken = getCsrfToken();
      const borrowURL = `/books/borrow/${bookId}/`;

      fetch(borrowURL, {
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
          console.error("Error borrowing book:", error);
        });
    }
  });

  console.log("Event listeners set up");
});
