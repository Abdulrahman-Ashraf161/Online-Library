# New views.py content
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout as auth_logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q
from .models import Book, BorrowedBook, User
from .forms import CustomUserCreationForm, CustomAuthenticationForm, BookForm, SearchForm
from datetime import timedelta
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json

def is_admin_check(user):
    return user.is_authenticated and user.is_admin

# --- Authentication Views ---
def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Registration successful! You are now logged in.")
            if user.is_admin:
                return redirect('admin_dashboard')
            else:
                return redirect('user_dashboard')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field.capitalize() if field != '__all__' else 'Form error:'} {error}")
    else:
        form = CustomUserCreationForm()
    return render(request, 'Register.html', {'form': form, 'page_title': 'Sign Up'})

def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                if user.is_admin:
                    return redirect('admin_dashboard')
                else:
                    return redirect('user_dashboard')
        messages.error(request, "Invalid username or password")
    else:
        form = CustomAuthenticationForm()
    return render(request, 'Login.html', {'form': form, 'page_title': 'Login'})

@login_required(login_url='login')
def logout_view(request):
    auth_logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('login')

# --- Admin Views ---
@login_required(login_url='login')
@user_passes_test(is_admin_check)
def admin_dashboard(request):
    total_books = Book.objects.count()
    available_books = Book.objects.filter(is_available=True).count()
    borrowed_books = BorrowedBook.objects.filter(is_returned=False).count()
    total_users = User.objects.filter(is_admin=False).count()
    books = Book.objects.all().order_by('-id')
    context = {
        'page_title': 'Admin Dashboard',
        'total_books': total_books,
        'available_books': available_books,
        'borrowed_books': borrowed_books,
        'total_users': total_users,
        'books': books,
        'is_admin': True
    }
    return render(request, 'admin.html', context)

@login_required(login_url='login')
@user_passes_test(is_admin_check)
def add_book(request):
    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES)
        if form.is_valid():
            book = form.save(commit=False)
            
            # Ensure is_available is set based on quantity
            if book.quantity <= 0:
                book.is_available = False
            
            book.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'book_id': book.id,
                    'message': 'Book added successfully!'
                })
            messages.success(request, 'Book added successfully!')
            return redirect('admin_dashboard')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'Form validation failed',
                    'errors': form.errors
                })
    else:
        form = BookForm()
    context = {
        'page_title': 'Add Book',
        'form': form,
        'is_admin': True
    }
    return render(request, 'edit_book_details.html', context)

@login_required(login_url='login')
@user_passes_test(is_admin_check)
def edit_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES, instance=book)
        if form.is_valid():
            book = form.save(commit=False)
            
            # Ensure is_available is set based on quantity
            if book.quantity <= 0:
                book.is_available = False
            else:
                book.is_available = True
                
            book.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Book updated successfully!'
                })
            messages.success(request, "Book updated successfully!")
            return redirect('admin_dashboard')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'Form validation failed',
                    'errors': form.errors
                })
    else:
        form = BookForm(instance=book)
    context = {
        'page_title': 'Edit Book',
        'form': form,
        'book': book,
        'is_admin': True
    }
    return render(request, 'edit_book_details.html', context)

@login_required(login_url='login')
@user_passes_test(is_admin_check)
def delete_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    if request.method == 'POST':
        book.delete()
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'message': 'Book deleted successfully!'
            })
        messages.success(request, "Book deleted successfully!")
        return redirect('admin_dashboard')
    context = {
        'page_title': 'Delete Book',
        'book': book,
        'is_admin': True
    }
    return render(request, 'delete_book.html', context)

# --- User Views ---
@login_required(login_url='login')
def user_dashboard(request):
    borrowed_books = BorrowedBook.objects.filter(
        user=request.user,
        is_returned=False
    ).select_related('book')
    context = {
        'page_title': 'My Dashboard',
        'borrowed_books': borrowed_books
    }
    return render(request, 'MyBooks.html', context)

