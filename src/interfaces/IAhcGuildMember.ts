import { GoogleSpreadsheetRow } from 'google-spreadsheet';
export default interface AhcGuildMember extends GoogleSpreadsheetRow {
  Who: string;
  Sales: number;
  Farmed: number;
  Safe: Boolean;
  'Mat Raffle Tickets': number;
  [key: string]: any;
}
