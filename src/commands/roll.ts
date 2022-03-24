import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ButtonInteraction,
  Collection,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';

const MIN_VALUE = 1;
const randomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const msgOptions: Collection<string, CommandInteraction> = new Collection();

export class CommandRoll implements Command {
  public readonly data = new SlashCommandBuilder()
    .setName('roll')
    .setDefaultPermission(true)
    .setDescription('Roll a die with the specified number of sides (Default 6)')
    .addIntegerOption((option) =>
      option.setName('sides').setDescription('Number of sides on the die')
    )
    .addNumberOption((option) =>
      option
        .setName('qty')
        .setDescription('How many rolls should we do? (Max 10)')
    );
  public async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply();

      const qty = Number(interaction.options.get('qty')?.value ?? 1);
      if (qty > 10) {
        await interaction.editReply({
          content: `If you'd have paid attention to the command, you'd have known that ${qty} is more than the maximum quantity of 10 😉`,
        });
        return;
      }

      const componentRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('reroll')
          .setEmoji('🎲')
          .setLabel('Reroll')
          .setStyle('SECONDARY')
      );

      const interactionReply = await interaction.fetchReply();
      if (!interactionReply) {
        throw 'Failed to properly fetch interaction reply information.';
      }

      const sides = (interaction.options.get('sides', false)?.value ??
        6) as number;

      msgOptions.set(interactionReply.id, interaction);

      const resultString = this.getResponseString(qty, sides);

      if (!resultString) {
        await interaction.editReply({
          content: `An error occured while performing this command.`,
        });
        return;
      }

      await interaction.editReply({
        content: `__Rolled ${qty} x d**${sides}**__... <a:dice:954277834845741077>\n\n${resultString}`,
        components: [componentRow],
      });
    } catch (err: any) {
      console.error(err);
    }
  }
  constructor(emitter: EventEmitter) {
    emitter.on('reroll', async (interaction: ButtonInteraction) => {
      const previousInteraction = msgOptions.get(interaction.message?.id);
      if (!previousInteraction) {
        console.error(
          `Previous interaction failed to load from cache.\n${interaction.toJSON()}`
        );
        return;
      }
      try {
        if (interaction.user.id !== previousInteraction.user.id) {
          await interaction.reply({
            ephemeral: true,
            content: `Only ${previousInteraction.user.toString()} may reroll that request. Start your own dice roll request with \`/roll\`!`,
          });
          return;
        }

        const prevMsg = await interaction.channel?.messages.fetch(
          interaction.message.id
        );

        if (prevMsg && prevMsg.editable) {
          await prevMsg.edit({
            content: `**REROLLED**\n~~${prevMsg.content}~~`,
            components: [],
          });
        }

        await interaction.deferReply();

        const qty = Number(previousInteraction.options.get('qty')?.value ?? 1);
        if (qty > 10) {
          await interaction.editReply({
            content: `If you'd have paid attention to the command, you'd have known that ${qty} is more than the maximum quantity of 10 😉`,
          });
          return;
        }

        const componentRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId('reroll')
            .setEmoji('🎲')
            .setLabel('Reroll')
            .setStyle('SECONDARY')
        );

        const sides = (previousInteraction.options.get('sides', false)?.value ??
          6) as number;

        const resultString = this.getResponseString(qty, sides);

        if (!resultString) {
          await interaction.editReply({
            content: `An error occured while performing this command.`,
          });
          return;
        }

        const interactionReply = await interaction.fetchReply();
        if (!interactionReply) {
          throw 'Failed to properly fetch interaction reply information.';
        }

        msgOptions.delete(interaction.message.id);
        msgOptions.set(interactionReply.id, previousInteraction);

        await interaction.editReply({
          content: `__Rolled ${qty} x d**${sides}**__... <a:dice:954277834845741077>\n\n${resultString}`,
          components: [componentRow],
        });
      } catch (err: any) {
        console.error(err);
      }
    });
  }

  private getResponseString(qty: number, sides: number) {
    let results = '';
    for (let i = 0; i < qty; i++) {
      const result = randomInteger(MIN_VALUE, sides);
      const resultString = `${'`'}Roll #${i + 1}:${'`'} **${result}**\n`;
      results += resultString;
    }
    return results;
  }
}
