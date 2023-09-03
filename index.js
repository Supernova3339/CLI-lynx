const fs = require('fs');
const { program } = require('commander');
const packageJson = require('./package.json');
const axios = require("axios");

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
    .command('about')
    .description('About Your Lynx Instance')
    .action(async () => {
        const apiUrl = config.apiUrl; // Assuming you have already configured the API URL
        const secret = config.apiKey; // Assuming you have the API key in config.apiKey

        const headers = {
            'secret': secret, // Set the header name for authorization
            'Authorization': config.apiKey, // Set the API Key from the configuration file
        };

        try {
            const response = await axios.get(`${apiUrl}/about`, { headers });
            if (response.status === 200) {
                const result = response.data.result;
                console.log('About Your Lynx Instance:');
                console.log(`Domain: ${result.domain}`);
                console.log(`Demo: ${result.demo}`);
                console.log(`Version: ${result.version}`);
                console.log(`Accounts: ${result.accounts}`);

                if (result.umami) {
                    console.log('Umami:');
                    console.log(`  Site: ${result.umami.site}`);
                    console.log(`  URL: ${result.umami.url}`);
                }
            } else {
                console.error('Failed to fetch about information:', response.status);
            }
        } catch (error) {
            console.error('An error occurred:', error.message);
        }
    });

program
    .configureOutput({
        // Custom text for listing commands
        getCommands: (commands) => `Available commands: ${commands.map(cmd => cmd.name()).join(', ')}`,
    });

program.parse(process.argv);