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

/*
|----------------------------------------------------------------------------------
| Account Commands
|----------------------------------------------------------------------------------
 */

// Define the "account" command
program
    .command('account <action>')
    .description('Perform account actions')
    .action(async (action) => {
        const apiUrl = config.apiUrl; // API URL
        const secret = config.apiKey; // API Key

        const headers = {
            'secret': secret, // Set the header name for authorization
            'Authorization': config.apiKey, // Set the API Key from the configuration file
        };

        switch (action) {
            case 'get':
                try {
                    const response = await axios.get(`${apiUrl}/auth/me`, { headers });
                    if (response.status === 200) {
                        const accountInfo = response.data.result;
                        console.log('Account Information:');
                        console.log(`ID: ${accountInfo.id}`);
                        console.log(`Username: ${accountInfo.username}`);
                        console.log(`Email: ${accountInfo.email}`);
                        console.log(`Role: ${accountInfo.role}`);
                        console.log(`2FA Enabled: ${accountInfo.totp}`);
                    } else {
                        console.error('Failed to fetch account information:', response.status);
                    }
                } catch (error) {
                    console.error('An error occurred:', error.message);
                }
                break;

            default:
                console.error('Invalid action. Use "get"');
        }
    });

/*
|----------------------------------------------------------------------------------
| Link Commands
|----------------------------------------------------------------------------------
 */

program
    .command('link <action>')
    .description('Manage links')
    .action((action) => {
        if (action === 'create') {
            console.log('Creating a new link...');
        } else if (action === 'update') {
            console.log('Updating a link...');
        } else if (action === 'delete') {
            console.log('Deleting a link...');
        } else {
            console.error('Invalid action. Use "create", "update", or "delete".');
        }
    });

// Create a link
program
    .command('create <url>')
    .description('Create a new link')
    .action(async (url) => {
        if (url) {
            const apiUrl = config.apiUrl; // Assuming you have already configured the API URL
            const secret = config.apiKey; // Assuming you have the API key in config.apiKey

            const headers = {
                'secret': secret, // Set the header name for authorization
                'Authorization': config.apiKey, // Set the API Key from the configuration file
            };

            const data = {
                secret: config.apiKey,
                url: url,
            };

            try {
                const response = await axios.post(`${apiUrl}/sharex`, data, { headers });
                if (response.status === 200) {
                    console.log('Link Successfully Created!');
                    console.log(`Destination: ${url}`);
                } else if (response.status === 401) {
                    console.error('Unauthorized:', response.status);
                } else if (response.status === 409) {
                    console.error('Conflict: A link with that slug/destination already exists');
                } else if (response.status === 422) {
                    console.error('Unprocessable Entity: Destination doesn\'t match URL regex');
                } else {
                    console.error('Failed to create the link:', response.status);
                }
            } catch (error) {
                console.error('An error occurred:', error.message);
            }
        } else {
            console.error('Invalid arguments. Please provide the slug, destination, and author.');
        }
    });

// Update a link
program
    .command('update <id> <slug> <destination>')
    .description('Update an existing link')
    .requiredOption('-a, --author <author>', 'Author ID')
    .action(async (id, slug, destination, options) => {
        if (id && slug && destination) {
            const apiUrl = config.apiUrl; // Assuming you have already configured the API URL
            const secret = config.apiKey; // Assuming you have the API key in config.apiKey

            const headers = {
                'secret': secret, // Set the header name for authorization
                'Authorization': config.apiKey, // Set the API Key from the configuration file
            };

            const data = {
                id,
                slug,
                destination,
                author: options.author,
            };

            try {
                const response = await axios.patch(`${apiUrl}/link`, data, { headers });
                if (response.status === 200) {
                    const linkInfo = response.data.result;
                    console.log('Link Successfully Updated:');
                    console.log(`ID: ${linkInfo.id}`);
                    console.log(`Slug: ${linkInfo.slug}`);
                    console.log(`Destination: ${linkInfo.destination}`);
                    console.log(`Author: ${linkInfo.author}`);
                    console.log(`Creation Date: ${linkInfo.creationDate}`);
                    console.log(`Modified Date: ${linkInfo.modifiedDate}`);
                    console.log(`Visits: ${linkInfo.visits}`);
                    console.log(`Account: ${linkInfo.account}`);
                } else if (response.status === 401) {
                    console.error('Unauthorized:', response.status);
                } else if (response.status === 403) {
                    console.error('Forbidden: You do not have permissions to edit this link');
                } else if (response.status === 404) {
                    console.error('Not Found: A link with that id does not exist');
                } else if (response.status === 409) {
                    console.error('Conflict: A link with that slug/destination already exists');
                } else if (response.status === 422) {
                    console.error('Unprocessable Entity: Invalid slug/destination format');
                } else {
                    console.error('Failed to update the link:', response.status);
                }
            } catch (error) {
                console.error('An error occurred:', error.message);
            }
        } else {
            console.error('Invalid arguments. Please provide the link ID, slug, destination, and author.');
        }
    });

// Delete a link
program
    .command('delete <ids...>')
    .description('Delete one or more links')
    .requiredOption('-a, --author <author>', 'Author ID')
    .action(async (ids, options) => {
        if (ids.length > 0) {
            const apiUrl = config.apiUrl; // Assuming you have already configured the API URL
            const secret = config.apiKey; // Assuming you have the API key in config.apiKey

            const headers = {
                'secret': secret, // Set the header name for authorization
                'Authorization': config.apiKey, // Set the API Key from the configuration file
            };

            const data = {
                ids,
                author: options.author,
            };

            try {
                const response = await axios.delete(`${apiUrl}/link`, { data, headers });
                if (response.status === 200) {
                    console.log('Link(s) Successfully Deleted:');
                    console.log(response.data.result);
                } else if (response.status === 401) {
                    console.error('Unauthorized:', response.status);
                } else if (response.status === 403) {
                    console.error('Forbidden: You do not have the permissions to delete some or all of the selected links. No links were deleted.');
                } else {
                    console.error('Failed to delete the link(s):', response.status);
                }
            } catch (error) {
                console.error('An error occurred:', error.message);
            }
        } else {
            console.error('Invalid arguments. Please provide at least one link ID to delete.');
        }
    });

/*
|----------------------------------------------------------------------------------
| a
|----------------------------------------------------------------------------------
 */

program
    .configureOutput({
        // Custom text for listing commands
        getCommands: (commands) => `Available commands: ${commands.map(cmd => cmd.name()).join(', ')}`,
    });

program.parse(process.argv);