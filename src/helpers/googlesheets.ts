import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

export default class GoogleSheetsHelper {
    private readonly doc: GoogleSpreadsheet;
    private clientEmail: string;
    private clientPrivateKey: string;
    private initialized: boolean;
    /**
     * Creates an instance of GoogleSheetsHelper.
     * @param {string} docId - The Document ID of the Google Spreadsheet (from the URL)
     * @memberof GoogleSheetsHelper
     */
    constructor(docId: string) {
        this.initialized = false;
        this.doc = new GoogleSpreadsheet(docId);
        this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        this.clientPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    }

    /**
     * Internal method to initialize the connection to Google - ran once on first loadsheet operation.
     *
     * @memberof GoogleSheetsHelper
     */
    private async initializeDocsConnection () {
        await this.doc.useServiceAccountAuth({
            client_email: this.clientEmail,
            private_key: this.clientPrivateKey
        });
        await this.doc.loadInfo();
    }
    public async loadSheet(titleOrIndex: string | number) {
        if (!this.initialized) {
            await this.initializeDocsConnection();
            this.initialized = true;
        }
        if (typeof titleOrIndex === "number") return this.doc.sheetsByIndex[titleOrIndex];
        if (typeof titleOrIndex === "string") return this.doc.sheetsByTitle[titleOrIndex];
        return null;
    }
}