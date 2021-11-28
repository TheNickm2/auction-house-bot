import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import axios, { AxiosInstance } from "axios";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dadjoke")
        .setDescription("Get a random dad joke from the dad-a-base"),
    async execute(interaction: CommandInteraction) {
        const dadJoke = await getDadJoke();
        if (dadJoke) {
            await interaction.reply(dadJoke);
        } else {
            await interaction.reply({
                content:
                    "Failed to obtain a dad joke from the dad-a-base. Please try again later.",
                ephemeral: true,
            });
        }
    },
};

/**
 * Get a dad joke from the dad-a-base (icanhazdadjoke.com)
 *
 * @returns a dad joke from the dad-a-base as a string | null if error occurs
 */
async function getDadJoke() {
    try {
        const response = await axios({
            method: "GET",
            url: "https://icanhazdadjoke.com/",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "User-Agent": "A Discord Bot",
            },
        });
        if (response && response.status === 200) {
            if (response.data.joke) return response.data.joke;
        }
        return null;
    } catch (err: any) {
        console.error(err);
        return null;
    }
}
