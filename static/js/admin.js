document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin JS loaded");
  
  // Debug: Check if books table exists and has content
  const booksTable = document.querySelector(".books-table");
  const booksTableBody = document.getElementById("books-table-body");
  
  if (booksTable) {
    console.log("Books table found");
  } else {
    console.error("Books table not found");
  }
  
  if (booksTableBody) {
    console.log("Books table body found, rows:", booksTableBody.children.length);
    
    // Check if there are any book rows
    const bookRows = booksTableBody.querySelectorAll("tr");
    if (bookRows.length > 0) {
      console.log("Book rows found:", bookRows.length);
    } else {
      console.log("No book rows found in table body");
    }
  } else {
    console.error("Books table body not found");
  }
  
  // Attach event listeners to buttons
  attachEventListeners();
  
  // Add refresh button functionality
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function() {
      // Reload the page to get fresh data from Django
      window.location.reload();
    });
  }
  
  // Handle add new book form submission
  const newBookForm = document.getElementById("new-book-form");
  if (newBookForm) {
    newBookForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const bookTitle = document.getElementById("id_name").value;
      const bookAuthor = document.getElementById("id_author").value;
      const bookCategory = document.getElementById("id_category").value;
      const bookImageUrl = document.getElementById("id_image_url").value;
      const bookDescription = document.getElementById("id_description").value;
      const bookQuantity = document.getElementById("id_quantity").value || 1;
      const bookIsAvailable = document.getElementById("id_is_available").checked;

      // Validate required fields
      if (!bookTitle || !bookAuthor) {
        alert("Please fill in all required fields (Title and Author)");
        return;
      }

      // Create FormData object for server submission
      const formData = new FormData(newBookForm);
      
      // Submit to server via AJAX
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      
      fetch('/admin/books/add/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Create new book object with server-returned data
          const newBook = {
            id: data.book_id,
            name: bookTitle,
            author: bookAuthor,
            category: bookCategory,
            image_url: bookImageUrl,
            description: bookDescription,
            quantity: bookQuantity,
            is_available: bookIsAvailable
          };

          // Add the new book to the table
          addBookToTable(newBook);

          // Reset form
          newBookForm.reset();

          // Show success message
          alert(`"${bookTitle}" has been added successfully!`);
        } else {
          alert("Error adding book: " + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Failed to add book. Please try again.");
      });
    });
  }
});

// Function to attach event listeners to buttons
function attachEventListeners() {
  // Edit button event listeners
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookId = this.dataset.id;
      console.log("Edit button clicked for book ID:", bookId);
      
      // Fetch book details from server
      fetch(`/admin/books/${bookId}/details/`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Fill the edit form with book details
          document.getElementById('edit-book-id').value = data.book.id;
          document.getElementById('edit-book-title').value = data.book.name;
          document.getElementById('edit-book-author').value = data.book.author;
          document.getElementById('edit-book-category').value = data.book.category || '';
          document.getElementById('edit-book-image').value = data.book.image_url || '';
          document.getElementById('edit-book-quantity').value = data.book.quantity || 1;
          document.getElementById('edit-book-description').value = data.book.description || '';
          
          // Show the edit modal
          document.getElementById('edit-modal').style.display = 'flex';
        } else {
          alert("Error loading book details: " + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Failed to load book details. Please try again.");
      });
    });
  });

  // Delete button event listeners
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookId = this.dataset.id;
      console.log("Delete button clicked for book ID:", bookId);
      
      // Fetch book details for confirmation
      fetch(`/admin/books/${bookId}/details/`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          document.getElementById("delete-book-id").value = data.book.id;
          document.getElementById("delete-book-title").textContent = data.book.name;
          document.getElementById("delete-book-author").textContent = data.book.author;

          // Show the delete modal
          document.getElementById("delete-modal").style.display = "flex";
        } else {
          alert("Error loading book details: " + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Failed to load book details. Please try again.");
      });
    });
  });
}

