import {
    FmKoreaGeneralHotDeal,
    FmKoreaPopularHotDeal,
    PpomppuHotDeal,
} from '../../../types';
import { HOT_DEAL_SOURCE } from '../../enums';

export interface HotDealUpdated {
    version: number;
    hotDealSource: HOT_DEAL_SOURCE;
    timestamp: Date;
    listOfHotDeal:
        | PpomppuHotDeal[]
        | FmKoreaPopularHotDeal[]
        | FmKoreaGeneralHotDeal[];
}
