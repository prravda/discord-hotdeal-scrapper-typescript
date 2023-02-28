import { PpomppuHotDealScrapper } from '../scrappers/ppomppu-hot-deal-scrapper';
import { ClientInstance } from '../../infra/discord/client-instance';
import { APIEmbedField, EmbedBuilder } from 'discord.js';

export const ppomppuHotDealPeriodically = async () => {
    try {
        const client = ClientInstance.getClient();
        const ppomppuScrapper = new PpomppuHotDealScrapper();

        const job = async () => {
            const refreshedDealList =
                await ppomppuScrapper.getRefreshedHotDealList();

            const hotDealBroadcastChannel = await client.channels.fetch(
                '1079966776735060028'
            );

            if (
                refreshedDealList &&
                refreshedDealList.length > 0 &&
                hotDealBroadcastChannel &&
                hotDealBroadcastChannel.isTextBased()
            ) {
                const resultAsEmbed = new EmbedBuilder()
                    .setColor(0xefff00)
                    .setTitle('뽐뿌 핫 딜 목록!')
                    .setDescription(
                        `${new Date().toLocaleTimeString('ko-KR', {
                            timeZone: 'Asia/Seoul',
                        })} 기준 뽐뿌에서 갱신된 핫 딜 목록입니다.`
                    )
                    .addFields(
                        ...refreshedDealList.map<APIEmbedField>((deal) => {
                            return {
                                name: `**· ${deal.title}**`,
                                value: `[└─해당 핫 딜 바로가기(클릭)](${deal.link})`,
                            };
                        })
                    )
                    .setFooter({
                        text: '오류제보 및 기능개선은 #봇_기능_건의 혹은 prravda#8996 로',
                    });
                await hotDealBroadcastChannel.send({
                    embeds: [resultAsEmbed],
                });
            }

            setTimeout(
                job,
                1000 * 60 * 5 + Math.floor(Math.random() * 100) * 1000
            );
        };

        await job();
    } catch (e) {
        throw e;
    }
};
