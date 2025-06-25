from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User, Book, BorrowedBook
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

class CustomUserCreationForm(UserCreationForm):
    is_admin = forms.BooleanField(required=False, help_text="Check if this user is an admin.")
    email = forms.EmailField(required=True, help_text="Required. Enter a valid email address.")
    
    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + (
            'email',
            'first_name', 
            'last_name', 
            'is_admin',
        )
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with that email already exists.")
        return email

class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        label="Username",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'})
    )
    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'})
    )

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['name', 'author', 'category', 'description', 'image_url', 'quantity', 'is_available']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'id': 'id_name', 'placeholder': 'Book title', 'required': True}),
            'author': forms.TextInput(attrs={'class': 'form-control', 'id': 'id_author', 'placeholder': 'Author name', 'required': True}),
            'category': forms.Select(attrs={'class': 'form-control', 'id': 'id_category'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'id': 'id_description', 'rows': 4, 'placeholder': 'Book description'}),
            'image_url': forms.URLInput(attrs={'class': 'form-control', 'id': 'id_image_url', 'placeholder': 'https://example.com/image.jpg'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'id': 'id_quantity', 'min': '0', 'placeholder': 'Number of copies'}),
            'is_available': forms.CheckboxInput(attrs={'class': 'form-check-input', 'id': 'id_is_available'}),
        }
    
    def clean(self):
        cleaned_data = super().clean()
        quantity = cleaned_data.get('quantity')
        is_available = cleaned_data.get('is_available')
        
        # If quantity is 0, book cannot be available
        if quantity == 0 and is_available:
            cleaned_data['is_available'] = False
            
        # If quantity > 0 but is_available is False, warn the user
        if quantity > 0 and not is_available:
            self.add_warning('quantity', 'Book has copies but is marked as unavailable.')
            
        return cleaned_data
    
    def add_warning(self, field, message):
        """Add a warning message without raising a validation error"""
        if not hasattr(self, '_warnings'):
            self._warnings = {}
        if field not in self._warnings:
            self._warnings[field] = []
        self._warnings[field].append(message)

class BorrowBookForm(forms.ModelForm):
    class Meta:
        model = BorrowedBook
        fields = ['book', 'due_date']
        widgets = {
            'due_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super(BorrowBookForm, self).__init__(*args, **kwargs)
        # Only show available books
        self.fields['book'].queryset = Book.objects.filter(is_available=True)
    
    def clean_due_date(self):
        due_date = self.cleaned_data.get('due_date')
        today = timezone.now().date()
        
        if due_date < today:
            raise ValidationError("Due date cannot be in the past.")
        
        # Example: Enforce a maximum borrowing period of 30 days
        max_borrow_period = today + timedelta(days=30)
        if due_date > max_borrow_period:
            raise ValidationError(f"Due date cannot be more than 30 days from today ({max_borrow_period.strftime('%Y-%m-%d')}).")
        
        return due_date
    
    def clean_book(self):
        book = self.cleaned_data.get('book')
        if not book.is_available:
            raise ValidationError("This book is not available for borrowing.")
        return book
    
    def save(self, commit=True):
        instance = super(BorrowBookForm, self).save(commit=False)
        instance.user = self.user
        
        if commit:
            instance.save()
            # Update book availability
            book = instance.book
            book.is_available = False
            book.save()
        
        return instance

class SearchForm(forms.Form):
    SEARCH_CHOICES = [
        ('title', 'Title'),
        ('author', 'Author'),
        ('category', 'Category'),
    ]
    
    search_by = forms.ChoiceField(choices=SEARCH_CHOICES, required=False)
    q = forms.CharField(max_length=100, required=False, label="Search",
                       widget=forms.TextInput(attrs={'placeholder': 'Search books...'}))








