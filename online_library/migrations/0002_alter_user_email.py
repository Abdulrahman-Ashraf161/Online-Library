# Generated by Django 5.2.1 on 2025-05-17 09:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('online_library', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
    ]
