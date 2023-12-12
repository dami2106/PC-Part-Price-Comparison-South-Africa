from django.db import models

# Create your models here.
class Price(models.Model):
    price_id = models.AutoField(primary_key=True, blank=True)
    store = models.ForeignKey('Store', models.DO_NOTHING, blank=True, null=True)
    product = models.ForeignKey('Product', models.DO_NOTHING, blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=5, blank=True, null=True)  # max_digits and decimal_places have been guessed, as this database handles decimal fields as float

    class Meta:
        managed = False
        db_table = 'Price'


class Product(models.Model):
    product_id = models.AutoField(primary_key=True, blank=True)
    product_name = models.TextField(blank=True, null=True)
    product_category = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Product'


class Store(models.Model):
    store_id = models.AutoField(primary_key=True, blank=True)
    store_name = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Store'