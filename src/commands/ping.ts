import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';

export class CommandPing implements Command {
  public readonly data = new SlashCommandBuilder()
    .setName('ping')
    .setDefaultPermission(false)
    .setDescription('Goes pong!');
  public async execute(interaction: CommandInteraction) {
    try {
      await interaction.reply('Pong!');
    } catch (err: any) {
      console.error(err);
    }
  }
  constructor(emitter: EventEmitter) {}
}
