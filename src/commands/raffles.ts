import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';
import AhcSheetFunctions from '../helpers/ahcsheetfunctions';

export class CommandRaffles implements Command {
  public data = new SlashCommandBuilder()
    .setName('raffles')
    .setDescription('Check the status of the various AHC raffles!')
    .addUserOption((option) =>
      option
        .setName('username')
        .setDescription(
          "The username of the player whose raffles you'd like to query (leave blank for generic raffle info)."
        )
    );
  public async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.options.getUser('username');
      const embed = new MessageEmbed()
        .setColor('#4e0891')
        .setTitle('AHC Raffle Status')
        .setAuthor(
          'AHC Info Center',
          process.env.EMBED_AUTHOR_ICON ? process.env.EMBED_AUTHOR_ICON : null,
          process.env.EMBED_AUTHOR_LINK ? process.env.EMBED_AUTHOR_LINK : ''
        );
      if (user) {
        const discordMember = await interaction.guild.members.fetch(user);
        if (discordMember) {
          const memberName = discordMember.nickname
            ? discordMember.nickname
            : user.username;
          const memberInfo = await AhcSheetFunctions.GetGuildMemberAHC(
            memberName
          );
          let key50kTix, key5kTix;
          Object.keys(memberInfo).forEach((key) => {
            if (key.startsWith('5k Tickets')) key5kTix = key;
            else if (key.startsWith('50k Tickets')) key50kTix = key;
          });
          if (memberInfo) {
            embed
              .setDescription(
                'Your current raffle ticket entries can be seen below. Please note that the AHC Info Center is updated roughly once per day, therefore the information below may not reflect recent in-game actions.'
              )
              .setTitle(`AHC Raffle Status for ${memberName}`)
              .setTimestamp()
              .setFooter(
                `Requested by @${interaction.user.username}#${interaction.user.discriminator}`
              )
              .addField(
                'Highroller Raffle Tickets',
                memberInfo[key50kTix].toLocaleString('en-US'),
                true
              )
              .addField(
                'Gold Raffle Tickets',
                memberInfo[key5kTix].toLocaleString('en-US'),
                true
              )
              .addField(
                'Mat Raffle Tickets',
                memberInfo['Mat Raffle Tickets'].toLocaleString('en-US'),
                true
              );
            await interaction.editReply({
              embeds: [embed],
            });
            return;
          }
        }
      }
      const raffles = await AhcSheetFunctions.GetRafflesAHC();
      if (!raffles) {
        await interaction.editReply(
          'An error occurred while loading data from the Info Center. Please try again later.'
        );
        return;
      }
      embed
        .setDescription(
          `AHC has two gold raffles - standard and highroller. The standard raffle tickets are 5,000 gold each and the highroller raffle tickets are 50,000 gold each. Gold can be deposited directly to the AHC guild bank to participate.`
        )
        .addField('Total Value of All Prizes', raffles.total, true)
        .addField('Total Players with Tickets', raffles.players, true)
        .addField(
          'Individual Raffle Pot Values',
          `Highroller: ${raffles.highroller}\n1st Place: ${raffles.first}\n2nd Place: ${raffles.second}\n3rd Place: ${raffles.third}`,
          false
        )
        .setFooter(
          `Requested by @${interaction.user.username}#${interaction.user.discriminator}`
        )
        .setTimestamp();
      interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      console.error(err);
      return;
    }
  }
  constructor(emitter: EventEmitter) {}
}
