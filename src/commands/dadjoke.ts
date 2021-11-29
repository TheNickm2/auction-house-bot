import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import axios, { AxiosInstance } from 'axios';
import { Command } from './command';
import { EventEmitter } from 'events';

export class CommandDadJoke implements Command {
    public readonly data = new SlashCommandBuilder()
        .setName('dadjoke')
        .setDescription('Get a random joke from the dad-a-base');
    public async execute(interaction: CommandInteraction) {
        const dadJoke = await this.getDadJoke();
        if (dadJoke) {
            await interaction.reply(dadJoke);
        } else {
            await interaction.reply({
                content:
                    'Failed to obtain a dad joke from the dad-a-base. Please try again later.',
                ephemeral: true,
            });
        }
        return null;
    }
    constructor(emitter: EventEmitter) {}
    async getDadJoke() {
        try {
            const response = await axios({
                method: 'GET',
                url: 'https://icanhazdadjoke.com/',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'A Discord Bot',
                },
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
