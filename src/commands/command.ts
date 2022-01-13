import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { EventEmitter } from 'events';

export interface Command {
  data: SlashCommandBuilder | any;
  execute(interaction: CommandInteraction): Promise<void>;
}
