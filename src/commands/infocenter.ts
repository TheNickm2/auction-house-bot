import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ButtonInteraction,
  Collection,
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';
import GoogleSheetsHelper from '../helpers/googlesheets';
import { GoogleSpreadsheetRow } from 'google-spreadsheet';
import AHCSheetFunctions from '../helpers/ahcsheetfunctions';
import IAhcGuildMember from '../interfaces/IAhcGuildMember';
export class CommandInfoCenter implements Command {
  public readonly data = new SlashCommandBuilder()
    .setName('infocenter')
    .setDescription('View data from the AHC Info Center within Discord!');
  public async execute(interaction: CommandInteraction) {
    try {
      const embed =
        this.colEmbeds?.get('AHC Info Center') ?? new MessageEmbed();
      await interaction.reply({
        embeds: [embed],
        components: this.components,
        ephemeral: true,
      });
    } catch (err: any) {
      console.error(err);
    }
  }
  private readonly components: Array<MessageActionRow> = [];
  private readonly colEmbeds: Collection<string, MessageEmbed> | undefined =
    undefined;
  constructor(emitter: EventEmitter) {
    try {
      this.components = [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId('infoTopSalesAHC')
            .setLabel('Top Sellers')
            .setStyle('PRIMARY')
            .setEmoji('816522754529689651'),
          new MessageButton()
            .setCustomId('infoAHCReqsCheck')
            .setLabel('Check My Status')
            .setStyle('SUCCESS')
            .setEmoji('816522754529689651'),
          new MessageButton()
            .setCustomId('infoRafflesAHC')
            .setLabel('AHC Raffles')
            .setStyle('SECONDARY')
            .setEmoji('853692688549412904')
        ),
      ];

      this.colEmbeds = new Collection<string, MessageEmbed>();
      this.colEmbeds.set(
        'AHC Info Center',
        new MessageEmbed()
          .setColor('#4e0891')
          .setTitle('AHC Info Center')
          .setURL(
            process.env.EMBED_AUTHOR_LINK ? process.env.EMBED_AUTHOR_LINK : ''
          )
          .setAuthor(
            'AHC Info Center',
            process.env.EMBED_AUTHOR_ICON
              ? process.env.EMBED_AUTHOR_ICON
              : undefined,
            process.env.EMBED_AUTHOR_LINK ? process.env.EMBED_AUTHOR_LINK : ''
          )
          .setDescription(
            'Click the buttons below to navigate the AHC Info Center right here within Discord (or click "AHC Info Center" above to open the full info center in your web browser!)\n\nThe AHC Info Center is typically updated at least once daily, but may not always show real-time data.'
          )
          .setTimestamp()
      );
      this.colEmbeds.set(
        'AHC Top Sellers',
        new MessageEmbed()
          .setColor('#4e0891')
          .setTitle('AHC Top Sellers')
          .setAuthor(
            'AHC Info Center',
            process.env.EMBED_AUTHOR_ICON
              ? process.env.EMBED_AUTHOR_ICON
              : undefined,
            process.env.EMBED_AUTHOR_LINK ? process.env.EMBED_AUTHOR_LINK : ''
          )
          .setThumbnail(
            'https://cdn.discordapp.com/emojis/816522754529689651.png?size=4096'
          )
      );
      this.colEmbeds.set(
        'AHC Gold Raffle',
        new MessageEmbed()
          .setColor('#4e0891')
          .setTitle('AHC Raffle Status')
          .setAuthor(
            'AHC Info Center',
            process.env.EMBED_AUTHOR_ICON
              ? process.env.EMBED_AUTHOR_ICON
              : undefined,
            process.env.EMBED_AUTHOR_LINK ? process.env.EMBED_AUTHOR_LINK : ''
          )
      );
      this.colEmbeds.set(
        'My AHC Status',
        new MessageEmbed()
          .setColor('#4e0891')
          .setTitle('Your AHC Guild Status')
          .setAuthor(
            'AHC Info Center',
            process.env.EMBED_AUTHOR_ICON
              ? process.env.EMBED_AUTHOR_ICON
              : undefined,
            process.env.EMBED_AUTHOR_LINK ? process.env.EMBED_AUTHOR_LINK : ''
          )
      );
      this.colEmbeds.set(
        'My AHC Raffles',
        new MessageEmbed()
          .setColor('#4e0891')
          .setTitle('Your AHC Raffle Entries')
          .setAuthor(
            'AHC Info Center',
            process.env.EMBED_AUTHOR_ICON
              ? process.env.EMBED_AUTHOR_ICON
              : undefined,
            process.env.EMBED_AUTHOR_LINK ? process.env.EMBED_AUTHOR_LINK : ''
          )
      );

      emitter.on('infoTopSalesAHC', async (interaction: ButtonInteraction) => {
        await interaction.deferReply();
        const topSellers = await AHCSheetFunctions.GetTopSalesAHC();
        if (topSellers) {
          let sellers = '';
          topSellers.forEach((amount, sellerName) => {
            sellers += `${sellerName} (${amount.toLocaleString('en-US')})\n`;
          });
          const embed =
            this.colEmbeds?.get('AHC Top Sellers') ?? new MessageEmbed();
          embed
            .addField('Seller Name (Amount Sold)', sellers, true)
            .setFooter(
              `Requested by @${interaction.user.username}#${interaction.user.discriminator}`
            )
            .setTimestamp();
          await interaction.editReply({
            embeds: [embed],
          });
        } else {
          await interaction.editReply(
            'An error occurred while reading the AHC Info Center database. Please try again later.'
          );
        }
      });

      emitter.on('infoRafflesAHC', async (interaction: ButtonInteraction) => {
        await interaction.deferReply();
        const raffleData = await AHCSheetFunctions.GetRafflesAHC();
        if (raffleData) {
          const embed =
            this.colEmbeds?.get('AHC Gold Raffle') ?? new MessageEmbed();
          embed.fields = [];
          embed
            .setDescription(
              `AHC has two gold raffles - standard and highroller. The standard raffle tickets are 5,000 gold each and the highroller raffle tickets are 50,000 gold each. Gold can be deposited directly to the AHC guild bank to participate.`
            )
            .addField('Total Value of All Prizes', raffleData.total, true)
            .addField('Total Players with Tickets', raffleData.players, true)
            .addField(
              'Individual Raffle Pot Values',
              `Highroller: ${raffleData.highroller}\n1st Place: ${raffleData.first}\n2nd Place: ${raffleData.second}\n3rd Place: ${raffleData.third}`,
              false
            )
            .setFooter(
              `Requested by @${interaction.user.username}#${interaction.user.discriminator}`
            )
            .setTimestamp();
          await interaction.editReply({
            embeds: [embed],
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId('infoMyRaffles')
                  .setLabel('Check My Raffle Entries')
                  .setEmoji('???????')
                  .setStyle('SECONDARY')
              ),
            ],
          });
        } else {
          await interaction.editReply(
            'An error occurred while reading the AHC Info Center database. Please try again later.'
          );
        }
      });
      emitter.on('infoMyRaffles', async (interaction: ButtonInteraction) => {
        await interaction.deferReply({ ephemeral: true });
        const discordMember = interaction.member as GuildMember;
        const memberName = discordMember.nickname
          ? discordMember.nickname
          : discordMember.user.username;
        const esoMember = await AHCSheetFunctions.GetGuildMemberAHC(memberName);
        if (!esoMember) {
          return await interaction.editReply({
            content: `Unable to find a guild member with the name ${memberName}. If your Discord account name does not match your in-game account name, please set your nickname to match your in-game account name and try again.`,
          });
        }

        let key50kTix = '',
          key5kTix = '';
        Object.keys(esoMember).forEach((key) => {
          if (key.startsWith('5k Tickets')) key5kTix = key;
          else if (key.startsWith('50k Tickets')) key50kTix = key;
        });

        const embed =
          this.colEmbeds?.get('My AHC Raffles') ?? new MessageEmbed();
        embed.fields = [];
        embed
          .setDescription(
            'Your current raffle ticket entries can be seen below. Please note that the AHC Info Center is updated roughly once per day, therefore the information below may not reflect recent in-game actions.'
          )
          .setTimestamp()
          .setFooter(
            `Requested by @${interaction.user.username}#${interaction.user.discriminator}`
          )
          .addField(
            'Highroller Raffle Tickets',
            esoMember[key50kTix].toLocaleString('en-US'),
            true
          )
          .addField(
            'Gold Raffle Tickets',
            esoMember[key5kTix].toLocaleString('en-US'),
            true
          )
          .addField(
            'Mat Raffle Tickets',
            esoMember['Mat Raffle Tickets'].toLocaleString('en-US'),
            true
          );
        await interaction.editReply({
          embeds: [embed],
        });
      });

      emitter.on('infoAHCReqsCheck', async (interaction: ButtonInteraction) => {
        await interaction.deferReply({ ephemeral: true });
        const discordMember = interaction.member as GuildMember;
        const memberName = discordMember.nickname
          ? discordMember.nickname
          : discordMember.user.username;
        const esoMember = await AHCSheetFunctions.GetGuildMemberAHC(memberName);
        if (!esoMember) {
          return await interaction.editReply({
            content: `Unable to find a guild member with the name ${memberName}. If your Discord account name does not match your in-game account name, please set your nickname to match your in-game account name and try again.`,
          });
        }
        const embed =
          this.colEmbeds?.get('My AHC Status') ?? new MessageEmbed();
        embed.fields = [];
        embed.addField('Sales', esoMember.Sales.toLocaleString('en-US'), true);
        if (esoMember.Farmed && esoMember.Farmed > 0) {
          embed.addField(
            'Farmed',
            esoMember.Farmed.toLocaleString('en-US'),
            true
          );
        }
        embed.addField(
          'Status',
          esoMember.Safe
            ? `<a:check:918626532438704129> Requirements Met`
            : `<a:x_:918254096492929045> Requirements Unmet`,
          true
        );
        await interaction.editReply({
          embeds: [embed],
        });
      });
    } catch (err: any) {
      console.error(err);
    }
  }
}
