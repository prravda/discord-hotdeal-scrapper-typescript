import { ClientInstance } from '../../infra/discord/client-instance';
import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { FmkoreaHotDealScrapper } from '../scrappers/fmkorea-hot-deal-scrapper';

export const fmKoreaHotDealPeriodically = async () => {
    try {
        const client = ClientInstance.getClient();
        const fmKoreaScrapper = new FmkoreaHotDealScrapper();

        const job = async () => {
            const { popular, general } =
                await fmKoreaScrapper.getRefreshedHotDealList();

            const hotDealBroadcastChannel = await client.channels.fetch(
                '1079966776735060028'
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
                        })} 기준 펨코에서 갱신된 핫 딜 목록입니다. 갱신은 약 45분에 한 번씩 이뤄집니다. 제목과 링크만 있는 것은 인기 핫 딜, 그 외엔 일반 핫 딜 입니다. 제품명 밑 줄의 정보를 누르면 핫 딜 페이지로 이동합니다.`
                    )
                    .setFooter({
                        text: '오류제보 및 기능개선은 #봇_기능_건의 혹은 prravda#8996 로',
                    });

                if (popular.length > 0) {
                    resultAsEmbed.addFields(
                        ...popular.map<APIEmbedField>((deal) => {
                            return {
                                name: `**· ${deal.title}**`,
                                value: `[└─해당 핫 딜 바로가기](${deal.link})`,
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
                                    name: `**· ${deal.title}**`,
                                    value: `[└─⛺️: ${deal.seller} / 💵: ${deal.productPrice} / 📦: ${deal.shippingCharge} / 🧩: ${deal.category}](${deal.link})`,
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
