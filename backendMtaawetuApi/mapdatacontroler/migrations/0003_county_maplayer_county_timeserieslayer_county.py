# Generated by Django 5.1.1 on 2025-03-23 07:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapdatacontroler', '0002_timeserieslayer_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='County',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='maplayer',
            name='county',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='mapdatacontroler.county'),
        ),
        migrations.AddField(
            model_name='timeserieslayer',
            name='county',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='mapdatacontroler.county'),
        ),
    ]
