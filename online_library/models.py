from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    is_admin = models.BooleanField(default=False)

class Book(models.Model):
    """
    Model for books in the library
    """
    name = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    quantity = models.IntegerField(default=1)
    is_available = models.BooleanField(default=True)
    
    # Remove or comment out these fields if they don't exist in the database
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class BorrowedBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrowed_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    is_returned = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username} - {self.book.name}"
    
    class Meta:
        ordering = ['-borrowed_date']




