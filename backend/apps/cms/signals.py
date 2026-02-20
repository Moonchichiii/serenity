# from django.core.cache import cache
# from django.db.models.signals import post_delete, post_save
# from django.dispatch import receiver
# from wagtail.models import Site

# from apps.cms.pages import HeroSlide, HomePage, Specialty
# from apps.cms.settings import GiftSettings, SerenitySettings

# # Import Service model for cache invalidation
# try:
#     from apps.services.models import Service
# except ImportError:
#     Service = None


# def _delete_hydrated_cache():
#     """Clears the combined hydrated cache for all sites and languages."""
#     site_ids = list(Site.objects.values_list("id", flat=True)) or [0]
#     for site_id in site_ids:
#         cache.delete(f"cms:hydrated:{site_id}:all")


# def _delete_homepage_cache_variants():
#     """Clears specific homepage caches + the hydrated bundle."""
#     site_ids = list(Site.objects.values_list("id", flat=True)) or [0]
#     for lang in ("en", "fr"):
#         for site_id in site_ids:
#             cache.delete(f"cms:homepage:{site_id}:{lang}")
#     _delete_hydrated_cache()


# def _delete_globals_cache():
#     """Clears global settings cache."""
#     site_ids = list(Site.objects.values_list("id", flat=True)) or [0]
#     for site_id in site_ids:
#         cache.delete(f"cms:globals:{site_id}")


# @receiver([post_save, post_delete], sender=HomePage)
# def clear_homepage_cache_on_homepage(sender, **kwargs):
#     _delete_homepage_cache_variants()


# @receiver([post_save, post_delete], sender=HeroSlide)
# def clear_homepage_cache_on_slide(sender, **kwargs):
#     _delete_homepage_cache_variants()


# @receiver([post_save, post_delete], sender=Specialty)
# def clear_homepage_cache_on_specialty(sender, **kwargs):
#     _delete_homepage_cache_variants()


# @receiver([post_save, post_delete], sender=GiftSettings)
# def clear_globals_cache_on_gift_settings(sender, **kwargs):
#     _delete_globals_cache()
#     _delete_hydrated_cache()


# @receiver([post_save, post_delete], sender=SerenitySettings)
# def clear_globals_cache_on_serenity_settings(sender, **kwargs):
#     _delete_globals_cache()
#     _delete_hydrated_cache()


# if Service is not None:

#     @receiver([post_save, post_delete], sender=Service)
#     def clear_services_cache(sender, **kwargs):
#         cache.delete("cms:services")
#         _delete_hydrated_cache()
