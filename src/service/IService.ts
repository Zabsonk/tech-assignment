import ResponseParser from './ResponseParser';

export interface IService<TType extends object> {
    responseParser: ResponseParser;

    initGame(): void;

    fetchResult(): Promise<TType>;
}
