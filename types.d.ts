export interface BasicHotDeal {
    id: number;
    title: string;
    link: string;
}

export interface PpomppuHotDeal extends BasicHotDeal {}

export interface FmKoreaPopularHotDeal extends BasicHotDeal {}

export interface FmKoreaGeneralHotDeal extends BasicHotDeal {
    seller: string;
    productPrice: string;
    shippingCharge: string;
    category: string;
}

export interface FmKoreaTotalHotDeal {
    general: FmKoreaGeneralHotDeal[];
    popular: FmKoreaPopularHotDeal[];
}
