import os

env = os.environ.get("ENVIRONMENT", "development")

if env == "production":
    from .production import *
elif env == "test":
    from .test import *
else:
    from .local import *
