"""
Shared SlowAPI limiter instance.

Previously both main.py and routers.py created their own Limiter instances.
This single instance is used by both: main.py attaches it to app.state.limiter
and registers the exception handler, while routers.py uses it for the
@limiter.limit(...) decorator.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
