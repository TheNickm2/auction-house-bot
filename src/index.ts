import { Client, Intents, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as DotEnv from "dotenv";
import * as fs from "fs";

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

// Load commands from files in commands folder
const commands = new Collection<string, any>();
const commandFiles = fs
    .readdirSync("src/commands")
    .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command!.data!.name!, command);
}

// Create REST instance to hit the Discord API
const rest = new REST({ version: "9" }).setToken(botToken);

// Register slash commands with Discord API
(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(applicationId, guildId),
            {
                body: commands.map((command) => command.data.toJSON()),
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
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "An error occurred while executing this command.",
            ephemeral: true,
        });
    }
});

// Connect to Discord
client.login(botToken);
