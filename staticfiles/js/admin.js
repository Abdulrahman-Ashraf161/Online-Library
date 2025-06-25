document.addEventListener("DOMContentLoaded", function () {
  // Function to load books from localStorage
  function loadBooksIntoAdminPanel() {
    const booksTableBody = document.querySelector(".books-table tbody");
    if (!booksTableBody) return; // Exit if table body doesn't exist

    // Get books from localStorage (same as browse books page)
    const books = JSON.parse(localStorage.getItem("books")) || [];

    if (books.length === 0) {
      // If no books in localStorage, show message
      booksTableBody.innerHTML =
        '<tr><td colspan="5" class="text-center">No books available</td></tr>';
      return;
    }

    // Clear existing table content
    booksTableBody.innerHTML = "";

    // Add each book to the table
    books.forEach((book) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <img
            src="${book.image || "https://via.placeholder.com/120x180"}"
            alt="${book.title}"
            class="book-cover"
          />
        </td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.category || ""}</td>
        <td class="action-btns">
          <button class="btn btn-edit btn-sm edit-btn" data-id="${book.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-delete btn-sm delete-btn" data-id="${book.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      `;
      booksTableBody.appendChild(row);
    });

    // Attach event listeners for edit and delete buttons
    attachEventListeners();
  }

  // Function to attach event listeners to buttons
  function attachEventListeners() {
    // Edit button event listeners
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const bookId = this.dataset.id;
        const books = JSON.parse(localStorage.getItem("books")) || [];
        const book = books.find((b) => b.id === bookId);

        if (book) {
          // Fill the edit form with book details
          document.getElementById("edit-book-id").value = book.id;
          document.getElementById("edit-book-title").value = book.title;
          document.getElementById("edit-book-author").value = book.author;
          document.getElementById("edit-book-category").value =
            book.category || "";
          document.getElementById("edit-book-image").value = book.image || "";
          document.getElementById("edit-book-pages").value = book.pages || "";
          document.getElementById("edit-book-description").value =
            book.description || "";

          // Show the edit modal
          document.getElementById("edit-modal").style.display = "flex";
        }
      });
    });

    // Delete button event listeners
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const bookId = this.dataset.id;
        const books = JSON.parse(localStorage.getItem("books")) || [];
        const book = books.find((b) => b.id === bookId);

        if (book) {
          document.getElementById("delete-book-id").value = book.id;
          document.getElementById("delete-book-title").textContent = book.title;
          document.getElementById("delete-book-author").textContent =
            book.author;

          // Show the delete modal
          document.getElementById("delete-modal").style.display = "flex";
        }
      });
    });
  }

  // Load books when page loads
  loadBooksIntoAdminPanel();

  // Add refresh button functionality if it exists
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadBooksIntoAdminPanel);
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
      const bookIsAvailable =
        document.getElementById("id_is_available").checked;

      // Validate required fields
      if (!bookTitle || !bookAuthor) {
        alert("Please fill in all required fields (Title and Author)");
        return;
      }

      // Get books from localStorage
      const books = JSON.parse(localStorage.getItem("books")) || [];

      // Create new book object
      const newBook = {
        id: Date.now().toString(), // Generate unique ID
        title: bookTitle,
        author: bookAuthor,
        category: bookCategory,
        image: bookImageUrl,
        description: bookDescription,
        status: bookIsAvailable ? "Available" : "Not Available",
      };

      // Add new book to array
      books.push(newBook);

      // Save updated books to localStorage
      localStorage.setItem("books", JSON.stringify(books));

      // Reload books table
      loadBooksIntoAdminPanel();

      // Reset form
      newBookForm.reset();

      // Show success message
      alert("Book added successfully!");
    });
  }

  // Handle edit form submission
  const editForm = document.getElementById("edit-book-form");
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const bookId = document.getElementById("edit-book-id").value;
      const books = JSON.parse(localStorage.getItem("books")) || [];
      const bookIndex = books.findIndex((b) => b.id === bookId);

      if (bookIndex !== -1) {
        // Update book details
        books[bookIndex] = {
          id: bookId,
          title: document.getElementById("edit-book-title").value,
          author: document.getElementById("edit-book-author").value,
          category: document.getElementById("edit-book-category").value,
          image: document.getElementById("edit-book-image").value,
          pages: document.getElementById("edit-book-pages").value,
          description: document.getElementById("edit-book-description").value,
          status: books[bookIndex].status || "Available",
        };

        // Save updated books to localStorage
        localStorage.setItem("books", JSON.stringify(books));

        // Reload books table
        loadBooksIntoAdminPanel();

        // Close the modal
        document.getElementById("edit-modal").style.display = "none";

        // Show success message
        alert("Book updated successfully!");
      }
    });
  }

  // Handle delete confirmation
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", function () {
      const bookId = document.getElementById("delete-book-id").value;
      const books = JSON.parse(localStorage.getItem("books")) || [];
      const updatedBooks = books.filter((b) => b.id !== bookId);

      // Save updated books to localStorage
      localStorage.setItem("books", JSON.stringify(updatedBooks));

      // Reload books table
      loadBooksIntoAdminPanel();

      // Close the modal
      document.getElementById("delete-modal").style.display = "none";

      // Show success message
      alert("Book deleted successfully!");
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
});