@login_required(login_url='login')
def view_book_details(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    context = {
        'page_title': book.name,
        'book': book
    }
    return render(request, 'view_book_details.html', context)

@login_required(login_url='login')
def borrow_book(request, book_id):
    """
    Handle book borrowing via AJAX
    """
    print(f"Borrow book request received for book ID: {book_id}")
    
    try:
        book = get_object_or_404(Book, id=book_id)
        print(f"Book found: {book.name}, quantity: {book.quantity}, available: {book.is_available}")
        
        # Check if book has quantity > 0
        if book.quantity <= 0:
            print(f"Book {book_id} is out of stock")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'error',
                    'message': 'This book is not available for borrowing.'
                })
            messages.error(request, "This book is not available for borrowing.")
            return redirect('view_book_details', book_id=book_id)
        
        # Create borrowed book record
        due_date = timezone.now().date() + timedelta(days=14)
        borrowed_book = BorrowedBook.objects.create(
            user=request.user,
            book=book,
            borrowed_date=timezone.now().date(),
            due_date=due_date,
            is_returned=False
        )
        print(f"Borrowed book record created: {borrowed_book.id}")
        
        # Decrease quantity
        book.quantity = max(0, book.quantity - 1)
        
        # Update availability based on quantity
        if book.quantity == 0:
            book.is_available = False
            
        book.save()
        print(f"Book updated: quantity={book.quantity}, is_available={book.is_available}")
        
        print(f"Book {book_id} borrowed successfully by {request.user.username}")
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'success',
                'message': f'You have successfully borrowed "{book.name}"!',
                'book_data': {
                    'id': book.id,
                    'title': book.name,
                    'author': book.author,
                    'category': book.category or 'Uncategorized',
                    'image_url': book.image_url or '/static/photos/default_book.png',
                    'borrowed_date': borrowed_book.borrowed_date.strftime('%Y-%m-%d'),
                    'due_date': borrowed_book.due_date.strftime('%Y-%m-%d'),
                    'quantity': book.quantity,
                    'is_available': book.quantity > 0
                }
            })
        
        messages.success(request, f'You have successfully borrowed "{book.name}"!')
        return redirect('user_dashboard')
    except Exception as e:
        import traceback
        print(f"Error borrowing book {book_id}: {str(e)}")
        print(traceback.format_exc())
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': f'Error borrowing book: {str(e)}'
            }, status=500)
        messages.error(request, f"Error borrowing book: {str(e)}")
        return redirect('view_book_details', book_id=book_id)

@login_required(login_url='login')
def my_borrowed_books(request):
    borrowed_books = BorrowedBook.objects.filter(
        user=request.user,
        is_returned=False
    ).select_related('book')
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        books_data = []
        for borrowed in borrowed_books:
            books_data.append({
                'id': borrowed.book.id,
                'title': borrowed.book.name,
                'author': borrowed.book.author,
                'category': borrowed.book.category or 'Uncategorized',
                'image_url': borrowed.book.image_url or '/static/photos/default_book.png',
                'borrowed_date': borrowed.borrowed_date.strftime('%Y-%m-%d'),
                'due_date': borrowed.due_date.strftime('%Y-%m-%d'),
                'borrowed_id': borrowed.id
            })
        return JsonResponse({
            'borrowed_books': books_data
        })
    context = {
        'page_title': 'My Borrowed Books',
        'borrowed_books': borrowed_books
    }
    return render(request, 'MyBooks.html', context)

