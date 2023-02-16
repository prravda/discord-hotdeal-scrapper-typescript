import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { PpomppuHotDealScrapper } from '../../scrappers/ppomppu-hot-deal-scrapper';
import { APIEmbedField } from 'discord-api-types/v10';

export const HotDealPpomppuCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('뽐')
        .setDescription(`명령어 호출 시점 기준 유효한 뽐뿌 핫딜을 불러옵니다.`),

    execute: async (interaction) => {
        await interaction.deferReply();

        const scrapperInstance = new PpomppuHotDealScrapper();
        const hotDealResult = await scrapperInstance.requestDocument();

        const resultEmbed = new EmbedBuilder()
            .setColor(0xefff00)
            .setTitle('뽐뿌 핫 딜 목록!')
            .setDescription(
                `${new Date().toLocaleTimeString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                })} 기준 뽐뿌에서 유효한 핫 딜 목록이에요`
            )
            .addFields(
                ...hotDealResult.map<APIEmbedField>((deal) => {
                    return {
                        name: deal.title,
                        value: deal.link,
                    };
                })
            )
            .setFooter({
                text: '오류제보 및 기능개선은 #봇_기능_건의 혹은 prravda#8996 로',
            });

        if (hotDealResult) {
            await interaction.editReply({ embeds: [resultEmbed] });
        }
    },
};
