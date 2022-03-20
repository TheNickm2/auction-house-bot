import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';

const AUCTION_CHANNEL_ID = process.env.AUCTION_CHANNEL_ID ?? '0';
const ANNOUNCEMENT_CHANNEL_ID = process.env.ANNOUNCEMENT_CHANNEL_ID ?? '0';

export class CommandAuction implements Command {
  public readonly data = new SlashCommandBuilder()
    .setName('auction')
    .setDefaultPermission(false)
    .setDescription('(For AHC Officers) | Auction related commands')
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName('setup')
        .setDescription(
          'Configure the auction (start/end times, bidding increments, etc.)'
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('end')
            .setDescription('Set the end date/time of the auction.')
            .addStringOption((option) =>
              option
                .setName('date-time')
                .setDescription(
                  'Date & time of ending auction. Ask Nick if you need help formatting it properly.'
                )
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('reset')
            .setDescription('Reset the entire auction for a new week.')
            .addStringOption((option) =>
              option
                .setName('confirm')
                .setDescription('Type the word "confirm" to continue.')
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName('lots')
        .setDescription('Configure auction lots')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('add')
            .setDescription(
              'Add a new auction lot to the current or upcoming auction.'
            )
            .addStringOption((option) =>
              option
                .setName('title')
                .setDescription('The title of the auction lot')
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('description')
                .setDescription(
                  'The description text for the lot. You can use \\n in place of new lines (line breaks).'
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('image-url')
                .setDescription('URL of the image to display in the embed')
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName('starting-bid')
                .setDescription('The minimum starting bid allowed for this lot')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('edit')
            .setDescription(
              'Edit an existing auction lot. Only enter the fields you need to change.'
            )
            .addStringOption((option) =>
              option
                .setName('msg-id')
                .setDescription(
                  'The message ID of the auction lot you need to edit. Ask Nick if you need help with this!'
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('title')
                .setDescription('The title of the auction lot')
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName('description')
                .setDescription(
                  'The description text for the lot. You can use \\n in place of new lines (line breaks).'
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName('image-url')
                .setDescription('URL of the image to display in the embed')
                .setRequired(false)
            )
            .addIntegerOption((option) =>
              option
                .setName('starting-bid')
                .setDescription('The minimum starting bid allowed for this lot')
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('remove')
            .setDescription(
              'Remove a lot from the current or upcoming auction.'
            )
            .addStringOption((option) =>
              option
                .setName('msg-id')
                .setDescription(
                  'The message ID of the auction lot you need to remove. Ask Nick if you need help with this!'
                )
                .setRequired(true)
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription(
          'Open the auction for bidding and post an announcement message'
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('rules')
        .setDescription('View the auction rules & learn how to bid!')
    );
  public async execute(interaction: CommandInteraction) {
    try {
      const subcommandGroup = interaction.options.getSubcommandGroup(false);
      const subcommand = interaction.options.getSubcommand();
      switch (subcommandGroup) {
        case 'setup': {
          switch (subcommand) {
            case 'end': {
              await this.setupEnd(interaction);
              break;
            }
            case 'reset': {
              await this.setupEnd(interaction);
              break;
            }
            default: {
              await this.auctionInvalidSubcommandHandler(interaction);
              break;
            }
          }
          break;
        }
        case 'lots': {
          switch (subcommand) {
            case 'add': {
              await this.lotsAdd(interaction);
              break;
            }
            case 'edit': {
              await this.lotsEdit(interaction);
              break;
            }
            case 'remove': {
              await this.lotsRemove(interaction);
              break;
            }
            default: {
              await this.auctionInvalidSubcommandHandler(interaction);
              break;
            }
          }
          break;
        }
        default: {
          switch (subcommand) {
            case 'start': {
              await this.setupStart(interaction);
              break;
            }
            case 'rules': {
              await this.auctionRules(interaction);
              break;
            }
            default: {
              await this.auctionInvalidSubcommandHandler(interaction);
            }
          }
          break;
        }
      }
    } catch (commandError: any) {
      try {
        if (interaction.replied) {
          await interaction.editReply({
            content:
              'An error occurred with the command. Try again later or contact an Officer for help!',
          });
        } else {
          await interaction.reply({
            content:
              'An error occurred with the command. Try again later or contact an Officer for help!',
            ephemeral: true,
          });
        }
      } catch (err: any) {
        console.error(err);
      }
      console.error(commandError);
    }
  }
  // constructor(emitter: EventEmitter) {}
  async auctionInvalidSubcommandHandler(interaction: CommandInteraction) {
    // shouldn't be possible for users to run without a subcommand as discord's UI disallows this
    // this generic error will display should a user find a way to attempt it
    await interaction.reply({
      content: `Hello, ${interaction.user.toString()}! Please ensure you're using the \`/auction\` command **with** a subcommand - i.e. \`/auction rules\` to display the rules.`,
      ephemeral: true,
    });
  }

  async auctionRules(interaction: CommandInteraction) {
    const embed = new MessageEmbed()
      .setTitle('Auction Rules & Info')
      .setDescription("here's some st uff about the auction");
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }

  async setupStart(interaction: CommandInteraction) {
    return;
  }

  async setupEnd(interaction: CommandInteraction) {
    return;
  }

  async setupReset(interaction: CommandInteraction) {
    return;
  }

  async lotsAdd(interaction: CommandInteraction) {
    return;
  }

  async lotsEdit(interaction: CommandInteraction) {
    return;
  }

  async lotsRemove(interaction: CommandInteraction) {
    return;
  }
}
