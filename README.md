# 🛑 Main Issue — SDK exposes internal components and cryptographic primitives

The `@verified-network/verified-custody` package publicly exposes **internal UI pages** and **low-level cryptographic helpers** that should never be part of a custody SDK’s public API. This creates a **critical security risk**, as both the wallet’s user interface flows and cryptographic operations can be misused by any consuming app.

### 🔍 Proof (Observed)
From running the PoC and inspecting the SDK, the following are publicly exported:

- **Internal UI pages / flows**:  
  `CreatePinPage`, `EnterPinPage`, `OTPPage`, `FTUPage`
- **Vault context**: `VaultContextProvider`
- **Cryptographic helpers**:  
  `encryptString`, `decryptString`, `encryptWithPasskey`, `decryptWithPasskey`, `hashTheString`, `hashTheBuffer`, `publicKeyCredentialRequestOptions`

These exports allow any app using the SDK to interact with internal wallet flows and perform cryptographic operations outside the intended custody lifecycle.

### ⚠️ Why this is a serious issue
- **Breaks trust boundaries** between SDK consumers and wallet internals  
- **Enables unintended mounting or reuse of PIN, OTP, and vault flows**, potentially bypassing security assumptions  
- **Cryptographic functions are callable without custody flow enforcement**, increasing risk of key misuse or leakage  
- **Expands the attack surface**, putting sensitive wallet data, key handling, and vault state at risk  

**Severity:** High — This is a **critical security design flaw** affecting both custody flow and key management.  
**Impact:** Exploiting this could allow an attacker to misuse encryption, intercept or manipulate sensitive flows, or compromise the integrity of key management within the wallet.

---

## 📂 Notes

- PoC experiments are included in `poc-exposed-api.js`.  
- `node_modules` is ignored to keep the submission lightweight.  
- This review demonstrates **real, actionable vulnerabilities** that must be fixed before SDK usage in production environments.
