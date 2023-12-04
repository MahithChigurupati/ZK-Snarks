const { execSync } = require("child_process");
const fs = require("fs");

// Step 1: Run circom command
execSync("circom Multiplier2.circom --r1cs --wasm --sym --c", {
  stdio: "inherit",
  cwd: ".",
});

// Step 2: Create input.json
const inputData = { a: "2", b: "11" };
fs.writeFileSync("./multiplier2_js/input.json", JSON.stringify(inputData));

// Step 3: Run generate_witness.js
execSync("node generate_witness.js multiplier2.wasm input.json witness.wtns", {
  stdio: "inherit",
  cwd: "./multiplier2_js",
});

// Step 4: Run snarkjs commands
execSync("snarkjs powersoftau new bn128 12 pot12_0000.ptau -v", {
  stdio: "inherit",
  cwd: ".",
});
execSync(
  'echo "your_entropy_value" | snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v',
  { stdio: "inherit", cwd: "." }
);
execSync(
  "snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v",
  { stdio: "inherit", cwd: "." }
);
execSync(
  "snarkjs groth16 setup multiplier2.r1cs pot12_final.ptau multiplier2_0000.zkey",
  { stdio: "inherit", cwd: "." }
);
execSync(
  'echo "your_entropy_value" | snarkjs zkey contribute multiplier2_0000.zkey multiplier2_0001.zkey --name="1st Contributor Name" -v',
  { stdio: "inherit", cwd: "." }
);
execSync(
  "snarkjs zkey export verificationkey multiplier2_0001.zkey verification_key.json",
  { stdio: "inherit", cwd: "." }
);
execSync(
  "snarkjs groth16 prove multiplier2_0001.zkey ./Multiplier2_js/witness.wtns proof.json public.json",
  { stdio: "inherit", cwd: "." }
);
execSync(
  "snarkjs groth16 verify verification_key.json public.json proof.json",
  { stdio: "inherit", cwd: "." }
);
execSync(
  "snarkjs zkey export solidityverifier multiplier2_0001.zkey verifier.sol",
  { stdio: "inherit", cwd: "." }
);
execSync("snarkjs generatecall", { stdio: "inherit", cwd: "." });
