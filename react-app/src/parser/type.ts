export {}
declare global {
  interface Document {
    readonly lyricsform: HTMLFormElement & {
      readonly lyrics: HTMLTextAreaElement
      readonly body: HTMLInputElement
    }
  }
}
