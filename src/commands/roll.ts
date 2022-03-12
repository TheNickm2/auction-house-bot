import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';

export class CommandRoll implements Command {
  public readonly data = new SlashCommandBuilder()
    .setName('roll')
    .setDefaultPermission(false)
    .setDescription(
      'Roll a die with the specified number of sides (Default 6)'
    );
  public async execute(interaction: CommandInteraction) {
    try {
      await interaction.reply('Pong!');
    } catch (err: any) {
      console.error(err);
    }
  }
  constructor(emitter: EventEmitter) {}
}
