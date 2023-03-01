import { ClientInstance } from '../../infra/discord/client-instance';
import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { FmkoreaHotDealScrapper } from '../scrappers/fmkorea-hot-deal-scrapper';
import { envList } from '../../infra/env-config';

export const fmKoreaHotDealPeriodically = async () => {
    try {
        const client = ClientInstance.getClient();
        const fmKoreaScrapper = new FmkoreaHotDealScrapper();

        const job = async () => {
            const { popular, general } =
                await fmKoreaScrapper.getRefreshedHotDealList();

            const hotDealBroadcastChannel = await client.channels.fetch(
                envList.HOT_DEAL_CHANNEL_ID
            );

            if (
                hotDealBroadcastChannel &&
                hotDealBroadcastChannel.isTextBased()
            ) {
                const resultAsEmbed = new EmbedBuilder()
                    .setColor(0xefff00)
                    .setTitle('펨코 핫 딜 목록!')
                    .setDescription(
                        `${new Date().toLocaleTimeString('ko-KR', {
                            timeZone: 'Asia/Seoul',
                        })} 기준 펨코에서 갱신된 핫 딜 목록입니다.`
                    )
                    .setFooter({
                        text: '오류제보 및 기능개선은 #봇_기능_건의 혹은 prravda#8996 로',
                    });

                if (popular.length > 0) {
                    resultAsEmbed.addFields(
                        ...popular.map<APIEmbedField>((deal) => {
                            return {
                                name: `**· ${deal.title}**`,
                                value: `[  └─해당 핫 딜 바로가기(클릭)](${deal.link})`,
                            };
                        })
                    );
                }

                if (general.length > 0) {
                    resultAsEmbed.addFields(
                        ...general
                            .slice(0, 25 - popular.length)
                            .map<APIEmbedField>((deal) => {
                                return {
                                    name: `**·[${deal.category}]${deal.title}**`,
                                    value: `[  └─⛺a: ${deal.seller} / 💵: ${deal.productPrice} / 📦: ${deal.shippingCharge} / 바로가기(클릭)](${deal.link})`,
                                };
                            })
                    );
                }

                if (general.length > 0 || popular.length > 0) {
                    await hotDealBroadcastChannel.send({
                        embeds: [resultAsEmbed],
                    });
                }
            }

            setTimeout(
                job,
                1000 * 60 * 26 + Math.floor(Math.random() * 100) * 1000
            );
        };

        await job();
    } catch (e) {
        throw e;
    }
};
