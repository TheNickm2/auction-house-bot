import * as Airtable from 'airtable';
import { Collection } from 'discord.js';

export class AirtableHelper {
  private readonly AtInstance: Airtable.Base;

  /**
   * Creates an instance of AirtableHelper.
   * @param {string} ATKey - The Airtable API key to use for the instance
   * @param {string} ATBaseId - The Airtable Base ID to use for the instance
   * @memberof AirtableHelper
   */
  constructor(ATKey: string, ATBaseId: string) {
    this.AtInstance = new Airtable({ apiKey: ATKey }).base(ATBaseId);
  }

  /**
   * Get an array of records that match a formula in a given AT table
   *
   * @param {string} tableName - The table name (string) as seen in Airtable
   * @param {string} formula - The custom formula to filter records against (see https://support.airtable.com/hc/en-us/articles/203255215-Formula-field-reference)
   * @returns an array of matching records or null if no matching records were found
   * @memberof AirtableHelper
   */
  getRecordsByFormula(
    tableName: string,
    formula: string
  ): Array<Airtable.Record<any>> | null {
    try {
      const recordsList = [];
      this.AtInstance(tableName)
        .select({
          filterByFormula: formula,
        })
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach((record) => {
              record.getId();
              recordsList.push(record);
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.error(err);
            }
            if (recordsList.length > 0) {
              return recordsList;
            }
            return null;
          }
        );
    } catch (ex) {
      console.error(ex);
      return null;
    }
  }

  /**
   * Update a record with the given record ID with the provided value(s)
   *
   * @param {string} tableName - The table name (string) as seen in Airtable
   * @param {string} recordId - The record ID used by the Airtable database
   * @param {*} recordValue - The new value for the provided record
   * @returns true if successful, false if error
   * @memberof AirtableHelper
   */
  updateRecordById(tableName: string, recordId: string, recordValue: any) {
    try {
      this.AtInstance(tableName)
        .update(recordId, recordValue)
        .then(() => {
          return true;
        });
    } catch (ex) {
      console.error(ex);
      return false;
    }
  }
}
