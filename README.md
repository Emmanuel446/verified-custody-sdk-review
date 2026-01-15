# 🚨 Verified Wallet Chrome Extension — Trust Boundary Bypass via Verified Custody SDK

## 🎯 Target Asset & Scope

This security research **originated from reviewing the Verified Wallet Chrome Extension**.

While inspecting the extension’s bundled code, runtime behavior, and dependency structure
for potential vulnerabilities, it became clear that the extension delegates nearly all
security‑critical wallet functionality to the `@verified-network/verified-custody` SDK.

These responsibilities include:

- Custody lifecycle enforcement
- Vault state management
- Authentication and onboarding flows
- Cryptographic and passkey-related operations

Because the extension relies on the SDK for these guarantees,
**any weakness in the SDK directly impacts the security posture of the wallet extension**.

This led to a focused analysis of the SDK as an extension‑level attack surface.

---

## 🔍 Discovery — Broken Extension ↔ SDK Trust Assumption

During extension analysis, the following observations were made:

- Internal wallet UI flows are imported directly from the SDK
- Platform trust is determined dynamically via SDK configuration
- Cryptographic and authentication helpers are not implemented inside the extension itself

This creates a critical trust assumption:

> The SDK is responsible for enforcing execution environment restrictions and custody integrity.

Testing this assumption showed that it **does not hold**.

---

## 🛑 Main Issue — SDK exposes internal wallet components and cryptographic primitives

The `@verified-network/verified-custody` SDK publicly exposes **internal wallet UI flows**
and **low‑level cryptographic / authentication helpers** that are assumed to be
extension‑only, but are in fact accessible in arbitrary Node.js or web environments.

Because the SDK does **not enforce execution context**, sensitive wallet logic can be
mounted or invoked **outside the intended custody lifecycle**, resulting in a
trust‑boundary violation between the extension and SDK consumers.

---

## 🔍 Proof — Publicly Exposed Security‑Critical APIs

Inspection of SDK exports and runtime behavior confirms that the following
internals are publicly available:

### 🧩 Internal Wallet UI Flows
- `CreatePinPage`
- `EnterPinPage`
- `OTPPage`
- `FTUPage`

### 🏦 Custody / Vault State
- `VaultContextProvider`

### 🔐 Cryptographic & Authentication Helpers
- `encryptString`, `decryptString`
- `encryptWithPasskey`, `decryptWithPasskey`
- `hashTheString`, `hashTheBuffer`
- `publicKeyCredentialRequestOptions`

These APIs are callable **outside the extension environment**
without enforced custody authorization or platform validation.

---

## 💥 Security Impact

As demonstrated in the PoC:

- Internal wallet authentication flows can be rendered outside the extension
- Platform trust can be spoofed via SDK initialization
- Passkey / authentication request material can be generated externally
- Cryptographic helpers are reachable without custody state enforcement
- Unauthorized invocation leads to runtime crashes, creating denial‑of‑service vectors

Even if the extension UI enforces correct user behavior,
the SDK exposure allows security‑critical wallet logic to be accessed
**outside the extension**, introducing a **supply‑chain and trust‑boundary risk**
affecting all SDK consumers.

---

## 📊 Severity Assessment

**Severity:** 🚨 High  
**Estimated CVSS:** 7.8 – 8.4

**Impact Includes:**
- Major custody‑flow and environment trust bypass
- Unauthorized generation of authentication primitives
- Cryptographic misuse and denial‑of‑service vectors
- Systemic risk across all applications using the SDK

> While direct private key extraction was not demonstrated,
> the exposed attack surface significantly weakens custody guarantees
> and lowers the barrier for future exploitation.

---

## ▶️ Reproduction Steps

From a clean environment:

```bash
# Clone the repository
git clone https://github.com/Emmanuel446/verified-custody-sdk-review.git
cd POC

# Install dependencies
npm install

# Run the proof of concept
node poc-exposed-api.js
