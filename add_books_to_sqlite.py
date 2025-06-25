import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'online_library_project.settings')
django.setup()
from online_library.models import Book


books = [
    # Tech category
    {
        'name': 'Algorithm Basics',
        'author': 'John Doe',
        'category': 'Tech',
        'description': 'A book about fundamental algorithms.',
        'image_url': 'https://m.media-amazon.com/images/I/61ZYxrQEpCL._AC_UF1000,1000_QL80_.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Advanced Algorithms',
        'author': 'Jane Smith',
        'category': 'Tech',
        'description': 'Deep dive into complex algorithms.',
        'image_url': 'https://images-cdn.ubuy.co.id/659a29640fdc025a183f6e12-pre-owned-algorithms-4th-edition.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Clean Code',
        'author': 'Robert C. Martin',
        'category': 'Tech',
        'description': 'Guide to writing clean and maintainable code.',
        'image_url': 'https://m.media-amazon.com/images/I/71T7aD3EOTL._UF1000,1000_QL80_.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Learning Python',
        'author': 'Mark Lutz',
        'category': 'Tech',
        'description': 'Comprehensive Python programming guide.',
        'image_url': 'https://www.magazinesdirect.com/images/covers/vlarge-BKZ-B6622.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'JavaScript Essentials',
        'author': 'Douglas Crockford',
        'category': 'Tech',
        'description': 'Core concepts of JavaScript programming.',
        'image_url': 'https://images.manning.com/360/480/resize/book/4/48bdbd0-19ed-4259-898b-88e9fd2b7a32/Larsen_hires.png',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Pragmatic Programming',
        'author': 'Andrew Hunt',
        'category': 'Tech',
        'description': 'Tips and best practices for programmers.',
        'image_url': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvpVYaJ2clBPnAgpBI_mfOrwMzbBfvB3M5bg&s',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Code Complete',
        'author': 'Steve McConnell',
        'category': 'Tech',
        'description': 'Software construction best practices.',
        'image_url': 'https://m.media-amazon.com/images/I/61GzazUmKyL._AC_UF1000,1000_QL80_.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Design Patterns',
        'author': 'Erich Gamma',
        'category': 'Tech',
        'description': 'Elements of reusable object-oriented software.',
        'image_url': 'https://refactoring.guru/images/patterns/book/web-cover-en.png',
        'is_available': True,
        'quantity': 10,
    },

    # History category
    {
        'name': 'Ancient World',
        'author': 'Mary Beard',
        'category': 'History',
        'description': 'Exploration of ancient civilizations.',
        'image_url': 'https://m.media-amazon.com/images/I/71OXQZezcnL._AC_UF1000,1000_QL80_.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'People of History',
        'author': 'David McCullough',
        'category': 'History',
        'description': 'Stories of influential historical figures.',
        'image_url': 'data:image/jpeg;base64,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',
        'is_available': True,
    },
    {
        'name': 'The Mythical Man-Month',
        'author': 'Frederick P. Brooks Jr.',
        'category': 'History',
        'description': 'Essays on software engineering and project management.',
        'image_url': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348430512i/13629.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Harry Potter',
        'author': 'J.K. Rowling',
        'category': 'History',
        'description': 'Fantasy novel about a young wizard.',
        'image_url': 'https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_360,c_scale,dpr_1.5/jackets/9781408855652.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Spoke',
        'author': 'Jay Asher',
        'category': 'History',
        'description': 'Historical fiction exploring past mysteries.',
        'image_url': 'https://m.media-amazon.com/images/I/61UBLRI1t-L._AC_UF1000,1000_QL80_.jpg',
        'is_available': True,
        'quantity': 10,
    },

    # Horror category
    {
        'name': 'Dracula',
        'author': 'Bram Stoker',
        'category': 'Horror',
        'description': 'Classic vampire horror novel.',
        'image_url': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1686868947i/178621062.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Frankenstein',
        'author': 'Mary Shelley',
        'category': 'Horror',
        'description': 'Gothic novel about a scientist and his creation.',
        'image_url': 'https://cloud.firebrandtech.com/api/v2/image/111/9780785839880/CoverArtHigh/XL',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'IT',
        'author': 'Stephen King',
        'category': 'Horror',
        'description': 'Horror novel about a shape-shifting entity.',
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/It_%281986%29_front_cover%2C_first_edition.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'The Shining',
        'author': 'Stephen King',
        'category': 'Horror',
        'description': 'Psychological horror novel set in a haunted hotel.',
        'image_url': 'https://prodimage.images-bn.com/pimages/9780345806789_p0_v8_s1200x630.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Guns and Steel',
        'author': 'Jared Diamond',
        'category': 'Horror',
        'description': 'Explores factors behind the fate of human societies.',
        'image_url': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1453215833i/1842.jpg',
        'is_available': True,
        'quantity': 10,
    },

    # Friendly category
    {
        'name': 'Cat in the Hat',
        'author': 'Dr. Seuss',
        'category': 'Friendly',
        'description': 'Children’s book about a mischievous cat.',
        'image_url': 'https://m.media-amazon.com/images/I/61n2olkhm8L._AC_UF1000,1000_QL80_.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Chocolate Web',
        'author': 'Alice Author',
        'category': 'Friendly',
        'description': 'A sweet story for kids.',
        'image_url': 'https://m.media-amazon.com/images/I/916JW20V3yL._AC_UF1000,1000_QL80_.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'The Art of War',
        'author': 'Sun Tzu',
        'category': 'Friendly',
        'description': 'Ancient Chinese military treatise.',
        'image_url': 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781626860605/the-art-of-war-9781626860605_hr.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Refactor',
        'author': 'Martin Fowler',
        'category': 'Friendly',
        'description': 'Improving the design of existing code.',
        'image_url': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1543958218i/35135772.jpg',
        'is_available': True,
        'quantity': 10,
    },
    {
        'name': 'Republic',
        'author': 'Plato',
        'category': 'Friendly',
        'description': 'Philosophical dialogue on justice and politics.',
        'image_url': 'https://m.media-amazon.com/images/I/91MRDNc-mIL._UF1000,1000_QL80_.jpg',
        'is_available': True,
        'quantity': 10,
    },
]

for book_data in books:
    book = Book.objects.create(**book_data)
    print(f"Added: {book.name} with quantity: {book.quantity}")

print("All books added successfully!")


