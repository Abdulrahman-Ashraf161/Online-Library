from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('signup/', views.signup_view, name='signup'),
    
    # Book browsing and details
    path('books/', views.user_list_books, name='list_books'),
    path('books/details/<int:book_id>/', views.view_book_details, name='view_book_details'),
    path('search/', views.search_books, name='search_books'),
    
    # Book borrowing
    path('books/borrow/<int:book_id>/', views.borrow_book, name='borrow_book'),
    
    # Book returning
    path('books/return/<int:book_id>/', views.return_book, name='return_book'),
    
    # My books
    path('my-books/', views.my_borrowed_books, name='user_dashboard'),
    path('my-books/data/', views.my_borrowed_books_data, name='my_borrowed_books_data'),
    
    # User dashboard and profile
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
    
    # Admin routes
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/books/add/', views.add_book, name='add_book'),
    path('admin/books/edit/<int:book_id>/', views.edit_book, name='edit_book'),
    path('admin/books/delete/<int:book_id>/', views.delete_book, name='delete_book'),
    path('admin/books/<int:book_id>/details/', views.get_book_details, name='get_book_details'),

    
    # Home page
    path('', views.index, name='index'),

    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)












