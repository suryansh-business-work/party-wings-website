export {};

declare global {
  interface Window {
    addToQuote?: (service: any) => void;
    removeFromQuote?: (id: string) => void;
    getQuote?: () => any[];
    clearQuote?: () => void;
  }
}
