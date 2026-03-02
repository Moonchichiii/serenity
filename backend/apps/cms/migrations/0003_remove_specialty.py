from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("cms", "0002_serenitysettings_address_full_serenitysettings_email"),
    ]

    operations = [
        migrations.DeleteModel(
            name="Specialty",
        ),
        migrations.RemoveField(
            model_name="homepage",
            name="about_specialties_title_en",
        ),
        migrations.RemoveField(
            model_name="homepage",
            name="about_specialties_title_fr",
        ),
    ]
