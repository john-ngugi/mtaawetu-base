# Generated by Django 5.1.1 on 2025-05-01 16:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapdatacontroler', '0013_remove_maplayer_category_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='timeserieslayer',
            name='year',
            field=models.IntegerField(default=2024, max_length=4),
        ),
    ]
