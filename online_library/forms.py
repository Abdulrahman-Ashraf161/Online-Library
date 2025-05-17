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
        widget=forms.TextInput(attrs={'autofocus': True, 'class': 'form-control', 'placeholder': 'Username'})
    )
    password = forms.CharField(
        label="Password",
        strip=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'})
    )

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['name', 'author', 'category', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Book Title'}),
            'author': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Author Name'}),
            'category': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Category'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Book Description', 'rows': 4}),
        }
    
    def clean_name(self):
        name = self.cleaned_data.get('name')
        if len(name) < 2:
            raise ValidationError("Book title must be at least 2 characters long.")
        return name
    
    def clean_author(self):
        author = self.cleaned_data.get('author')
        if len(author) < 2:
            raise ValidationError("Author name must be at least 2 characters long.")
        return author

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
