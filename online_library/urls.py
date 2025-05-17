from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'), # index view was also updated to render Index.html directly
    path('signup/', views.signup_view, name='signup'), # Updated to signup_view
    path('login/', views.login_view, name='login'),     # Updated to login_view
    path('logout/', views.logout_view, name='logout'),   # Updated to logout_view
    

    # Admin URLs
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/books/', views.admin_list_books, name='admin_list_books'),
    path('admin/books/add/', views.add_book, name='add_book'),
    path('admin/books/edit/<int:book_id>/', views.edit_book, name='edit_book'),
    path('admin/books/delete/<int:book_id>/', views.delete_book, name='delete_book'),

    # User URLs
    path('dashboard/', views.user_dashboard, name='user_dashboard'), # This might be intended to be Index.html or a specific user dashboard page
    path('books/', views.user_list_books, name='user_list_books'),
    path('books/search/', views.search_books, name='search_books'),
    path('books/<int:book_id>/', views.view_book_details, name='view_book_details'),
    path('books/borrow/<int:book_id>/', views.borrow_book, name='borrow_book'),
    path('my-books/', views.my_borrowed_books, name='my_borrowed_books'),

    # Profile URLs
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
]

