import { GoogleSpreadsheetRow } from 'google-spreadsheet';
export default interface AhcGuildMember extends GoogleSpreadsheetRow {
    Who: string;
    Sales: number;
    Rank: number;
    Reqs: number;
    Farmed: number;
    Immune: string;
    'Raffles Met': string;
    'Sales Met': string;
    Status: string;
    Safe: Boolean;
    '5k Tickets': number;
    '50k Tickets': number;
    'Mat Raffle Tickets': number;
}