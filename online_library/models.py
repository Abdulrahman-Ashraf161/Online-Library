from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    # AbstractUser already has an email field. To make it unique:
    # We can either not redefine it here and rely on form validation for uniqueness check before saving,
    # or if we redefine it, we must ensure it matches AbstractUser's other attributes if needed.
    # For simplicity and to ensure database-level uniqueness, we can modify it.
    # However, AbstractUser's email is not unique by default. Let's make it unique.
    email = models.EmailField(unique=True, blank=False, null=False) # Ensure email is required and unique
    is_admin = models.BooleanField(default=False)
    # first_name and last_name are already part of AbstractUser

    # If you want to remove the username and use email as the USERNAME_FIELD:
    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username'] # if username is still used but not as login
    # For this project, we keep username as the USERNAME_FIELD as per typical Django setup.

class Book(models.Model):
    name = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class BorrowedBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrow_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()

    def __str__(self):
        return f"{self.user.username} borrowed {self.book.name}"
