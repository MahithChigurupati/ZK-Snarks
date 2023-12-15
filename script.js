const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");
const path = require("path");
const fs = require("fs");

async function poseidonHash(inputs) {
  const poseidon = await circomlibjs.buildPoseidon();
  const poseidonHash = poseidon.F.toString(poseidon(inputs));
  return poseidonHash;
}

const createAgeProof = async (
  signer,
  doBTimestamp,
  currentTimestamp,
  ageThreshold
) => {
  const hash = await poseidonHash([signer, doBTimestamp]);

  const wasmFilePath = path.join(__dirname, "AgeProof_js", "AgeProof.wasm");
  const zkeyFilePath = path.join(__dirname, "AgeProof_0001.zkey");

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      doBTimestamp: doBTimestamp,
      address: signer,
      currentTimestamp: currentTimestamp,
      ageThreshold: ageThreshold,
      hash: hash,
    },
    wasmFilePath,
    zkeyFilePath
  );

  return { proof, publicSignals };
};

const verifyAgeProof = async (proof, publicSignals) => {
  const vKeyFilePath = path.join(__dirname, "verification_key.json");
  const vKey = JSON.parse(fs.readFileSync(vKeyFilePath));
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
};

module.exports = {
  createAgeProof,
  verifyAgeProof,
};
