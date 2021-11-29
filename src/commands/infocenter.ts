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
                    .setStyle('SECONDARY')
                    .setEmoji('823009166347862056'),
                new MessageButton()
                    .setCustomId('infoTopSalesAHA')
                    .setLabel('Top Sales [AHA]')
                    .setStyle('SECONDARY')
                    .setEmoji('823009166079688764')
            ),
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('infoCheckMyReqs')
                    .setLabel('Check My Reqs')
                    .setStyle('SECONDARY')
            ),
        ];

        this.colEmbeds = new Collection<string, MessageEmbed>();
        this.colEmbeds.set(
            'AHF Info Center',
            new MessageEmbed()
                .setColor('#4e0891')
                .setTitle('AHF Info Center')
                .setURL('https://t.co/XgzApQrxzn')
                .setAuthor(
                    'AHF Info Center',
                    'https://cdn.discordapp.com/icons/212818960280715265/a_fddb37206082b7da35b040cc9eebb99d.gif?size=4096',
                    'https://t.co/XgzApQrxzn'
                )
                .setDescription(
                    'Click the buttons below to navigate the AHF Info Center right here within Discord (or click "AHF Info Center" above to open the full info center in your web browser!)\nThe AHF Info Center is updated at least once daily, but may not always show real-time data.'
                )
                .setTimestamp()
        );
        this.colEmbeds.set(
            'AHC Top Sellers',
            new MessageEmbed()
                .setColor('#4e0891')
                .setTitle('AHC Top Sellers <:AHC2:823009166347862056>')
                .setAuthor(
                    'AHF Info Center',
                    'https://cdn.discordapp.com/icons/212818960280715265/a_fddb37206082b7da35b040cc9eebb99d.gif?size=4096',
                    'https://t.co/XgzApQrxzn'
                )
        );
        this.colEmbeds.set(
            'AHA Top Sellers',
            new MessageEmbed()
                .setColor('#4e0891')
                .setTitle('AHA Top Sellers <:AHA2:823009166079688764>')
                .setAuthor(
                    'AHF Info Center',
                    'https://cdn.discordapp.com/icons/212818960280715265/a_fddb37206082b7da35b040cc9eebb99d.gif?size=4096',
                    'https://t.co/XgzApQrxzn'
                )
        );

        emitter.on(
            'infoTopSalesAHC',
            async (interaction: ButtonInteraction) => {
                const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
                if (!sheetId)
                    return await interaction.reply({
                        content:
                            'An error occurred while loading the top sellers. Please try again later.',
                        ephemeral: true,
                    });
                await interaction.deferReply();
                const embed = this.colEmbeds.get('AHC Top Sellers');
                embed.spliceFields(0, embed.fields.length);
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
                                    'An error occurred while loading the top sellers. Please try again later.',
                            });
                            return;
                        }
                    }
                    let sellers = '';
                    let amounts = '';
                    topSellers.forEach((amount, sellerName) => {
                        sellers += `${sellerName}\n`;
                        amounts += `${amount.toLocaleString('en-US')}\n`;
                    });
                    embed
                        .addField('Seller Name', sellers, true)
                        .addField('Amount Sold', amounts, true)
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
                            'An error occurred while loading the top sellers. Please try again later.',
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
                            'An error occurred while loading the top sellers. Please try again later.',
                        ephemeral: true,
                    });
                await interaction.deferReply();
                const embed = this.colEmbeds.get('AHA Top Sellers');
                embed.spliceFields(0, embed.fields.length);
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
                                    'An error occurred while loading the top sellers. Please try again later.'
                            });
                            return;
                        }
                    }
                    let sellers = '';
                    let amounts = '';
                    topSellers.forEach((amount, sellerName) => {
                        sellers += `${sellerName}\n`;
                        amounts += `${amount.toLocaleString('en-US')}\n`;
                    });
                    embed
                        .addField('Seller Name', sellers, true)
                        .addField('Amount Sold', amounts, true)
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
                            'An error occurred while loading the top sellers. Please try again later.',
                    });
                }
            }
        );
    }
}
