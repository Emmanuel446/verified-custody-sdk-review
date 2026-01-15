# 🚨 Verified Wallet — Trust Boundary Bypass via Verified Custody SDK

## 📖 Simple Overview (What This Is About)

This security research started while I was **reviewing the Verified Wallet Chrome Extension**
to understand how it protects users’ wallets, keys, and authentication flows.

While going through the extension, I noticed something important:

👉 **Almost all security‑critical logic is not inside the extension itself.**  
Instead, the extension depends heavily on the  
`@verified-network/verified-custody` SDK.

That means:
- If the SDK is unsafe → the wallet is unsafe
- If the SDK exposes too much → the extension inherits that risk

So I stopped looking at the UI and started testing the SDK directly.

---

## 🎯 Target Asset & Scope

**Primary target:** Verified Wallet Chrome Extension  
**Attack surface analyzed:** `@verified-network/verified-custody` SDK

The SDK is responsible for:
- Custody lifecycle enforcement
- Vault state management
- PIN / OTP / onboarding flows
- Cryptographic and authentication helpers

Because of this, **any public SDK API becomes part of the wallet’s security boundary**.

---

## 🔍 What I Discovered (The Core Problem)

The SDK **publicly exposes internal wallet components** that were clearly designed
to be used **only inside the Verified Wallet extension**.

But there is **no hard enforcement** of where or how these components can run.

In simple terms:
> The SDK *trusts* the caller — even when it shouldn’t.

---

## 🛑 Main Issue — Trust Boundary Bypass in the SDK

The `@verified-network/verified-custody` SDK exposes **internal wallet UI flows**
and **authentication / cryptographic helpers** to *any* JavaScript environment.

This allows sensitive wallet logic to be accessed **outside the extension**,
breaking the trust boundary between:
- the wallet extension (trusted)
- external apps or scripts (untrusted)

---

## 🔓 Publicly Exposed Sensitive APIs

### 🧩 Internal Wallet UI Flows
- `CreatePinPage`
- `EnterPinPage`
- `OTPPage`
- `FTUPage`

These are real wallet authentication screens.

### 🏦 Vault / Custody Context
- `VaultContextProvider`

This controls wallet state and custody flow.

### 🔐 Cryptographic & Authentication Helpers
- `encryptString`, `decryptString`
- `encryptWithPasskey`, `decryptWithPasskey`
- `hashTheString`, `hashTheBuffer`
- `publicKeyCredentialRequestOptions`

These helpers should **never** be callable without strict custody enforcement.

---

## 💥 What This Allows (Why It’s Dangerous)

Because these APIs are exposed:

- Internal wallet screens can be rendered **outside the extension**
- Platform trust can be **spoofed** by an attacker
- Authentication material can be generated in untrusted environments
- Cryptographic helpers are callable without custody authorization
- SDK misuse can cause crashes → denial‑of‑service vectors
- Wallet security becomes **assumption‑based**, not enforced

Even if the extension UI behaves correctly,
the SDK silently widens the attack surface.

---

## 🧪 Proof of Concept 1 — Internal Wallet UI Outside the Extension

This PoC shows that internal wallet UI (PIN creation) can be rendered
in a plain Node.js environment by spoofing platform checks.

**Result:**  
✅ Internal wallet UI renders outside the Verified Wallet extension.

This confirms a **trust‑boundary bypass**.

---

## 🧪 Proof of Concept 2 — Sensitive Authentication Material Leakage

This PoC shows that authentication helpers (passkey request options)
can be generated **outside the extension**, without custody enforcement.

**Observed result:**
- `publicKeyCredentialRequestOptions` returns a valid challenge object
- No extension context is required

This demonstrates **leakage of sensitive authentication primitives**.

---

## 📊 Severity Assessment

**Severity:** 🚨 High  
**Estimated CVSS:** 7.8 – 8.4

### Why this is High (not Critical):
- No direct private key extraction shown
- No unauthorized transaction signing demonstrated

### Why this is NOT Medium:
- Major trust‑boundary bypass
- Unauthorized access to authentication primitives
- SDK‑level issue affecting the wallet extension
- Real, reproducible misuse with working code

This fits squarely under:
> **High Severity — major access control bypass & sensitive data exposure**

---

## ▶️ How to Reproduce (Exactly What to Run)

```bash
# Clone the repository
git clone https://github.com/Emmanuel446/verified-custody-sdk-review.git
cd POC

# Install dependencies
npm install

# Run trust-boundary & UI exploit PoC
node poc-exposed-api.js

# Run sensitive authentication leakage PoC
node poc-sensitive-leak.js
