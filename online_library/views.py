# New views.py content
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate # login, logout are now aliased
from django.contrib.auth import login as auth_login, logout as auth_logout # Aliased imports
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from datetime import timedelta
from .forms import CustomUserCreationForm, CustomAuthenticationForm, BookForm, SearchForm # Assuming these exist
from .models import Book, BorrowedBook # Assuming these exist
from django.contrib import messages
from itertools import groupby
from django.db.models import Count



def is_admin_check(user):
    return user.is_authenticated and user.is_admin

# --- Authentication Views ---
def signup_view(request): # Renamed
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user) # Use aliased login
            messages.success(request, "Registration successful! You are now logged in.")
            if user.is_admin:
                return redirect('admin_dashboard')
            else:
                return redirect('user_dashboard')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field.capitalize()}: {error}")
    else:
        form = CustomUserCreationForm()
    return render(request, 'Register.html', {'form': form, 'page_title': 'Sign Up'})

def login_view(request):
    print(f"Accessing login view, method: {request.method}")
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            auth_login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            if user.is_admin:
                print("Redirecting to admin_dashboard")
                return redirect('admin_dashboard')
            else:
                print("Redirecting to index")
                return redirect('index')
        else:
            print("Form invalid, errors:", form.errors)
            messages.error(request, "Invalid email or password.")
    else:
        form = CustomAuthenticationForm()
    return render(request, 'Login.html', {'form': form, 'page_title': 'Login'})

@login_required(login_url='login')
def logout_view(request): # Renamed
    auth_logout(request) # Use aliased logout
    messages.info(request, "You have been successfully logged out.")
    return redirect('login') # Redirect to login view

# --- Admin Views ---
@user_passes_test(is_admin_check, login_url='login')
def admin_dashboard(request):
    try:
        featured_books = Book.objects.all()[:6]
    except NameError:
        featured_books = []
        messages.warning(request, "Admin Dashboard: Could not load featured books. Book model might be missing.")
    except Exception as e:
        featured_books = []
        messages.error(request, f"Admin Dashboard: Error loading featured books: {str(e)}")

    context = {
        'page_title': 'Admin Dashboard',
        'featured_books': featured_books,
        'user': request.user
    }
    return render(request, 'admin.html', context)


@user_passes_test(is_admin_check, login_url='login')
def add_book(request):
    if request.method == 'POST':
        form = BookForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Book added successfully!")
            return redirect('admin_list_books')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field.capitalize()}: {error}")
    else:
        form = BookForm()
    return render(request, 'edit_book_details.html', {'form': form, 'page_title': 'Add New Book', 'is_add_book': True})

@user_passes_test(is_admin_check, login_url='login')
def admin_list_books(request):
    books = Book.objects.all().order_by('name')
    return render(request, 'list-books.html', {'books': books, 'page_title': 'Manage Books', 'is_admin': True})

@user_passes_test(is_admin_check, login_url='login')
def edit_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    if request.method == 'POST':
        form = BookForm(request.POST, instance=book)
        if form.is_valid():
            form.save()
            messages.success(request, "Book details updated successfully!")
            return redirect('admin_list_books')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field.capitalize()}: {error}")
    else:
        form = BookForm(instance=book)
    return render(request, 'edit_book_details.html', {'form': form, 'book': book, 'page_title': 'Edit Book Details'})

@user_passes_test(is_admin_check, login_url='login')
@require_POST
def delete_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    try:
        book.delete()
        return JsonResponse({'status': 'success', 'message': 'Book deleted successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# --- User Views ---
@login_required(login_url='login')
def user_dashboard(request):
    borrowed_book_records = BorrowedBook.objects.filter(user=request.user).select_related('book')
    return render(request, 'MyBooks.html', {'page_title': 'My Dashboard', 'borrowed_books': borrowed_book_records})


@login_required(login_url='login')
def user_list_books(request):
    # Get all books and order by category for grouping
    all_books = Book.objects.all().order_by('category', 'name')
    
    # Get list of all categories with book counts
    categories = Book.objects.values('category').annotate(count=Count('id')).order_by('category')
    
    # Create a dictionary of books grouped by category
    books_by_category = {}
    for category, books in groupby(all_books, key=lambda x: x.category):
        if category:  # Skip empty categories
            books_by_category[category] = list(books)
    
    context = {
        'books': all_books,  # Keep the original list for backward compatibility
        'books_by_category': books_by_category,  # Add the grouped books
        'categories': categories,  # Add category list with counts
        'page_title': 'List of Books',
    }
    return render(request, 'list-books.html', context)

@login_required(login_url='login')
def view_book_details(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    return render(request, 'view_book_details.html', {'book': book, 'page_title': book.name})

@login_required(login_url='login')
@require_POST
def borrow_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    if book.is_available:
        due_date = timezone.now().date() + timedelta(days=14)
        try:
            BorrowedBook.objects.create(user=request.user, book=book, due_date=due_date)
            book.is_available = False
            book.save()
            return JsonResponse({'status': 'success', 'message': 'Book borrowed successfully!'})
        except Exception as e: 
            return JsonResponse({'status': 'error', 'message': f'Error borrowing book: {str(e)}'}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Book is not available.'}, status=400)

@login_required(login_url='login')
def my_borrowed_books(request):
    borrowed_books = BorrowedBook.objects.filter(user=request.user).select_related('book')
    return render(request, 'MyBooks.html', {'borrowed_books': borrowed_books, 'page_title': 'My Borrowed Books'})

@login_required(login_url='login')
def search_books(request):
    form = SearchForm(request.GET)
    results_from_db = []
    query_string = ""

    if form.is_valid():
        query_string = form.cleaned_data.get('q')
        search_by = form.cleaned_data.get('search_by')
        if query_string:
            base_query = Book.objects.all()
            if search_by == 'author':
                results_from_db = list(base_query.filter(author__icontains=query_string).distinct())
            elif search_by == 'category':
                results_from_db = list(base_query.filter(category__icontains=query_string).distinct())
            else: 
                results_from_db = list(base_query.filter(name__icontains=query_string).distinct())

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        data = [{'id': book.id, 'name': book.name, 'author': book.author, 'category': book.category, 'is_available': book.is_available} for book in results_from_db]
        return JsonResponse({'books': data})

    return render(request, 'list-books.html', {'books': results_from_db, 'page_title': 'Search Results', 'query': query_string, 'is_search': True, 'search_form': form})

# --- Profile Views ---
@login_required(login_url='login')
def profile(request):
    print(f"User authenticated: {request.user.is_authenticated}")
    print(f"User: {request.user}")
    return render(request, 'profile.html', {'page_title': 'My Profile', 'user_profile': request.user})

@login_required(login_url='login')
def edit_profile(request):
    if request.method == 'POST':
        messages.success(request, "Profile updated successfully (Placeholder - no actual update implemented).")
        return redirect('profile')
    return render(request, 'edit-profile.html', {'page_title': 'Edit Profile'})

@login_required(login_url='login')
def change_password(request):
    from django.contrib.auth.forms import PasswordChangeForm
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            from django.contrib.auth import update_session_auth_hash
            update_session_auth_hash(request, user)
            messages.success(request, 'Your password was successfully updated!')
            return redirect('profile')
        else:
            for field, errors in form.errors.items():
                messages.error(request, f"{field.capitalize() if field != '__all__' else 'Form error:'} {error}")
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'change-password.html', {'form': form, 'page_title': 'Change Password'})

# --- Basic Home/Index View ---
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
