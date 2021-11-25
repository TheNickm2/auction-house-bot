import { CommandsList } from "./commands";
import { Client, CommandInteraction } from "discord.js";
import { owoify } from "owoifyx";
const Minesweeper = require("discord.js-minesweeper");
import axios, { AxiosInstance } from "axios";

export class CommandHandler {
    public static async handleCommand(interaction: CommandInteraction) {
        switch (interaction.commandName) {
            case "test": {
                await interaction.reply("Your test was a success ✅");
                break;
            }
            case "owo": {
                const message = interaction.options.getString("message", true);
                await interaction.reply(owoify(message));
                break;
            }
            case "minesweeper": {
                const sweeper = new Minesweeper();
                await interaction.reply(sweeper.start());
                break;
            }
            case "dadjoke": {
                const dadJoke = await this.getDadJoke();
                if (dadJoke) await interaction.reply(dadJoke);
                else
                    await interaction.reply(
                        `An error occurred while retrieving a Dad Joke from the Dad-A-Base.`
                    );
                break;
            }
        }
    }
    private static async getDadJoke() {
        try {
            const response = await axios({
                method: 'GET',
                url: 'https://icanhazdadjoke.com/',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'A Discord Bot'
                }
            });
            if (response && response.status === 200) {
                if (response.data.joke) return response.data.joke;
            }
            return null;
        } catch (err: any) {
            console.error(err);
            return null;
        }
    }
}

export default CommandHandler;
