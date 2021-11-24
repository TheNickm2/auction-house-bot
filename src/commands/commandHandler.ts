import { CommandsList } from './commands';
import { Client, CommandInteraction } from 'discord.js';
import { owoify } from 'owoifyx';
const Minesweeper = require('discord.js-minesweeper');

export class CommandHandler {
    public static async handleCommand(interaction: CommandInteraction) {
        switch (interaction.commandName) {
            case 'test': {
                interaction.reply("Your test was a success ✅");
                break;
            }
            case 'owo': {
                const message = interaction.options.getString('message', true);
                interaction.reply(owoify(message));
                break;
            }
            case 'minesweeper': {
                // do sweepy things here
                break;
            }
            case 'dadjoke': {
                //do dad joke things here
                break;
            }
        }
    }
    private static async getDadJoke() {
        
    }
}

export default CommandHandler;