import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';

export class CommandRoll implements Command {
  public readonly data = new SlashCommandBuilder()
    .setName('roll')
    .setDefaultPermission(true)
    .setDescription('Roll a die with the specified number of sides (Default 6)')
    .addIntegerOption((option) =>
      option.setName('sides').setDescription('Number of sides on the die')
    )
    .addBooleanOption((option) =>
      option
        .setName('share')
        .setDescription(
          'Enable this to print the output to chat for all to see. Otherwise, results will be ephemeral.'
        )
    );
  public async execute(interaction: CommandInteraction) {
    try {
      const randomInteger = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1) + min);

      const sides = interaction.options.get('sides');
      const result = randomInteger(1, (sides?.value as number) ?? 6);

      const ephemeral = !Boolean(
        interaction.options.get('share')?.value ?? false
      );

      await interaction.reply({ content: `${result}`, ephemeral });
    } catch (err: any) {
      console.error(err);
    }
  }
  constructor(emitter: EventEmitter) {}
}
