const bcrypt = require('bcrypt');

// The string you want to hash
const plainText = process.argv[2]; // Accept input from terminal arguments

const hashString = async (text) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    const hashed = await bcrypt.hash(text, salt); // Hash the string
    console.log('Hashed String:', hashed);
  } catch (error) {
    console.error('Error hashing the string:', error);
  }
};

if (!plainText) {
  console.error('Please provide a string to hash as an argument.');
  process.exit(1);
}

hashString(plainText);
