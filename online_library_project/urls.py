from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import os
from online_library import views

urlpatterns = [
    path('admin_builtin/', admin.site.urls),
    path('', include('online_library.urls')),
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/books/', views.admin_list_books, name='admin_list_books'),
    path('admin/books/add/', views.add_book, name='add_book'),
    path('admin/books/edit/<int:book_id>/', views.edit_book, name='edit_book'),
    path('admin/books/delete/<int:book_id>/', views.delete_book, name='delete_book'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    # مسارات المستخدم العادي
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    path('books/', views.user_list_books, name='user_list_books'),
    path('books/<int:book_id>/', views.view_book_details, name='view_book_details'),
    path('books/borrow/<int:book_id>/', views.borrow_book, name='borrow_book'),
    path('my-books/', views.my_borrowed_books, name='my_borrowed_books'),
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
    path('books/search/', views.search_books, name='search_books'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


