export interface DuplicateTableRepositoryInterface {
    isNewHotDeal(hash: string): Promise<boolean>;
}
