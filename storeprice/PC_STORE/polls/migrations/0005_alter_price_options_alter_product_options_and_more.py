# Generated by Django 5.0 on 2023-12-11 19:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("polls", "0004_alter_price_table_alter_product_table_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="price",
            options={"managed": False},
        ),
        migrations.AlterModelOptions(
            name="product",
            options={"managed": False},
        ),
        migrations.AlterModelOptions(
            name="store",
            options={"managed": False},
        ),
    ]