// Function to add a book to the table
function addBookToTable(book) {
  const booksTableBody = document.getElementById("books-table-body");
  
  // Remove "no books" row if it exists
  const noBookRow = document.getElementById("no-books-row");
  if (noBookRow) {
    noBookRow.remove();
  }
  
  // Create a new row
  const newRow = document.createElement("tr");
  newRow.dataset.id = book.id;
  
  // Set availability based on quantity
  const isAvailable = book.quantity > 0 && book.is_available;
  
  // Set the HTML content for the new row
  newRow.innerHTML = `
    <td>
      <img src="${book.image_url || '/static/photos/default_book.png'}" alt="${book.name}" class="book-cover-thumbnail">
    </td>
    <td>${book.name}</td>
    <td>${book.author}</td>
    <td>${book.category || 'Uncategorized'}</td>
    <td>${book.quantity || 0}</td>
    <td>
      <span class="status-badge ${isAvailable ? 'available' : 'not-available'}">
        ${isAvailable ? 'Available' : 'Not Available'}
      </span>
    </td>
    <td class="action-btns">
      <button class="btn btn-edit edit-btn" data-id="${book.id}">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="btn btn-delete delete-btn" data-id="${book.id}">
        <i class="fas fa-trash"></i> Delete
      </button>
      <a href="/books/details/${book.id}/" class="btn btn-view">
        <i class="fas fa-eye"></i> View
      </a>
    </td>
  `;
  
  // Add the row to the table
  booksTableBody.appendChild(newRow);
  
  // Attach event listeners to the new buttons
  attachEventListeners();
}

