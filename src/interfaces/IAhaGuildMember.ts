import { GoogleSpreadsheetRow } from 'google-spreadsheet';
export default interface AhaGuildMember extends GoogleSpreadsheetRow {
    Who: string;
    Sales: number;
    Rank: number;
    Reqs: number;
    Immune: string;
    'Raffles Met': string;
    'Sales Met': string;
    Status: string;
    Safe: Boolean;
    'Mat Raffle Tickets': number;
}