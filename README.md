# 🛑 Main Issue — SDK exposes internal components and cryptographic primitives

The `@verified-network/verified-custody` package publicly exposes **internal UI pages** and **low-level cryptographic helpers** that should never be part of a custody SDK’s public API. This creates a **critical security risk**, as both the wallet’s user interface flows and cryptographic operations can be misused by any consuming app.

### 🔍 Proof (Observed)
From running the PoC and inspecting the SDK, the following are publicly exported:

- **Internal UI pages / flows**:  
  `CreatePinPage`, `EnterPinPage`, `OTPPage`, `FTUPage`
- **Vault context**: `VaultContextProvider`
- **Cryptographic helpers**:  
  `encryptString`, `decryptString`, `encryptWithPasskey`, `decryptWithPasskey`, `hashTheString`, `hashTheBuffer`, `publicKeyCredentialRequestOptions`

---

## 🔗 Relationship to the Verified Wallet Extension (Target Asset)

The Verified Wallet Chrome Extension is the primary target of this security review.
The extension relies on the `@verified-network/verified-custody` SDK as part of its
custody, vault, and cryptographic logic.

During analysis of the extension bundle and documentation, it was observed that:

- The extension imports and depends on the Verified Custody SDK for core wallet logic
- The SDK defines custody flows, vault state handling, and cryptographic helpers used by the wallet
- Any publicly exposed SDK API becomes part of the wallet’s effective attack surface

### Why this matters

Because the SDK **publicly exports internal wallet components and cryptographic primitives**, any application or extension using the same SDK can:

- Reuse or mount internal PIN / OTP flows outside the extension
- Invoke cryptographic helpers without the extension’s security assumptions
- Interact with vault context and custody logic beyond intended boundaries

This means the wallet’s security does not solely depend on the extension UI,
but also on the correctness of the SDK’s public API surface.

### Extension impact

Even if the extension UI enforces correct user flows, the SDK exposure allows
security-critical wallet logic to be accessed **outside the extension environment**,
creating a supply-chain and trust-boundary vulnerability affecting the Verified Wallet.


These exports allow any app using the SDK to interact with internal wallet flows and perform cryptographic operations outside the intended custody lifecycle.

### ⚠️ Why this is a serious issue
- **Breaks trust boundaries** between SDK consumers and wallet internals  
- **Enables unintended mounting or reuse of PIN, OTP, and vault flows**, potentially bypassing security assumptions  
- **Cryptographic functions are callable without custody flow enforcement**, increasing risk of key misuse or leakage  
- **Expands the attack surface**, putting sensitive wallet data, key handling, and vault state at risk  

**Severity:** High — This is a **critical security design flaw** affecting both custody flow and key management.  
**Impact:** Exploiting this could allow an attacker to misuse encryption, intercept or manipulate sensitive flows, or compromise the integrity of key management within the wallet.

---

## ▶️ Exact Commands to Reproduce

From a clean environment:

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# 2. Install dependencies
npm install

# 3. Run the Proof of Concept
node poc-exposed-api.js
```
---

## 📂 Notes

- PoC experiments are included in `poc-exposed-api.js`.  
- `node_modules` is ignored to keep the submission lightweight.  
- This review demonstrates **real, actionable vulnerabilities** that must be fixed before SDK usage in production environments.
