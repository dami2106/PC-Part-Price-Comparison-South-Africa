# Generated by Django 5.0 on 2023-12-11 18:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("polls", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="price",
            name="product_id",
        ),
        migrations.RemoveField(
            model_name="price",
            name="store_id",
        ),
        migrations.DeleteModel(
            name="Product",
        ),
        migrations.DeleteModel(
            name="Price",
        ),
        migrations.DeleteModel(
            name="Store",
        ),
    ]
