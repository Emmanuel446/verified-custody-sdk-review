# Verified Custody SDK Security Review

This repository demonstrates a Proof of Concept (PoC) highlighting security issues found in the `@verified-network/verified-custody` package.  

---

## 🛑 Main Issue 1 — Custody SDK exposes internal security‑critical components

The `@verified-network/verified-custody` package **publicly exports internal UI pages, vault context, and security flows** that should **never** be part of a custody SDK’s public API.

### 🔍 Proof (Observed)

The SDK exposes:

- PIN & OTP pages: `CreatePinPage`, `EnterPinPage`, `OTPPage`
- Onboarding flows: `FTUPage`
- `VaultContextProvider`

### ⚠️ Why this is bad

- Breaks trust boundaries between SDK consumer and wallet internals  
- Allows unintended mounting or reuse of security flows  
- Expands attack surface around PIN, OTP, and vault state handling

**Severity:** High — This is a **security design flaw**.

---

## 🛑 Main Issue 2 — Unrestricted access to cryptographic primitives

The SDK exposes **low-level cryptographic helpers** directly, without enforcing custody flow, authorization, or environment constraints.

### 🔍 Proof

Public exports include:

- `encryptString`, `decryptString`  
- `encryptWithPasskey`, `decryptWithPasskey`  
- `hashTheString`, `hashTheBuffer`  
- `publicKeyCredentialRequestOptions`

### ⚠️ Why this is bad

- Any app can misuse encryption/decryption helpers  
- Cryptographic operations are callable outside intended wallet lifecycle  
- Violates principle of least privilege for custody systems

**Severity:** High — Directly affects key handling assumptions.

---

## 📂 Notes

- PoC experiments are included in `poc.js`.  
- `node_modules` is ignored in this repo to keep the submission lightweight.  
- This review is intended for responsible disclosure and educational purposes.
