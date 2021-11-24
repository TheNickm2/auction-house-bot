import { SlashCommandBuilder } from "@discordjs/builders";

export const CommandsList = [
    new SlashCommandBuilder().setName('test').setDescription('Test the bot\'s connection to Discord.'),
    new SlashCommandBuilder().setName('owo').setDescription('hehe Make y-youw wowds mowe OwO').addStringOption(option => option.setName('message').setDescription('Enter the message you\'d like to OwOify').setRequired(true)),
    new SlashCommandBuilder().setName('minesweeper').setDescription('Play a nice relaxing game of Minesweeper in Discord!'),
    new SlashCommandBuilder().setName('dadjoke').setDescription('Get an incredibly hilarious™ Dad Joke!')
];

export default CommandsList;