import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { Command } from './command';
import dayjs from 'dayjs';
import { Database } from '@/database';
import * as DotEnv from 'dotenv';
import { AuctionLot } from '@/interfaces';
import { isStringUrl } from '@/utils/isStringUrl';

// Initialize DotEnv config
DotEnv.config();

const AUCTION_CHANNEL_ID = process.env.AUCTION_CHANNEL_ID ?? '0';
const ANNOUNCEMENT_CHANNEL_ID = process.env.ANNOUNCEMENT_CHANNEL_ID ?? '0';

const NICKS_ID = '441377078634610688';

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
            .addIntegerOption((option) =>
              option
                .setName('unix-timestamp')
                .setDescription(
                  'Unix timestamp of the desired auction end. Ask Nick if you need help generating timestamps.'
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
              await this.setupReset(interaction);
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
        if (!interaction.replied) {
          await interaction.reply({
            content:
              'An error occurred with the command. Try again later or contact an Officer for help!',
            ephemeral: true,
          });
        } else {
          await interaction.editReply({
            content:
              'An error occurred with the command. Try again later or contact an Officer for help!',
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
    await interaction.deferReply({ ephemeral: true });

    if (await Database.isAuctionOpen()) {
      await interaction.editReply({
        content: `The auction is already flagged as open! Make sure you \`/auction setup reset\` after each week's auction ends!`,
      });
      return;
    }

    const auctionEnd = await Database.getAuctionEnd();
    if (!auctionEnd || auctionEnd < dayjs()) {
      await interaction.editReply({
        content: `The auction end date is either unset or set for a date in the past. Please ensure the auction end date is set properly before trying to start it.`,
      });
      return;
    }

    const result = await Database.setAuctionInfo({ isOpen: true });
    if (!result) {
      await interaction.editReply({
        content: `An error has occurred while communicating with the database. Please try again later or contact <@${NICKS_ID}> if the problem persists.`,
      });
      return;
    }
    const announcementChannel = await interaction.guild?.channels.fetch(
      ANNOUNCEMENT_CHANNEL_ID
    );
    if (announcementChannel) {
      (announcementChannel as TextChannel).send(
        `@everyone The Discord auction has started in <#${AUCTION_CHANNEL_ID}> - go check it out! Auction ends <t:${auctionEnd.unix()}:F>`
      );
    }

    const auctionLots = await Database.getAuctionLots();
    if (!auctionLots) {
      await interaction.editReply({
        content: `An error has occurred while communicating with the database. Please try again later or contact <@${NICKS_ID}> if the problem persists.`,
      });
      return;
    }
    const channel = (await interaction.guild?.channels.fetch(
      AUCTION_CHANNEL_ID
    )) as TextChannel | undefined;
    if (!channel) {
      await interaction.editReply({
        content: `An error has while starting the auction. Please try again later or contact <@${NICKS_ID}> if the problem persists.`,
      });
      return;
    }
    auctionLots.forEach(async (lot) => {
      const msgId = lot.messageId;
      const msg = await channel.messages.fetch(msgId);
      const componentRows = msg?.components;
      componentRows.forEach((row) => {
        row.components.forEach((component) => {
          component.disabled = false;
        });
      });
    });

    return;
  }

  async setupEnd(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const datetime = dayjs.unix(
      Number(interaction.options.get('unix-timestamp')?.value ?? -1)
    );
    if (!datetime.isValid() || datetime <= dayjs()) {
      await interaction.editReply({
        content: `\`${String(
          interaction.options.get('unix-timestamp')?.value
        )}\` is a date in the past or an invalid timestamp. Please try again or contact <@${NICKS_ID}> for help.\n\nHint: You can generate unix timestamps at <https://hammertime.djdavid98.art> 😉`,
      });
      return;
    }

    const response = await Database.setAuctionInfo({
      end: datetime.unix().toString(),
    });
    if (!response) {
      await interaction.editReply({
        content: `An error has occurred while communicating with the database. Please try again later or contact <@${NICKS_ID}> if the problem persists.`,
      });
      return;
    }

    await interaction.editReply({
      content: `Set auction end date/time for <t:${datetime.unix()}>`,
    });
    return;
  }

  async setupReset(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    if (interaction.options.get('confirm', true).value !== 'confirm') {
      await interaction.editReply({
        content:
          'To perform this action, you need to type out `confirm` in the "confirm" field. This is a preventative measure to avoid accidental data deletion.',
      });
      return;
    }

    const auctionLots = await Database.getAuctionLots();
    if (!auctionLots) {
      await interaction.editReply({
        content: `An unknown database error occurred while deleting the existing auction lots. Please try again later or contact <@${NICKS_ID}> if the problem persists.`,
      });
      return;
    }

    auctionLots.forEach(async (lot) => {
      const msgId = lot.messageId;
      const message = await (
        (await interaction.guild?.channels.fetch(
          AUCTION_CHANNEL_ID
        )) as TextChannel
      )?.messages.fetch(msgId);
      if (!message || !message.deletable) {
        console.error(
          `Unable to delete message with ID ${msgId} - message object:\n${message?.toJSON()}`
        );
        return;
      }
    });

    const dropLotsResult = await Database.dropAuctionLots();
    if (!dropLotsResult || !dropLotsResult.acknowledged) {
      await interaction.editReply({
        content: `An unknown database error occurred while deleting the existing auction lots. Please try again later or contact <@${NICKS_ID}> if the problem persists.`,
      });
      return;
    }

    const setAuctionClosed = await Database.setAuctionInfo({ isOpen: false });
    if (!setAuctionClosed) {
      await interaction.editReply({
        content: `An unknown database error occurred while deleting the existing auction lots. Please try again later or contact <@${NICKS_ID}> if the problem persists.`,
      });
      return;
    }

    await interaction.editReply({
      content: `Reset finished. ${dropLotsResult.deletedCount} lots deleted from the database.`,
    });
    return;
  }

  async lotsAdd(interaction: CommandInteraction) {
    const title = String(interaction.options.get('title')?.value);
    const description = String(interaction.options.get('description')?.value);
    const imageUrl = String(interaction.options.get('image-url')?.value);
    const startingBid = Number(
      interaction.options.get('starting-bid')?.value ?? 0
    );
    if (
      !title ||
      !description ||
      !imageUrl ||
      !startingBid ||
      !isStringUrl(imageUrl)
    ) {
      await interaction.reply({
        content:
          "You must include the lot's title, description text, _valid_ image URL, and starting bid amount in order to post the lot.",
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();
    const currentIndex = (await Database.getAuctionLots())?.length;
    if (currentIndex === undefined) {
      await interaction.editReply(
        `Uh oh! Something appears to have gone wrong. Please try again later, or ping <@${NICKS_ID}> for help!`
      );
      return;
    }

    const msgId = (await interaction.fetchReply()).id;
    const auctionLot: AuctionLot = {
      messageId: msgId,
      index: currentIndex,
      title,
      description,
      imageUrl,
      startingBid,
    };
    const dbResult = await Database.createOrUpdateAuctionLot(auctionLot);
    if (!dbResult) {
      await interaction.editReply(
        `Uh oh! Something appears to have gone wrong. Please try again later, or ping <@${NICKS_ID}> for help!`
      );
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(`Lot #${currentIndex + 1}: ${title}`)
      .setDescription(description)
      .setImage(imageUrl)
      .addField(
        'Starting Bid',
        `<a:coin:726992358251561091> $${startingBid.toLocaleString('en-us')}`,
        true
      );

    const componentRow = new MessageActionRow();

    await interaction.editReply({
      embeds: [embed],
    });

    return;
  }

  async lotsEdit(interaction: CommandInteraction) {
    return;
  }

  async lotsRemove(interaction: CommandInteraction) {
    return;
  }
}
