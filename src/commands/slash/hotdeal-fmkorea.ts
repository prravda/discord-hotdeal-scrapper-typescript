import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { APIEmbedField } from 'discord-api-types/v10';
import { FmkoreaHotDealScrapper } from '../../scrappers/fmkorea-hot-deal-scrapper';

export const HotDealFmKoreaCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('펨')
        .setDescription(
            '펨코 핫딜을 불러옵니다. 갱신은 약 15분에 한 번씩 이뤄집니다.'
        ),

    execute: async (interaction) => {
        try {
            await interaction.deferReply();

            const scrapperInstance = new FmkoreaHotDealScrapper();
            const hotDealResult = await scrapperInstance.requestDocument();

            if (hotDealResult === undefined) {
                throw Error('fmkorea hotdeal scrapper error');
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(0xefff00)
                .setTitle('펨코 핫 딜 목록!')
                .setDescription(
                    '상위 5개는 인기 핫 딜, 그 밑으론 일반 핫 딜 입니다. 제품명 밑 줄의 정보를 누르면 핫 딜 페이지로 이동합니다.'
                )
                .addFields(
                    ...hotDealResult.popularHotDealList.map<APIEmbedField>(
                        (deal) => {
                            return {
                                name: `**· ${deal.title}**`,
                                value: `[└─해당 핫 딜 바로가기](${deal.link})`,
                            };
                        }
                    )
                )
                .addFields(
                    ...hotDealResult.generalHotDealList
                        .slice(0, 25 - hotDealResult.popularHotDealList.length)
                        .map<APIEmbedField>((deal) => {
                            return {
                                name: `**· ${deal.title}**`,
                                value: `[└─⛺️: ${deal.detailedInfo.sellerName} / 💵: ${deal.detailedInfo.productPrice} / 📦: ${deal.detailedInfo.shippingCharge}](${deal.link})`,
                            };
                        })
                )
                .setFooter({
                    text: '오류제보 및 기능개선은 #봇_기능_건의 혹은 prravda#8996 로',
                });

            if (hotDealResult) {
                await interaction.editReply({ embeds: [resultEmbed] });
            }
        } catch (e) {
            console.error(e);
            await interaction.editReply(
                '정보를 가져오던 도중 오류가 발생했습니다. 관리자에게 제보해주세요!'
            );
        }
    },
};
