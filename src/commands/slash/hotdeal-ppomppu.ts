import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { HotDealScrapper } from '../../scrapper/hot-deal-scrapper';
import { RestOrArray } from '@discordjs/builders';
import { APIEmbedField } from 'discord-api-types/v10';

export const HotdealPpomppu: SlashCommand = {
    command: new SlashCommandBuilder().setName('뽐').setDescription(
        `${new Date().toLocaleTimeString('ko-KR', {
            timeZone: 'Asia/Seoul',
        })} 기준 유효한 뽐뿌 핫딜을 불러옵니다.`
    ),
    execute: async (interaction) => {
        const scrapperInstance = new HotDealScrapper();
        const hotDealResult = await scrapperInstance.requestDocument();

        // const embedFormatted: RestOrArray<APIEmbedField> = [];
        //
        // for (const eachDeal of hotDealResult) {
        //     embedFormatted.push({
        //         name: '제목',
        //         value: eachDeal.title
        //             ? eachDeal.title
        //             : '링크 접속 후 확인 필요',
        //     });
        //     embedFormatted.push({ name: '링크', value: eachDeal.link });
        // }

        const resultEmbed = new EmbedBuilder()
            .setColor(0xefff00)
            .setTitle('유효한 뽐뿌 핫딜 목록!')
            .setDescription(
                `${new Date().toLocaleTimeString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                })} 기준`
            )
            .addFields(
                {
                    name: '제목',
                    value: hotDealResult[0].title as string,
                },
                {
                    name: '링크',
                    value: hotDealResult[0].link,
                }
            );

        if (hotDealResult) {
            await interaction.editReply({ embeds: [resultEmbed] });
        }
    },
};