@login_required(login_url='login')
def edit_profile(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        profile_picture = request.FILES.get('profile_picture')
        user = request.user
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.profile_picture = profile_picture
        # Check if a new profile picture is uploaded
        # and update the user's profile picture
        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']
        user.save()
        messages.success(request, "Profile updated successfully!")
        return redirect('profile')
    return render(request, 'edit-profile.html', {'page_title': 'Edit Profile'})

@login_required(login_url='login')
def change_password(request):
    if request.method == 'POST':
        current_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        if not request.user.check_password(current_password):
            messages.error(request, "Current password is incorrect.")
            return redirect('change_password')
        if new_password != confirm_password:
            messages.error(request, "New passwords do not match.")
            return redirect('change_password')
        request.user.set_password(new_password)
        request.user.save()
        update_session_auth_hash(request, request.user)
        messages.success(request, "Password changed successfully!")
        return redirect('profile')
    return render(request, 'change-password.html', {'page_title': 'Change Password'})

def index(request):
    try:
        featured_books = Book.objects.all()[:6]
    except NameError:
        featured_books = []
        messages.warning(request, "Homepage: Could not load featured books. Book model might be missing.")
    except Exception as e:
        featured_books = []
        messages.error(request, f"Homepage: Error loading featured books: {str(e)}")
    context = {
        'page_title': 'Welcome to the Online Library',
        'featured_books': featured_books,
        'user': request.user
    }
    return render(request, 'Index.html', context)

def search_books(request):
    query = request.GET.get('q', '')
    if query:
        books = Book.objects.filter(
            Q(name__icontains=query) |
            Q(author__icontains=query) |
            Q(description__icontains=query) |
            Q(category__icontains=query)
        )
    else:
        books = Book.objects.all()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        book_list = []
        for book in books:
            book_list.append({
                'id': book.id,
                'title': book.name,
                'author': book.author,
                'category': book.category,
                'image': book.image_url,
                'available': book.is_available
            })
        return JsonResponse({'books': book_list})
    context = {
        'books': books,
        'query': query,
        'page_title': 'Search Results' if query else 'All Books'
    }
    return render(request, 'list-books.html', context)

@login_required(login_url='login')
def profile(request):
    context = {
        'page_title': 'My Profile',
        'user': request.user
    }
    return render(request, 'profile.html', context)

def user_list_books(request):
    category = request.GET.get('category', 'all')
    if category and category != 'all':
        books = Book.objects.filter(category__iexact=category)
    else:
        books = Book.objects.all()
    books = books.order_by('-id')
    context = {
        'page_title': 'Browse Books',
        'books': books,
        'selected_category': category
    }
    return render(request, 'list-books.html', context)

@login_required(login_url='login')
@user_passes_test(is_admin_check)
def admin_list_books(request):
    books = Book.objects.all()
    context = {
        'page_title': 'Manage Books',
        'books': books
    }
    return render(request, 'admin-books.html', context)

@login_required(login_url='login')
@require_POST
def return_book(request, book_id):
    """
    Handle book returning via AJAX
    """
    print(f"Return book request received for book ID: {book_id}")
    
    try:
        book = get_object_or_404(Book, id=book_id)
        print(f"Book found: {book.name}, current quantity: {book.quantity}, available: {book.is_available}")
        
        # Find the borrowed book record - get the most recent one if multiple exist
        borrowed_books = BorrowedBook.objects.filter(
            user=request.user, 
            book=book, 
            is_returned=False
        ).order_by('-borrowed_date')
        
        if not borrowed_books.exists():
            return JsonResponse({
                'status': 'error',
                'message': 'You have not borrowed this book.'
            }, status=404)
        
        # Get the most recent borrowed book
        borrowed_book = borrowed_books.first()
        print(f"Found borrow record ID: {borrowed_book.id}")
        
        # Update borrowed book record
        borrowed_book.is_returned = True
        borrowed_book.return_date = timezone.now().date()
        borrowed_book.save()
        
        print(f"Updated borrow record: is_returned={borrowed_book.is_returned}, return_date={borrowed_book.return_date}")
        
        # Update book quantity and availability
        book.quantity += 1
        
        # If book was not available before, make it available now
        if not book.is_available:
            book.is_available = True
            
        book.save()
        
        print(f"Updated book quantity to {book.quantity}, available: {book.is_available}")
        
        return JsonResponse({
            'status': 'success',
            'message': f'You have successfully returned "{book.name}"!',
            'book_id': book.id
        })
    except Exception as e:
        import traceback
        print(f"Error returning book {book_id}: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({
            'status': 'error',
            'message': f'Error returning book: {str(e)}'
        }, status=500)

@login_required(login_url='login')
def my_borrowed_books_data(request):
    borrowed_books = BorrowedBook.objects.filter(
        user=request.user,
        is_returned=False
    ).select_related('book')
    books_data = []
    for borrowed in borrowed_books:
        books_data.append({
            'id': borrowed.book.id,
            'title': borrowed.book.name,
            'author': borrowed.book.author,
            'category': borrowed.book.category or 'Uncategorized',
            'image_url': borrowed.book.image_url or '/static/photos/default_book.png',
            'borrowed_date': borrowed.borrowed_date.strftime('%Y-%m-%d'),
            'due_date': borrowed.due_date.strftime('%Y-%m-%d'),
            'borrowed_id': borrowed.id
        })
    return JsonResponse({
        'borrowed_books': books_data
    })

def test_borrow_view(request, book_id):
    if not request.user.is_authenticated:
        return JsonResponse({
            'status': 'error',
            'message': 'You must be logged in to borrow books'
        })
    try:
        book = get_object_or_404(Book, id=book_id)
        return JsonResponse({
            'status': 'success',
            'message': f'Test successful. Book "{book.name}" exists.',
            'book_data': {
                'id': book.id,
                'name': book.name,
                'author': book.author,
                'is_available': book.is_available,
                'quantity': book.quantity
            }
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Test failed: {str(e)}'
        })

@login_required(login_url='login')
@user_passes_test(is_admin_check)
def get_book_details(request, book_id):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            book = get_object_or_404(Book, id=book_id)
            return JsonResponse({
                'success': True,
                'book': {
                    'id': book.id,
                    'name': book.name,
                    'author': book.author,
                    'category': book.category,
                    'description': book.description,
                    'image_url': book.image_url,
                    'quantity': book.quantity,
                    'is_available': book.is_available
                }
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            })
    return redirect('edit_book', book_id=book_id)



