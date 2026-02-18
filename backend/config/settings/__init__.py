import os

env = os.environ.get("ENVIRONMENT", "development")

if env == "production":
    from .production import *  # noqa: F403
elif env == "test":
    from .test import *  # noqa: F403
else:
    from .local import *  # noqa: F403
