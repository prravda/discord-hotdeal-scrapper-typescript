export const PPOMPPU_AUXILIARY = {
    SELECTOR: {
        HOT_DEAL_TABLE: '.board_table',
        EACH_HOT_DEAL_ANCHOR_TAG: 'a.title:not([style])',
    },
    BASIC_HEADERS: {
        host: `www.ppomppu.co.kr`,
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36`,
        'sec-ch-ua': `"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"`,
        'sec-ch-ua-mobile': `?0`,
        'sec-ch-ua-platform': `macOS`,
    },
};

export const FMKOREA_AUXILIARY = {
    SELECTOR: {
        POPULAR_HOT_DEAL: {
            ITEM_LIST: {
                FOR_DESKTOP: 'tr.notice_pop1 > td.title > a:not([title])',
                FOR_MOBILE: 'li.pop1 > a[href]',
            },
        },
        GENERAL_HOT_DEAL: {
            ITEM_LIST: '.li.li_best2_pop0.li_best2_hotdeal0',
            TITLE_AND_LINK: 'h3.title > a',
            CATEGORY: {
                FOR_MOBILE: 'span.category',
                FOR_DESKTOP: 'span.category > a',
            },
            ADDITIONAL_INFO: 'a.strong',
        },
    },
    BASIC_HEADERS: {
        method: 'GET',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        referer: 'https://www.fmkorea.com/',
    },
};
