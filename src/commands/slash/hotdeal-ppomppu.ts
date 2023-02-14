import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { HotDealScrapper } from '../../scrapper/hot-deal-scrapper';

export const HotdealPpomppu: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('뽐')
        .setDescription(
            `${
                new Date().getMonth() + 1
            }월 ${new Date().getDate()}일 ${new Date().getHours()}:${new Date().getMinutes()} 기준 뽐뿌 핫딜 정보를 불러옵니다.`
        ),
    execute: async (interaction) => {
        const scrapperInstance = new HotDealScrapper();
        const hotDealResult = await scrapperInstance.requestDocument();
        await interaction.reply(`${hotDealResult}`);
    },
};
