import { Client, Intents } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as DotEnv from "dotenv";
import { CommandsList } from './commands/commands';
import { CommandHandler } from './commands/commandHandler';

DotEnv.config();

const botToken = process.env.BOT_TOKEN;
const guildId = process.env.PRIMARY_GUILD_ID;
const applicationId = process.env.APP_ID;

if (!botToken || !guildId || !applicationId) {
    throw new Error(`Critical environment variables missing. Please ensure the following environment variables exist in your environment: BOT_TOKEN, SERVER_ID, APP_ID`);
}

const commands = CommandsList.map(command => command.toJSON());

const rest = new REST({ version: "9" }).setToken(botToken);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
            body: commands,
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });

client.on("ready", () => {
    console.log(
        `Logged in as ${
            client.user && client.user.tag
                ? client.user.tag
                : "an unidentifiable bot user"
        }!`
    );
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    CommandHandler.handleCommand(interaction);
});

client.login(botToken);
