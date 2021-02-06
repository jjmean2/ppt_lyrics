export {}
declare global {
  interface Document {
    readonly lyricsform: HTMLFormElement & {
      readonly ulyrics: HTMLTextAreaElement
      readonly body: HTMLInputElement
    }
  }
}
