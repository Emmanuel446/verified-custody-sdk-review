# 🚨 Verified Wallet Chrome Extension — Trust Boundary Bypass via Verified Custody SDK

## 🎯 Target Asset & Scope

This security research **originated from a review of the Verified Wallet Chrome Extension**.

While inspecting the extension’s bundled code, runtime behavior, and dependency structure
for potential vulnerabilities, it became evident that the extension delegates nearly all
security‑critical wallet functionality to the `@verified-network/verified-custody` SDK.

These responsibilities include:

- Custody lifecycle enforcement
- Vault state management
- Authentication and onboarding flows
- Cryptographic operations

Because the extension relies entirely on the SDK for these guarantees,
**any weakness in the SDK directly affects the security posture of the wallet extension**.

This led to a focused analysis of the SDK as an extension‑level attack surface.

---

## 🔍 Discovery — Extension to SDK Trust Assumption

While reviewing the extension, the following observations were made:

- Internal wallet UI flows are imported directly from the SDK
- Platform trust is determined dynamically through SDK configuration
- Cryptographic operations are not implemented inside the extension itself

This creates a strong but undocumented trust assumption:
> The SDK is responsible for enforcing environment restrictions and custody integrity.

Testing this assumption revealed that it does **not** hold.

---

## 🛑 Main Issue — SDK exposes internal wallet components and cryptographic primitives

The `@verified-network/verified-custody` SDK publicly exposes **internal wallet UI flows**
and **low‑level cryptographic helpers** that are assumed to be extension‑only,
but are in fact accessible in any Node.js or web environment.

This represents a **trust‑boundary violation** between the wallet extension
and SDK consumers.

Because the SDK does not enforce execution context, sensitive wallet logic can be
mounted or invoked **outside the intended custody lifecycle**.

---

## 🔍 Proof — Publicly Exposed Sensitive APIs

Inspection of the SDK exports and runtime behavior confirms that the following
security‑critical internals are publicly available:

### 🧩 Internal Wallet UI Flows
- `CreatePinPage`
- `EnterPinPage`
- `OTPPage`
- `FTUPage`

### 🏦 Custody / Vault State
- `VaultContextProvider`

### 🔐 Cryptographic Helpers
- `encryptString`, `decryptString`
- `encryptWithPasskey`, `decryptWithPasskey`
- `hashTheString`, `hashTheBuffer`
- `publicKeyCredentialRequestOptions`

These APIs execute without enforced custody authorization
when used outside the extension environment.

---

## 💥 Security Impact

Because these components are exposed:

- Wallet authentication flows can be rendered outside the extension
- Platform trust can be spoofed by SDK consumers
- Cryptographic helpers are reachable without custody initialization
- Unauthorized invocation leads to crashes, creating denial‑of‑service vectors
- Wallet security guarantees become environment‑dependent instead of enforced

Even if the extension UI enforces correct user behavior,
the SDK exposure allows security‑critical logic to be accessed
**outside the extension**, creating a supply‑chain level risk.

---

## 📊 Severity Assessment

**Severity:** 🚨 High  
**Estimated CVSS:** 7.8 – 8.4

**Impact Includes:**
- Major custody‑flow bypass potential
- Cryptographic misuse and denial‑of‑service vectors
- Broken trust boundary between extension and SDK
- Systemic risk affecting all SDK consumers

> While direct private key extraction was not demonstrated,
> the exposed attack surface significantly lowers the barrier
> for future exploitation.

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