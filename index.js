const fs = require('fs');
const { program } = require('commander');
const packageJson = require('./package.json');

// Check if config.json exists, and if not, create it with blank values
if (!fs.existsSync('config.json')) {
    const defaultConfig = {
        apiUrl: '',
        apiKey: ''
    };
    fs.writeFileSync('config.json', JSON.stringify(defaultConfig, null, 2));
}

// Load configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

program
    .version(packageJson.version) // Sets the version from package.json

program
    .command('config')
    .description('Set or update API configuration')
    .option('-u, --url <url>', 'API URL')
    .option('-k, --key <key>', 'API Key')
    .action(async (options) => {
        const newConfig = {
            apiUrl: options.url || config.apiUrl, // Use current apiUrl if not provided
            apiKey: options.key || config.apiKey // Use current apiKey if not provided
        };

        if (newConfig.apiUrl === config.apiUrl && newConfig.apiKey === config.apiKey) {
            console.log('Configuration is already up to date:');
            console.log('API URL:', config.apiUrl);
            console.log('API Key:', config.apiKey);
            return;
        }

        fs.writeFileSync('config.json', JSON.stringify(newConfig, null, 2));
        console.log('Configuration updated successfully.');
    });

program
    .command('reset')
    .description('Clears the CLI configuration')
    .action(() => {
        const defaultConfig = {
            apiUrl: '',
            apiKey: ''
        };

        fs.writeFileSync('config.json', JSON.stringify(defaultConfig, null, 2));
        console.log('Configuration reset.');
    });

program
    .configureOutput({
        // Custom text for listing commands
        getCommands: (commands) => `Available commands: ${commands.map(cmd => cmd.name()).join(', ')}`,
    });

program.parse(process.argv);