MAIN ISSUE #1 — Custody SDK exposes internal security‑critical components

The @verified-network/verified-custody package publicly exports internal UI pages, vault context, and security flows that should never be part of a custody SDK’s public API.

Proof (what i actually observed):
The SDK exposes:

PIN & OTP pages (CreatePinPage, EnterPinPage, OTPPage)

Onboarding flows (FTUPage)

VaultContextProvider

Why this is bad:

Breaks trust boundaries between SDK consumer and wallet internals

Allows unintended mounting or reuse of security flows

Expands attack surface around PIN, OTP, and vault state handling

Severity: High
This is a security design flaw.

MAIN ISSUE #2 — Unrestricted access to cryptographic primitives

The SDK exposes low‑level cryptographic helpers directly, without enforcing custody flow, authorization, or environment constraints.

Proof:
Public exports include:

encryptString, decryptString

encryptWithPasskey, decryptWithPasskey

hashTheString, hashTheBuffer

publicKeyCredentialRequestOptions

Why this is bad:

Any app can misuse encryption/decryption helpers

Cryptographic operations are callable outside intended wallet lifecycle

Violates principle of least privilege for custody systems

Severity: High
This directly affects key handling assumptions.