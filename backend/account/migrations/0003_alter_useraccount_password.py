# Generated by Django 5.1.3 on 2025-02-10 09:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0002_alter_useraccount_password'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useraccount',
            name='password',
            field=models.CharField(max_length=128),
        ),
    ]
