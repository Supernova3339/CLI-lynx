const execSync = require('child_process').execSync;

// Replace 'index.js' with the actual entry file of your CLI
execSync('pkg index.js --output dist/cli');