import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';

export const TestDogCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('테스트')
        .setDescription(`귀여운 강아지 사진을 출력합니다.`),
    execute: async (interaction) => {
        await interaction.reply('https://imgur.com/a/db2ZEyp');
    },
};
