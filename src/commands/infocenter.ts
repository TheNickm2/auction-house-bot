import { SlashCommandBuilder } from '@discordjs/builders';
import {
    ButtonInteraction,
    Collection,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} from 'discord.js';
import { Command } from './command';
import { EventEmitter } from 'events';
import GoogleSheetsHelper from '../helpers/googlesheets';

export class CommandInfoCenter implements Command {
    public readonly data = new SlashCommandBuilder()
        .setName('infocenter')
        .setDescription('View data from the AHF Info Center within Discord!');
    public async execute(interaction: CommandInteraction) {
        await interaction.reply({
            embeds: [
                this.colEmbeds
                    .get('AHF Info Center')
                    .setFooter(
                        `@${interaction.user.username}#${interaction.user.discriminator}`
                    ),
            ],
            components: this.components,
            ephemeral: true,
        });
    }
    private readonly components: Array<MessageActionRow>;
    private readonly colEmbeds: Collection<string, MessageEmbed>;
    constructor(emitter: EventEmitter) {
        this.components = [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('infoTopSalesAHC')
                    .setLabel('Top Sales [AHC]')
                    .setStyle('PRIMARY')
                    .setEmoji('816522754529689651'),
                new MessageButton()
                    .setCustomId('infoTopSalesAHA')
                    .setLabel('Top Sales [AHA]')
                    .setStyle('PRIMARY')
                    .setEmoji('816522229293776976')
            ),
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('infoRafflesAHC')
                    .setLabel('AHC Gold Raffles')
                    .setStyle('SECONDARY')
            ),
        ];

        this.colEmbeds = new Collection<string, MessageEmbed>();
        this.colEmbeds.set(
            'AHF Info Center',
            new MessageEmbed()
                .setColor('#4e0891')
                .setTitle('AHF Info Center')
                .setURL(
                    process.env.EMBED_AUTHOR_LINK
                        ? process.env.EMBED_AUTHOR_LINK
                        : ''
                )
                .setAuthor(
                    'AHF Info Center',
                    process.env.EMBED_AUTHOR_ICON
                        ? process.env.EMBED_AUTHOR_ICON
                        : null,
                    process.env.EMBED_AUTHOR_LINK
                        ? process.env.EMBED_AUTHOR_LINK
                        : ''
                )
                .setDescription(
                    'Click the buttons below to navigate the AHF Info Center right here within Discord (or click "AHF Info Center" above to open the full info center in your web browser!)\n\nThe AHF Info Center is typically updated at least once daily, but may not always show real-time data.'
                )
                .setTimestamp()
        );
        this.colEmbeds.set(
            'AHC Top Sellers',
            new MessageEmbed()
                .setColor('#4e0891')
                .setTitle('AHC Top Sellers')
                .setAuthor(
                    'AHF Info Center',
                    process.env.EMBED_AUTHOR_ICON
                        ? process.env.EMBED_AUTHOR_ICON
                        : null,
                    process.env.EMBED_AUTHOR_LINK
                        ? process.env.EMBED_AUTHOR_LINK
                        : ''
                )
                .setThumbnail(
                    'https://cdn.discordapp.com/emojis/816522754529689651.png?size=4096'
                )
        );
        this.colEmbeds.set(
            'AHA Top Sellers',
            new MessageEmbed()
                .setColor('#4e0891')
                .setTitle('AHA Top Sellers')
                .setAuthor(
                    'AHF Info Center',
                    process.env.EMBED_AUTHOR_ICON
                        ? process.env.EMBED_AUTHOR_ICON
                        : null,
                    process.env.EMBED_AUTHOR_LINK
                        ? process.env.EMBED_AUTHOR_LINK
                        : ''
                )
                .setThumbnail(
                    'https://cdn.discordapp.com/emojis/816522229293776976.png?size=4096'
                )
        );
        this.colEmbeds.set(
            'AHC Gold Raffle',
            new MessageEmbed()
                .setColor('#4e0891')
                .setTitle('AHC Gold Raffle Status')
                .setAuthor(
                    'AHF Info Center',
                    process.env.EMBED_AUTHOR_ICON
                        ? process.env.EMBED_AUTHOR_ICON
                        : null,
                    process.env.EMBED_AUTHOR_LINK
                        ? process.env.EMBED_AUTHOR_LINK
                        : ''
                )
        );

        emitter.on(
            'infoTopSalesAHC',
            async (interaction: ButtonInteraction) => {
                const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
                if (!sheetId)
                    return await interaction.reply({
                        content:
                            'An error ocurred while loading data from the Info Center. Please try again later.',
                        ephemeral: true,
                    });
                await interaction.deferReply();
                const embed = this.colEmbeds.get('AHC Top Sellers');
                const sheetHelper = new GoogleSheetsHelper(sheetId);
                const sheet = await sheetHelper.loadSheet('Sales info');
                if (sheet) {
                    await sheet.loadCells('E3:F12');
                    const topSellers: Collection<string, number> =
                        new Collection();
                    for (let i = 3; i < 13; i++) {
                        const sellerName = await sheet
                            .getCellByA1(`E${i}`)
                            .value.toString();
                        const sellerAmount = await sheet.getCellByA1(`F${i}`)
                            .value;
                        if (typeof sellerAmount === 'number') {
                            topSellers.set(sellerName, sellerAmount);
                        } else {
                            await interaction.editReply({
                                content:
                                    'An error ocurred while loading data from the Info Center. Please try again later.',
                            });
                            return;
                        }
                    }
                    let sellers = '';
                    topSellers.forEach((amount, sellerName) => {
                        sellers += `${sellerName} (${amount.toLocaleString(
                            'en-US'
                        )})\n`;
                    });
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
                    await interaction.editReply({
                        content:
                            'An error ocurred while loading data from the Info Center. Please try again later.',
                    });
                }
            }
        );

        emitter.on(
            'infoTopSalesAHA',
            async (interaction: ButtonInteraction) => {
                const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
                if (!sheetId)
                    return await interaction.reply({
                        content:
                            'An error ocurred while loading data from the Info Center. Please try again later.',
                        ephemeral: true,
                    });
                await interaction.deferReply();
                const embed = this.colEmbeds.get('AHA Top Sellers');
                const sheetHelper = new GoogleSheetsHelper(sheetId);
                const sheet = await sheetHelper.loadSheet('Sales info');
                if (sheet) {
                    await sheet.loadCells('E28:F37');
                    const topSellers: Collection<string, number> =
                        new Collection();
                    for (let i = 28; i < 38; i++) {
                        const sellerName = await sheet
                            .getCellByA1(`E${i}`)
                            .value.toString();
                        const sellerAmount = await sheet.getCellByA1(`F${i}`)
                            .value;
                        if (typeof sellerAmount === 'number') {
                            topSellers.set(sellerName, sellerAmount);
                        } else {
                            await interaction.editReply({
                                content:
                                    'An error ocurred while loading data from the Info Center. Please try again later.',
                            });
                            return;
                        }
                    }
                    let sellers = '';
                    topSellers.forEach((amount, sellerName) => {
                        sellers += `${sellerName} (${amount.toLocaleString(
                            'en-US'
                        )})\n`;
                    });
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
                    await interaction.editReply({
                        content:
                            'An error ocurred while loading data from the Info Center. Please try again later.',
                    });
                }
            }
        );

        emitter.on('infoRafflesAHC', async (interaction: ButtonInteraction) => {
            const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
            if (!sheetId)
                return await interaction.reply({
                    content:
                        'An error ocurred while loading data from the Info Center. Please try again later.',
                    ephemeral: true,
                });
            await interaction.deferReply();
            const embed = this.colEmbeds.get('AHC Gold Raffle');
            const sheetHelper = new GoogleSheetsHelper(sheetId);
            const sheet = await sheetHelper.loadSheet('Gold Raffle');
            if (!sheet) {
                return await interaction.editReply({
                    content:
                        'An error ocurred while loading data from the Info Center. Please try again later.',
                });
            }
            await sheet.loadCells('O3:S8');
            const raffleAmountHighroller = await sheet
                .getCellByA1('S5')
                .value.toLocaleString('en-US');
            const raffleAmountFirst = await sheet
                .getCellByA1('Q6')
                .value.toLocaleString('en-US');
            const raffleAmountSecond = await sheet
                .getCellByA1('Q7')
                .value.toLocaleString('en-US');
            const raffleAmountThird = await sheet
                .getCellByA1('Q8')
                .value.toLocaleString('en-US');
            const raffleTotalPrizes = await sheet
                .getCellByA1('Q3')
                .value.toLocaleString('en-US');
            const rafflePlayers = await sheet
                .getCellByA1('S3')
                .value.toString();
            embed
                .setDescription(
                    `AHC has two gold raffles - standard and highroller. The standard raffle tickets are 5,000 gold each and the highroller raffle tickets are 50,000 gold each. Gold can be deposited directly to the AHC guild bank to participate.`
                )
                .addField('Total Value of All Prizes', raffleTotalPrizes, true)
                .addField('Total Players with Tickets', rafflePlayers, true)
                .addField(
                    'Individual Raffle Pot Values',
                    `Highroller: ${raffleAmountHighroller}\n1st Place: ${raffleAmountFirst}\n2nd Place: ${raffleAmountSecond}\n3rd Place: ${raffleAmountThird}`,
                    false
                );
            await interaction.editReply({ embeds: [embed] });
        });
    }
}
