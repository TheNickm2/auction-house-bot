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
  'Mat Raffle Tickets': number;
  Cow: number;
  Chicken: number;
  [key: string]: any;
}
