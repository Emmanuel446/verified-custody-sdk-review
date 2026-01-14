🛡️ Security Audit Report: @verified-network/verified-custody
🚨 MAIN ISSUE 1 — Custody SDK exposes internal security‑critical components
The @verified-network/verified-custody package publicly exports internal UI pages, vault context, and security flows that should never be part of a custody SDK’s public API.

🔍 Proof (Observed Vulnerability)
The SDK exposes the following internal components:

Authentication Pages: PIN & OTP pages (CreatePinPage, EnterPinPage, OTPPage)

Onboarding: Onboarding flows (FTUPage)

State Management: VaultContextProvider

⚠️ Why this is bad
Trust Boundaries: Breaks trust boundaries between the SDK consumer and wallet internals.

Logic Misuse: Allows unintended mounting or reuse of security flows.

Attack Surface: Expands the attack surface around PIN, OTP, and vault state handling.

Severity:

This is a fundamental security design flaw.

🚨 MAIN ISSUE 2 — Unrestricted access to cryptographic primitives
The SDK exposes low‑level cryptographic helpers directly, without enforcing custody flow, authorization, or environment constraints.

🔍 Proof (Observed Vulnerability)
Public exports include:

encryptString, decryptString

encryptWithPasskey, decryptWithPasskey

hashTheString, hashTheBuffer

publicKeyCredentialRequestOptions

⚠️ Why this is bad
Misuse: Any app can misuse encryption/decryption helpers.

Lifecycle Violations: Cryptographic operations are callable outside the intended wallet lifecycle.

Least Privilege: Violates the principle of least privilege for custody systems.

Severity:

This directly affects key handling assumptions.
