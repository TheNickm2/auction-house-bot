import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';

const MIN_VALUE = 1;

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
          'Enable this to print the output to chat for all to see. Otherwise, results will for your eyes only.'
        )
    )
    .addNumberOption((option) =>
      option
        .setName('qty')
        .setDescription('How many rolls should we do? (Max 10)')
    );
  public async execute(interaction: CommandInteraction) {
    try {
      // defer reply using user's ephemeral choice
      const ephemeral = !Boolean(
        interaction.options.get('share')?.value ?? false
      );
      await interaction.deferReply({
        ephemeral,
      });

      const qty = Number(interaction.options.get('qty')?.value ?? 1);
      if (qty > 10) {
        await interaction.editReply({
          content: `If you'd have paid attention to the command, you'd have known that ${qty} is more than the maximum quantity of 10 😉`,
        });
        return;
      }

      const sides = (interaction.options.get('sides')?.value ?? 6) as number;

      const randomInteger = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1) + min);

      let results = '';
      for (let i = 0; i < qty; i++) {
        const result = randomInteger(MIN_VALUE, sides);
        const resultString = `${'`'}Roll #${i + 1}:${'`'} **${result}**\n`;
        results += resultString;
      }
      await interaction.editReply({
        content: `__Rolled ${qty} x d**${sides}**__... <a:dice:954277834845741077>\n\n${results}`,
      });
    } catch (err: any) {
      console.error(err);
    }
  }
  constructor(emitter: EventEmitter) {}
}
