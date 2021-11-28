import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as DotEnv from "dotenv";
import { CommandsList } from "./commands/commands";
import { CommandHandler } from "./commands/commandHandler";

// Initialize DotEnv config
DotEnv.config();

// Load the important bits from the environment variables
const botToken = process.env.BOT_TOKEN;
const guildId = process.env.PRIMARY_GUILD_ID;
const applicationId = process.env.APP_ID;

// Exit if missing reuired config
if (!botToken || !guildId || !applicationId) {
    throw new Error(
        `Critical environment variables missing. Please ensure the following environment variables exist in your environment: BOT_TOKEN, SERVER_ID, APP_ID`
    );
}

// Map commands as JSON
const commands = CommandsList.map((command) => command.toJSON());

// Create REST instance to hit the Discord API
const rest = new REST({ version: "9" }).setToken(botToken);

// Register slash commands with Discord API
(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(applicationId, guildId),
            {
                body: commands,
            }
        );

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();

// Create the Discord Client instance
// ! IMPORTANT: All required intents must be specified or retrieving certain data will be impossible
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
});

// Notify when bot is connected
client.on("ready", () => {
    console.log(
        `Logged in as ${
            client.user && client.user.tag
                ? client.user.tag
                : "an unidentifiable bot user"
        }!`
    );
});

// Process command interactions with the CommandHandler
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    CommandHandler.handleCommand(interaction);
});

// Connect to Discord
client.login(botToken);
