// The following test enumerates the public API surface of the @verified-network/verified-custody package to identify which internal modules, components, and helper functions are exposed to third-party consumers.

// In a custody SDK, only hardened, high-level interfaces should be publicly accessible. Exposing internal UI flows or cryptographic primitives increases attack surface and enables misuse outside intended security boundaries.

// Import the Verified Custody SDK as a third-party consumer would
const custody = require("@verified-network/verified-custody");


// Enumerate all publicly exported SDK members to inspect the exposed API surface.
// This reveals the full API surface exposed to external applications.
console.log(Object.keys(custody));
// Expected output (example):
// [
//   'AddCoSignersPage',
//   'ContactPage',
//   'CreatePinPage',
//   'EnterPinPage',
//   'FTUPage',
//   'OTPPage',
//   'VaultContextProvider',
//   'VerifiedCustody',
//   'decryptString',
//   'decryptWithPasskey',
//   'encryptString',
//   'encryptWithPasskey',
//   'getPlatformComponents',
//   'hashTheBuffer',
//   'hashTheString',
//   'initPlatform',
//   'loadAllGoogleFonts',
//   'loadAllGoogleFontsRN',
//   'publicKeyCredentialRequestOptions'
// ]
