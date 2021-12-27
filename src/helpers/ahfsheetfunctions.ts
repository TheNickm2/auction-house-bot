import GoogleSheetsHelper from './googlesheets';
import { GoogleSpreadsheetRow } from 'google-spreadsheet';
import { Collection } from 'discord.js';
import IAhcGuildMember from '../interfaces/IAhcGuildMember';

export default class AhfSheetFunctions {
    static async GetTopSalesAHC() {
        try {
            const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
            if (!sheetId) {
                console.warn(
                    'The Google Sheet ID was not found in the environment variables. Please ensure the GOOGLE_SPREADSHEET_ID environment variable exists.'
                );
                return false;
            }
            const sheetHelper = new GoogleSheetsHelper(sheetId);
            const sheet = await sheetHelper.loadSheet('Sales info');
            if (!sheet) return false;
            await sheet.loadCells('E3:F12');
            const topSellers: Collection<string, number> = new Collection();
            for (let i = 3; i < 13; i++) {
                const sellerName = await sheet
                    .getCellByA1(`E${i}`)
                    .value.toString();
                const sellerAmount = await sheet.getCellByA1(`F${i}`).value;
                if (typeof sellerAmount === 'number') {
                    topSellers.set(sellerName, sellerAmount);
                } else {
                    return false;
                }
            }
            return topSellers;
        } catch (ex) {
            console.error(ex);
            return false;
        }
    }
    static async GetRafflesAHC() {
        try {
            const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
            if (!sheetId) {
                console.warn(
                    'The Google Sheet ID was not found in the environment variables. Please ensure the GOOGLE_SPREADSHEET_ID environment variable exists.'
                );
                return false;
            }
            const sheetHelper = new GoogleSheetsHelper(sheetId);
            const sheet = await sheetHelper.loadSheet('Gold Raffle');
            if (!sheet) return false;
            await sheet.loadCells('O2:R15');
            const raffleAmountHighroller = await sheet
                .getCellByA1('R9')
                .value.toLocaleString('en-US');
            const raffleAmountFirst = await sheet
                .getCellByA1('R6')
                .value.toLocaleString('en-US');
            const raffleAmountSecond = await sheet
                .getCellByA1('R7')
                .value.toLocaleString('en-US');
            const raffleAmountThird = await sheet
                .getCellByA1('R8')
                .value.toLocaleString('en-US');
            const raffleTotalPrizes = await sheet
                .getCellByA1('P3')
                .value.toLocaleString('en-US');
            const rafflePlayers = await sheet
                .getCellByA1('R3')
                .value.toString();
            return {
                highroller: raffleAmountHighroller,
                first: raffleAmountFirst,
                second: raffleAmountSecond,
                third: raffleAmountThird,
                total: raffleTotalPrizes,
                players: rafflePlayers,
            };
        } catch (ex) {
            console.error(ex);
            return false;
        }
    }
    static async GetGuildMemberAHC(memberName: string) {
        try {
            const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
            if (!sheetId) {
                return false;
            }
            const sheetHelper = new GoogleSheetsHelper(sheetId);
            const sheet = await sheetHelper.loadSheet('AHC Bot Pull');
            if (!sheet) return false;
            await sheet.loadHeaderRow();
            await sheet.loadCells('A1:M502');
            const rows = await sheet.getRows();
            const guildMembers = new Collection<string, IAhcGuildMember>();
            rows.forEach(async (row) => {
                const rowData = row as IAhcGuildMember;
                if (rowData.Who && rowData.Who.trim() != '') {
                    guildMembers.set(rowData.Who.trim().toLowerCase(), rowData);
                }
            });
            return guildMembers.get(memberName.trim().toLowerCase().replace('@', ''));
        } catch (ex) {
            console.error(ex);
            return false;
        }
    }
}
