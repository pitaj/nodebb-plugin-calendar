declare module 'translator' {
  interface NodebbTranslatorInstance {
    translate(input: string): Promise<string>;
    translate(input: string, callback: (translated: string) => void): void;
  }
  export interface NodebbTranslator {
    registerModule(
      name: string,
      moduleHandler: (language: string) => ((key: string, args: string[]) => string)
    ): void;
    create(lang?: string): NodebbTranslatorInstance;
  }
  export const Translator: NodebbTranslator;
  export const getLanguage: () => string;
  export const translate: NodebbTranslatorInstance['translate'];
}

declare namespace moment {
  interface Locale {
    relativeTime(n: '', withoutSuffix: boolean, key: RelativeTimeKey, isFuture: boolean): string;
  }
}
