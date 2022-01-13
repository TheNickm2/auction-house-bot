import * as schedule from 'node-schedule';

export class TaskScheduler {
  constructor() {}

  scheduleMessage(
    minute: string,
    hour: string,
    day: string,
    timeZone: string,
    messageContent: string
  ) {
    const rule = new schedule.RecurrenceRule();
    rule.tz = timeZone;
  }
}
