import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from './command';

export class CommandPing implements Command {
    public readonly data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Goes pong!');
    public async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    }
}
