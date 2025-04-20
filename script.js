const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Function to store in localStorage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Function to retrieve from localStorage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Function to generate random 3-digit number
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Function to clear localStorage
function clear() {
  localStorage.clear();
}

// Function to generate SHA256 hash
async function sha256(message) {
  // Encode the message as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  
  // Hash the message using the SHA-256 algorithm
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert the ArrayBuffer to an array of bytes
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Convert the bytes to a hex string
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Function to get SHA256 hash from localStorage or generate a new one
async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) {
    return cached;
  }

  const randomNumber = getRandomArbitrary(MIN, MAX);
  const hash = await sha256(randomNumber);
  store('sha256', hash);
  return hash;
}

// Function to initialize the page with the hash
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;

  // Call the function to find the matching PIN (if desired)
  findMatchingPin();
}

// Function to test if the entered PIN matches the SHA256 hash
async function test() {
  const pin = pinInput.value;

  // Check if the entered PIN is exactly 3 digits
  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Please enter exactly 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  // Hash the entered PIN and compare it with the stored SHA256 hash
  const hashedPin = await sha256(pin);

  // Get the SHA256 hash from the page
  const storedHash = sha256HashView.innerHTML.trim();  // Remove any extra spaces
  
  // Debugging: Log the values for comparison
  console.log('Entered PIN:', pin);
  console.log('Hashed PIN:', hashedPin);
  console.log('Stored SHA256 Hash:', storedHash);

  // Compare the hashes and display the result
  if (hashedPin === storedHash) {
    resultView.innerHTML = '🎉 Success! The PIN matches the hash!';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ Failed! Try again.';
  }

  resultView.classList.remove('hidden');
}

// Ensure the PIN input only accepts numbers and is 3 digits long
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);  // Only allow 3 digits
});

// Attach the test function to the 'Check' button
document.getElementById('check').addEventListener('click', test);

// Initialize the page by calculating and displaying the hash
main();

// Function to find the matching 3-digit PIN for the SHA256 hash
async function findMatchingPin() {
  // Get the stored SHA256 hash from the page
  const targetHash = sha256HashView.innerHTML.trim();
  
  // Loop through numbers from 100 to 999
  for (let i = 100; i <= 999; i++) {
    // Calculate the SHA256 hash for each number
    const hashedPin = await sha256(i.toString());
    
    // Check if this hash matches the given hash
    if (hashedPin === targetHash) {
      console.log(`The 3-digit number that matches the hash is: ${i}`);
      break; // Stop once we find the match
    }
  }
}
