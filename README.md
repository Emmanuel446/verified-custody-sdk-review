## 🎯 Target Asset & Scope

While reviewing the **Verified Wallet Chrome Extension** and analyzing its bundled code and behavior
for potential vulnerabilities, it became clear that the extension relies heavily
on the `@verified-network/verified-custody` SDK for core custody flows, vault state management,
and cryptographic operations.

Because the SDK defines security-critical wallet behavior, any **publicly exposed SDK API**
directly expands the wallet’s effective attack surface.

---

## 🛑 Main Issue — SDK exposes internal components and cryptographic primitives

The `@verified-network/verified-custody` package publicly exposes **internal wallet UI flows**
and **low-level cryptographic helpers** that should never be part of a custody SDK’s public API.

This allows any consuming application to access sensitive wallet logic **outside the intended
custody lifecycle**, creating a serious trust-boundary violation.

### 🔍 Proof (Observed)

From inspecting the SDK exports and running the PoC, the following are publicly available:

- **Internal UI flows**:  
  `CreatePinPage`, `EnterPinPage`, `OTPPage`, `FTUPage`
- **Vault context**:  
  `VaultContextProvider`
- **Cryptographic helpers**:  
  `encryptString`, `decryptString`,  
  `encryptWithPasskey`, `decryptWithPasskey`,  
  `hashTheString`, `hashTheBuffer`,  
  `publicKeyCredentialRequestOptions`

---

## ⚠️ Security Impact

Because these APIs are exposed:

- Trust boundaries between the SDK consumer and wallet internals are broken  
- PIN, OTP, and onboarding flows can be mounted or reused outside the extension  
- Cryptographic operations can be invoked without custody flow enforcement  
- Vault state and key-handling assumptions are weakened  

Even if the extension UI enforces correct user behavior, the SDK exposure allows
security-critical wallet logic to be accessed **outside the extension environment**,
creating a supply-chain level risk.

**Severity:** 🚨 High (CVSS ~8.x)  
**Impact:** Major custody-flow bypass potential, cryptographic misuse, and weakened
self-custody guarantees.

---

## ▶️ Reproduction Steps

From a clean environment:

```bash
# Clone the repository
git clone https://github.com/Emmanuel446/verified-custody-sdk-review.git
cd POC

# Install dependencies
npm install

# Run the Proof of Concept in Your Code Terminal
node poc-exposed-api.js
