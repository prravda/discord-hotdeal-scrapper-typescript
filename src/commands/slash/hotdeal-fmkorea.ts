import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { APIEmbedField } from 'discord-api-types/v10';
import { FmKoreaHotDealScrapper } from '../../scrappers/fmkorea-hot-deal-scrapper';

export const HotDealFmKoreaCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('펨')
        .setDescription(
            '펨코 핫딜을 불러옵니다. 갱신은 약 15분에 한 번씩 이뤄집니다.'
        ),

    execute: async (interaction) => {
        try {
            await interaction.deferReply();

            const scrapperInstance = new FmKoreaHotDealScrapper();
            const hotDealResult = await scrapperInstance.requestDocument();

            if (hotDealResult === undefined) {
                throw Error('fmkorea hotdeal scrapper error');
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(0xefff00)
                .setTitle('펨코 핫 딜 목록!')
                .setDescription('일반핫딜은 상품명/판매처/가격/배송비 입니다.')
                .addFields(
                    { name: '.', value: '.' },
                    { name: '**인기핫딜**', value: '------' },
                    ...hotDealResult.popularHotDealList.map<APIEmbedField>(
                        (deal) => {
                            return {
                                name: deal.title,
                                value: deal.link,
                            };
                        }
                    )
                )
                .addFields(
                    { name: '.', value: '.' },
                    {
                        name: '**일반핫딜**',
                        value: '------',
                    },
                    ...hotDealResult.generalHotDealList.map<APIEmbedField>(
                        (deal) => {
                            return {
                                name: `${deal.title} / ${deal.detailedInfo.sellerName} / ${deal.detailedInfo.productPrice} / ${deal.detailedInfo.shippingCharge}`,
                                value: deal.link,
                            };
                        }
                    )
                )
                .setFooter({
                    text: '오류제보 및 기능개선은 #봇_기능_건의 혹은 prravda#8996 로',
                });

            if (hotDealResult) {
                await interaction.editReply({ embeds: [resultEmbed] });
            }
        } catch (e) {
            console.error(e);
            await interaction.editReply({ message: '오류 발생' });
        }
    },
};
