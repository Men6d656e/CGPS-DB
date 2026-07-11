"""
RSA Encryption Utilities — Encrypt/decrypt sensitive fields (CNIC, B-Form)
Uses RSA-OAEP with SHA-256 for secure asymmetric encryption.
"""

import base64
import hashlib
import binascii
from typing import Optional

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.serialization import (
    load_pem_private_key,
    load_pem_public_key,
    Encoding,
    PrivateFormat,
    PublicFormat,
    NoEncryption,
)
from cryptography.hazmat.backends import default_backend

from app.config import settings


# ─── Key Management ───────────────────────────────────────────────────────────

def generate_rsa_key_pair(key_size: int = 2048) -> tuple[str, str]:
    """Generate a new RSA key pair. Returns (private_key_pem, public_key_pem)."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size,
        backend=default_backend(),
    )
    private_pem = private_key.private_bytes(
        encoding=Encoding.PEM,
        format=PrivateFormat.PKCS8,
        encryption_algorithm=NoEncryption(),
    ).decode("utf-8")

    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=Encoding.PEM,
        format=PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    return private_pem, public_pem


def _load_private_key(pem: Optional[str] = None):
    """Load RSA private key from PEM string. Falls back to settings."""
    key_pem = pem or settings.RSA_PRIVATE_KEY
    if not key_pem:
        raise ValueError(
            "RSA_PRIVATE_KEY not configured. Generate keys with: "
            "python -c 'from app.encryption import generate_rsa_key_pair; "
            "priv, pub = generate_rsa_key_pair(); print(priv); print(pub)'"
            "and add RSA_PRIVATE_KEY and RSA_PUBLIC_KEY to your .env file."
        )
    return load_pem_private_key(key_pem.encode("utf-8"), password=None, backend=default_backend())


def _load_public_key(pem: Optional[str] = None):
    """Load RSA public key from PEM string. Falls back to settings."""
    key_pem = pem or settings.RSA_PUBLIC_KEY
    if not key_pem:
        # Derive from private key if public key not provided separately
        private_key = _load_private_key()
        return private_key.public_key()
    return load_pem_public_key(key_pem.encode("utf-8"), backend=default_backend())


# ─── Encryption / Decryption ──────────────────────────────────────────────────

def encrypt_field(plain_text: str) -> str:
    """
    Encrypt a plaintext string using RSA-OAEP with SHA-256.
    Returns a base64-encoded ciphertext string.
    """
    if not plain_text:
        return plain_text
    public_key = _load_public_key()
    ciphertext = public_key.encrypt(
        plain_text.encode("utf-8"),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return base64.b64encode(ciphertext).decode("utf-8")


def is_encrypted(value: str) -> bool:
    """
    Check whether a value is RSA-encrypted (base64-encoded ciphertext)
    or plaintext.  Returns True if it looks like valid RSA ciphertext.
    Handles the case where existing data was never encrypted after the
    schema migration.
    """
    if not value:
        return False
    # RSA-encrypted values are always valid base64
    try:
        raw = base64.b64decode(value.encode("utf-8"), validate=True)
    except (binascii.Error, ValueError):
        return False
    # RSA-2048 ciphertext is exactly 256 bytes; RSA-4096 would be 512.
    # Accept either to stay flexible if key size changes in the future.
    return len(raw) in (256, 512)


def decrypt_field(cipher_text: str) -> str:
    """
    Decrypt a base64-encoded ciphertext back to the original plaintext.
    If the value is already plaintext (e.g. legacy data that was never
    encrypted), it is returned as-is.
    Returns the original plaintext string.
    """
    if not cipher_text:
        return cipher_text
    if not is_encrypted(cipher_text):
        # Value is already plaintext — legacy data or already decrypted
        return cipher_text
    private_key = _load_private_key()
    cipher_bytes = base64.b64decode(cipher_text.encode("utf-8"))
    plain_bytes = private_key.decrypt(
        cipher_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return plain_bytes.decode("utf-8")


# ─── Hashing for Uniqueness ───────────────────────────────────────────────────

def hash_for_dedup(value: str) -> str:
    """
    Create a SHA-256 hash of the plaintext value for uniqueness checking.
    Since RSA encryption produces different ciphertexts each time (due to
    OAEP random padding), we store a hash separately for uniqueness checks.
    """
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


# ─── Bulk Re-encryption Helpers ───────────────────────────────────────────────

def ensure_encrypted(value: str) -> tuple[str, str]:
    """
    Given a value that may be plaintext OR already RSA-encrypted, return a
    tuple of (encrypted_value, hash_for_dedup_of_plaintext).

    - If *value* is already encrypted → returns (value, hash).
    - If *value* is plaintext → encrypts it and returns (ciphertext, hash).

    This is idempotent — safe to call on any CNIC/B-Form field.
    """
    if is_encrypted(value):
        # Already encrypted — decrypt first so we can compute the hash
        plain = decrypt_field(value)
        return value, hash_for_dedup(plain)
    # Plaintext — encrypt and hash
    return encrypt_field(value), hash_for_dedup(value)
