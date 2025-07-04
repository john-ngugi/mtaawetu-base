# management/commands/create_packages.py
from django.core.management.base import BaseCommand
from django.db import transaction
from coreApi.models import Package  # Replace 'your_app' with your actual app name

class Command(BaseCommand):
    help = 'Create default packages for the application'
    
    def handle(self, *args, **options):
        packages_data = [
            {
                'name': 'FREE',
                'price': 0.00,
                'duration_days': 365,  # Free for a year
                'features': {
                    'max_posts': 5,
                    'max_images': 10,
                    'analytics': False,
                    'priority_support': False,
                    'api_access': False,
                    'custom_branding': False
                }
            },
            {
                'name': 'BASIC',
                'price': 9.99,
                'duration_days': 30,
                'features': {
                    'max_posts': 50,
                    'max_images': 100,
                    'analytics': True,
                    'priority_support': False,
                    'api_access': False,
                    'custom_branding': False
                }
            },
            {
                'name': 'PREMIUM',
                'price': 19.99,
                'duration_days': 30,
                'features': {
                    'max_posts': 200,
                    'max_images': 500,
                    'analytics': True,
                    'priority_support': True,
                    'api_access': True,
                    'custom_branding': False
                }
            },
            {
                'name': 'ENTERPRISE',
                'price': 49.99,
                'duration_days': 30,
                'features': {
                    'max_posts': -1,  # Unlimited
                    'max_images': -1,  # Unlimited
                    'analytics': True,
                    'priority_support': True,
                    'api_access': True,
                    'custom_branding': True,
                    'dedicated_manager': True
                }
            }
        ]
        
        with transaction.atomic():
            created_count = 0
            updated_count = 0
            
            for package_data in packages_data:
                package, created = Package.objects.get_or_create(
                    name=package_data['name'],
                    defaults={
                        'price': package_data['price'],
                        'duration_days': package_data['duration_days'],
                        'features': package_data['features'],
                        'is_active': True
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created package: {package.name}')
                    )
                else:
                    # Update existing package
                    package.price = package_data['price']
                    package.duration_days = package_data['duration_days']
                    package.features = package_data['features']
                    package.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'Updated package: {package.name}')
                    )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully processed packages: {created_count} created, {updated_count} updated'
                )
            )