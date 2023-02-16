import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { APIEmbedField } from 'discord-api-types/v10';
import { FmKoreaHotDealScrapper } from '../../scrappers/fmkorea-hot-deal-scrapper';

export const HotdealPpomppu: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('펨')
        .setDescription(` 기준 유효한 펨코 핫딜을 불러옵니다.`),

    execute: async (interaction) => {
        await interaction.deferReply();

        const scrapperInstance = new FmKoreaHotDealScrapper();
        const hotDealResult = await scrapperInstance.requestDocument();

        if (hotDealResult === undefined) {
            throw Error('fmkorea hotdeal scrapper error');
        }

        const resultEmbed = new EmbedBuilder()
            .setColor(0xefff00)
            .setTitle('펨코 핫 딜 목록!')
            .setDescription('상품명/판매처/가격/배송비 순입니다.')
            .addFields(
                ...hotDealResult.popularItemList.map<APIEmbedField>((deal) => {
                    return {
                        name: deal.title,
                        value: deal.link,
                        inline: true,
                    };
                })
            )
            .addFields(
                ...hotDealResult.generalItemList.map<APIEmbedField>((deal) => {
                    return {
                        name: `${deal.title}/${deal.detailedInfo.sellerName}/${deal.detailedInfo.productPrice}/${deal.detailedInfo.shippingCharge}`,
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
