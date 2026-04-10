import os
from mangum import Mangum

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from config.asgi import application  # noqa: E402

handler = Mangum(application)
