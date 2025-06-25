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

document.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");

  // Function to load books from localStorage or use server-rendered books
  function loadBooks() {
    const booksContainer = document.querySelector(".book-list");
    if (!booksContainer) return;

    // Check if there are already server-rendered books
    if (booksContainer.querySelector(".book-item") && 
        !booksContainer.querySelector(".no-books")) {
      console.log("Using server-rendered books");
      return; // Use the server-rendered books
    }

    // Get books from localStorage as fallback
    const books = JSON.parse(localStorage.getItem("books")) || [];

    if (books.length === 0) {
      booksContainer.innerHTML = '<p class="no-books">No books found.</p>';
      return;
    }

    // Clear existing books
    booksContainer.innerHTML = "";

    // Add each book to the container
    books.forEach((book) => {
      const bookItem = document.createElement("div");
      bookItem.className = "book-item";
      bookItem.dataset.id = book.id;
      
      // Check if book has quantity
      const hasQuantity = book.quantity > 0;
      
      bookItem.innerHTML = `
        <div class="book-image">
          <img src="${book.image || '/static/photos/default_book.png'}" alt="${book.title}" />
        </div>
        <div class="book-info">
          <h3>${book.title}</h3>
          <p class="status-text">
            <span class="status ${hasQuantity ? 'available' : 'not-available'}">
              ${hasQuantity ? 'Available' : 'Not Available'}
            </span>
          </p>
        </div>
        <div class="book-actions">
          <a href="/books/details/${book.id}/" class="details-btn">Details</a>
          ${isUserLoggedIn() ? 
            (hasQuantity ? 
              `<button type="button" class="borrow-btn" data-book-id="${book.id}">Borrow</button>` : 
              `<button type="button" class="borrow-btn" disabled>Not Available</button>`) : 
            `<a href="/login/" class="login-to-borrow">Login to Borrow</a>`}
        </div>
      `;
      
      booksContainer.appendChild(bookItem);
    });
  }

  // Helper function to check if user is logged in
  function isUserLoggedIn() {
    // Check if there's a login/logout link in the nav
    const logoutLink = document.querySelector('nav a[href="/logout/"]');
    return !!logoutLink;
  }

  // Load books when page loads
  loadBooks();

  // Function to get CSRF token
  function getCsrfToken() {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (cookieValue) {
      return cookieValue;
    }
    
    // Fallback: try to get from the form
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (csrfInput) {
      return csrfInput.value;
    }
    
    console.error("CSRF token not found");
    return '';
  }

  // Function to show message - replace with new notification system
  function showMessage(message, isSuccess = true) {
    if (isSuccess) {
      showSuccess(message);
    } else {
      showError(message);
    }
  }

  // Function to get the correct image path
  function getImagePath(imagePath) {
    // If the image path is a full URL (starts with http or https), use it directly
    if (imagePath && (imagePath.startsWith("http://") || imagePath.startsWith("https://"))) {
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

    // Default image path - use absolute path
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
        showError("No book ID found on button");
        return;
      }

      // Get the book item
      const bookItem = event.target.closest(".book-item");
      const bookTitle = bookItem.querySelector("h3").textContent;
      
      // Get CSRF token
      const csrfToken = getCsrfToken();
      const borrowURL = `/books/borrow/${bookId}/`;

      console.log("CSRF Token:", csrfToken ? "Found" : "Not found");
      console.log("Borrow URL:", borrowURL);

      // Show loading state
      event.target.textContent = "Borrowing...";
      event.target.disabled = true;

      // Use fetch for AJAX
      fetch(borrowURL, {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({}),
      })
      .then(response => {
        console.log("Response status:", response.status);
        return response.json();
      })
      .then(data => {
        console.log("Response data:", data);
        
        if (data.status === 'success') {
          // Check if book is now out of stock (quantity = 0)
          if (data.book_data && data.book_data.quantity <= 0) {
            const statusSpan = bookItem.querySelector(".status");
            if (statusSpan) {
              statusSpan.textContent = "Not Available";
              statusSpan.classList.remove("available");
              statusSpan.classList.add("not-available");
            }
            
            event.target.textContent = "Not Available";
            event.target.disabled = true;
          } else {
            // Re-enable button for additional borrowing
            event.target.textContent = "Borrow";
            event.target.disabled = false;
          }

          // Show success message with book title
          showSuccess(`You have successfully borrowed "${bookTitle}"! Visit <a href="/my-books/">My Books</a> to see your borrowed books.`, "Book Borrowed");
        } else {
          // Reset button if error
          event.target.textContent = "Borrow";
          event.target.disabled = false;
          
          // Show error message
          showError(data.message || "Failed to borrow book");
        }
      })
      .catch(error => {
        console.error("Error borrowing book:", error);
        
        // Reset button if error
        event.target.textContent = "Borrow";
        event.target.disabled = false;
        
        // Show error message
        showError("Error connecting to server. Please try again.");
      });
    }
  });

  // Add this function to test borrowing directly
  function testBorrowBook(bookId) {
    console.log("Testing borrow book with ID:", bookId);
    
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
      .then(response => {
        console.log("Response status:", response.status);
        return response.json();
      })
      .then(data => {
        console.log("Response data:", data);
        alert(data.message || "Response received");
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Error: " + error.message);
      });
  }

  


  // Add this function to test the borrow endpoint
  function testBorrowEndpoint(bookId) {
    console.log("Testing borrow endpoint for book ID:", bookId);
    
    const csrfToken = getCsrfToken();
    
    fetch(`/books/test-borrow/${bookId}/`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log("Test response:", data);
        showSuccess("Test successful: " + JSON.stringify(data));
      })
      .catch(error => {
        console.error("Test error:", error);
        showError("Test failed: " + error.message);
      });
  }

  console.log("Event listeners set up");
});






























