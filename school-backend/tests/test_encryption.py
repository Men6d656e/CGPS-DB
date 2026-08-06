"""
Encryption Tests — keyed dedup hashing (HMAC-SHA256)
"""

import hashlib

from app.encryption import hash_for_dedup


class TestHashForDedup:
    """Test the keyed HMAC-SHA256 dedup hash."""

    def test_deterministic(self):
        """Same input must always produce the same hash."""
        assert hash_for_dedup("35201-1234567-1") == hash_for_dedup("35201-1234567-1")

    def test_differs_across_values(self):
        """Different values must produce different hashes."""
        assert hash_for_dedup("35201-1234567-1") != hash_for_dedup("35201-1234567-2")

    def test_keyed_not_plain_sha256(self):
        """
        The output must be an HMAC (keyed), NOT a raw SHA-256 digest —
        otherwise the low-entropy CNIC space could be brute-forced offline.
        """
        value = "35201-1234567-1"
        assert hash_for_dedup(value) != hashlib.sha256(value.encode("utf-8")).hexdigest()

    def test_length(self):
        """HMAC-SHA256 output is 64 hex chars."""
        assert len(hash_for_dedup("35201-1234567-1")) == 64