// Handle edit book form submission
document.addEventListener('DOMContentLoaded', function() {
  const editBookForm = document.getElementById("edit-book-form");
  if (editBookForm) {
    editBookForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const bookId = document.getElementById("edit-book-id").value;
      const bookTitle = document.getElementById("edit-book-title").value;
      const bookAuthor = document.getElementById("edit-book-author").value;
      const bookCategory = document.getElementById("edit-book-category").value;
      const bookImageUrl = document.getElementById("edit-book-image").value;
      const bookDescription = document.getElementById("edit-book-description").value;
      const bookQuantity = parseInt(document.getElementById("edit-book-quantity").value) || 0;

      // Validate required fields
      if (!bookTitle || !bookAuthor) {
        alert("Please fill in all required fields (Title and Author)");
        return;
      }

      // Create form data for submission
      const formData = new FormData();
      formData.append('name', bookTitle);
      formData.append('author', bookAuthor);
      formData.append('category', bookCategory);
      formData.append('image_url', bookImageUrl);
      formData.append('description', bookDescription);
      formData.append('quantity', bookQuantity);
      
      // Set is_available based on quantity
      const isAvailable = bookQuantity > 0;
      formData.append('is_available', isAvailable);

      // Submit to server via AJAX
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      
      fetch(`/admin/books/edit/${bookId}/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Close the modal
          document.getElementById("edit-modal").style.display = "none";
          
          // Update the book row in the table
          const bookRow = document.querySelector(`tr[data-id="${bookId}"]`);
          if (bookRow) {
            bookRow.querySelector("td:nth-child(2)").textContent = bookTitle;
            bookRow.querySelector("td:nth-child(3)").textContent = bookAuthor;
            bookRow.querySelector("td:nth-child(4)").textContent = bookCategory || 'Uncategorized';
            bookRow.querySelector("td:nth-child(5)").textContent = bookQuantity;
            
            const statusBadge = bookRow.querySelector(".status-badge");
            if (isAvailable) {
              statusBadge.textContent = "Available";
              statusBadge.classList.remove("not-available");
              statusBadge.classList.add("available");
            } else {
              statusBadge.textContent = "Not Available";
              statusBadge.classList.remove("available");
              statusBadge.classList.add("not-available");
            }
            
            if (bookImageUrl) {
              bookRow.querySelector("img").src = bookImageUrl;
            }
          }
          
          // Show success message
          alert("Book has been updated successfully!");
        } else {
          alert("Error updating book: " + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Failed to update book. Please try again.");
      });
    });
  }
});

  // Handle delete book confirmation
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", function () {
      const bookId = document.getElementById("delete-book-id").value;
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      
      fetch(`/admin/books/delete/${bookId}/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Close the modal
          document.getElementById("delete-modal").style.display = "none";
          
          // Remove the book row from the table
          const bookRow = document.querySelector(`.delete-btn[data-id="${bookId}"]`).closest('tr');
          bookRow.remove();
          
          // Show success message
          alert("Book has been deleted successfully!");
          
          // If no books left, show the "no books" message
          const booksTableBody = document.getElementById('books-table-body');
          if (booksTableBody.children.length === 0) {
            const noBookRow = document.createElement('tr');
            noBookRow.id = 'no-books-row';
            noBookRow.innerHTML = '<td colspan="7" class="text-center">No books available. Add your first book using the form above.</td>';
            booksTableBody.appendChild(noBookRow);
          }
        } else {
          alert("Error deleting book: " + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Failed to delete book. Please try again.");
      });
    });
  }

  // Close modal buttons
  document
    .querySelectorAll(".close-modal, .close-modal-btn")
    .forEach((button) => {
      button.addEventListener("click", function () {
        const editModal = document.getElementById("edit-modal");
        const deleteModal = document.getElementById("delete-modal");

        if (editModal) editModal.style.display = "none";
        if (deleteModal) deleteModal.style.display = "none";
      });
    });

  // Handle delete confirmation
  const deleteButtons = document.querySelectorAll(".delete-btn");
  if (deleteButtons) {
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        if (!confirm("Are you sure you want to delete this book?")) {
          e.preventDefault();
        }
      });
    });
  }

  // Handle form validation
  const bookForm = document.querySelector("form.add-book-form");
  if (bookForm) {
    bookForm.addEventListener("submit", function (e) {
      const requiredFields = this.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          const fieldName = field.getAttribute("name").replace("_", " ");
          alert(`Please enter ${fieldName}`);
        }
      });

      if (!isValid) {
        e.preventDefault();
      }
    });
  }

  // Image preview for book form
  const imageUrlInput = document.getElementById("id_image_url");
  const imagePreview = document.getElementById("image-preview");

  if (imageUrlInput && imagePreview) {
    imageUrlInput.addEventListener("change", function () {
      const url = this.value;
      if (url) {
        imagePreview.src = url;
        imagePreview.style.display = "block";
      } else {
        imagePreview.style.display = "none";
      }
    });

    // Initialize preview if URL exists
    if (imageUrlInput.value) {
      imagePreview.src = imageUrlInput.value;
      imagePreview.style.display = "block";
    }
  }

  // Handle file upload preview
  const fileInput = document.getElementById("id_image");
  if (fileInput && imagePreview) {
    fileInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // If admin is already logged in via Django, show admin content
  if (document.querySelector(".admin-content")) {
    document.querySelector(".admin-content").style.display = "block";
  }

;

// Add counter animation for statistics
document.addEventListener("DOMContentLoaded", function() {
  // Animate stat counters
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach(statValue => {
    const finalValue = parseInt(statValue.textContent, 10);
    
    // Only animate if the value is greater than 0
    if (finalValue > 0) {
      // Start from 0
      statValue.textContent = '0';
      
      // Animate to final value
      let currentValue = 0;
      const duration = 1500; // Animation duration in ms
      const steps = 20; // Number of steps
      const increment = finalValue / steps;
      const stepTime = duration / steps;
      
      const counter = setInterval(() => {
        currentValue += increment;
        
        // Make sure we don't exceed the final value
        if (currentValue > finalValue) {
          currentValue = finalValue;
          clearInterval(counter);
        }
        
        // Update the display
        statValue.textContent = Math.floor(currentValue);
        
        // Clear interval when we reach the final value
        if (currentValue === finalValue) {
          clearInterval(counter);
        }
      }, stepTime);
    }
  });
  
  // Add entrance animation for stat cards
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * index); // Stagger the animations
  });
});

// Search and filter functionality
function setupSearchAndFilter() {
  const searchInput = document.getElementById('book-search');
  const searchBtn = document.getElementById('search-btn');
  const categoryFilter = document.getElementById('category-filter');
  const availabilityFilter = document.getElementById('availability-filter');
  
  // Function to filter books based on search and filter criteria
  function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value.toLowerCase();
    const availabilityValue = availabilityFilter.value.toLowerCase();
    
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
      const title = card.querySelector('.book-title').textContent.toLowerCase();
      const author = card.querySelector('.book-author').textContent.toLowerCase();
      const category = card.querySelector('.book-category').textContent.toLowerCase();
      const isAvailable = card.querySelector('.status-badge').classList.contains('available');
      
      // Check if book matches all criteria
      const matchesSearch = title.includes(searchTerm) || author.includes(searchTerm);
      const matchesCategory = !categoryValue || category.includes(categoryValue);
      const matchesAvailability = 
        !availabilityValue || 
        (availabilityValue === 'available' && isAvailable) || 
        (availabilityValue === 'not-available' && !isAvailable);
      
      // Show or hide based on matches
      if (matchesSearch && matchesCategory && matchesAvailability) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
    
    // Check if no books are visible and show message
    const visibleBooks = document.querySelectorAll('.book-card[style="display: flex;"]');
    const noResultsMessage = document.querySelector('.no-results-message');
    
    if (visibleBooks.length === 0) {
      if (!noResultsMessage) {
        const message = document.createElement('div');
        message.className = 'no-results-message';
        message.innerHTML = '<p>No books match your search criteria.</p>';
        document.querySelector('.books-grid-container').appendChild(message);
      }
    } else if (noResultsMessage) {
      noResultsMessage.remove();
    }
  }
  
  // Add event listeners
  if (searchInput) {
    searchInput.addEventListener('input', filterBooks);
  }
  
  if (searchBtn) {
    searchBtn.addEventListener('click', filterBooks);
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterBooks);
  }
  
  if (availabilityFilter) {
    availabilityFilter.addEventListener('change', filterBooks);
  }
}

// Call setup function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Existing code...
  
  // Setup search and filter
  setupSearchAndFilter();
  
  // Attach event listeners to edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function() {
      const bookId = this.getAttribute('data-id');
      
      // Fetch book details from server or use existing data
      fetch(`/admin/books/${bookId}/details/`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Fill the edit form with book details
          document.getElementById('edit-book-id').value = data.book.id;
          document.getElementById('edit-book-title').value = data.book.name;
          document.getElementById('edit-book-author').value = data.book.author;
          document.getElementById('edit-book-category').value = data.book.category || '';
          document.getElementById('edit-book-image').value = data.book.image_url || '';
          document.getElementById('edit-book-quantity').value = data.book.quantity || 1;
          document.getElementById('edit-book-description').value = data.book.description || '';
          
          // Show the edit modal
          document.getElementById('edit-modal').style.display = 'flex';
        } else {
          showError("Error loading book details: " + data.message, "Loading Error");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        
        // Fallback to localStorage if server request fails
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const book = books.find(b => b.id === bookId);
        
        if (book) {
          // Fill the edit form with book details
          document.getElementById('edit-book-id').value = book.id;
          document.getElementById('edit-book-title').value = book.title;
          document.getElementById('edit-book-author').value = book.author;
          document.getElementById('edit-book-category').value = book.category || '';
          document.getElementById('edit-book-image').value = book.image || '';
          document.getElementById('edit-book-quantity').value = book.quantity || 1;
          document.getElementById('edit-book-description').value = book.description || '';
          
          // Show the edit modal
          document.getElementById('edit-modal').style.display = 'flex';
        } else {
          showError("Book not found in local storage", "Loading Error");
        }
      });
    });
  });
  
  // Existing code for delete buttons...
});

// Attach event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  attachEventListeners();
  
  // Handle modal close buttons
  document.querySelectorAll('.close-modal, .close-modal-btn').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
});






