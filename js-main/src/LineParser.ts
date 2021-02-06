import { SongParser, SongPart } from './SongParser'
import { $enum } from 'ts-enum-util'
import { Optional } from 'utility-types'

export enum LineCategory {
  empty,
  linkUrl,
  tag,
  flow,
  title,
  comment,
  body,
  date,
  separator,
  unknown,
}

const tagPatterns = [/^V\d?$/i, /^P?C\d?$/i, /^B\d?$/i, /^E(nding)$/i]
const isTag = (arg: string) => tagPatterns.some(pattern => pattern.test(arg))
export const flowTokenPatterns = [...tagPatterns, /^x\d$/i, /^간주$/]
export const isFlowToken = (arg: string): boolean =>
  flowTokenPatterns.some(pattern => pattern.test(arg))
export const splitAsTokens = (arg: string): string[] =>
  arg.split(/[\W_]/).filter($0 => /\w/.test($0))

const separatorPatterns = [/^[-=*][-=* ]+[-=*]$/]
const isSeparator = (arg: string) => separatorPatterns.some(pattern => pattern.test(arg))
const scoreRange = {
  certain: 5,
  notPossible: 0,
}

const titleSections = [
  LineCategory.comment,
  LineCategory.title,
  LineCategory.flow,
  LineCategory.linkUrl,
]

type Scorer = (text: string) => number | undefined
const categoryScorer: Partial<Record<LineCategory, Scorer>> = {
  [LineCategory.empty]: text => (text === '' ? scoreRange.certain : scoreRange.notPossible),
  [LineCategory.date]: text => undefined,
  [LineCategory.title]: text => {
    let score = 0
    if (/^\d./.test(text)) {
      score += 2
    }
    if (/\(\w\)$/.test(text)) {
      score += 2
    }
    if (/\(\w->\w\)$/.test(text)) {
      score += 1
    }
    return score
  },
  [LineCategory.linkUrl]: text =>
    /^https?:\/\/.*$/.test(text) ? scoreRange.certain : scoreRange.notPossible,
  [LineCategory.flow]: text => {
    const tokens = splitAsTokens(text)
    if (tokens.length === 1) {
      return scoreRange.notPossible
    }
    const flowTokens = tokens.filter(isFlowToken)
    return Math.ceil((5 * flowTokens.length) / tokens.length)
  },
  [LineCategory.tag]: text => {
    if (isTag(text)) {
      return scoreRange.certain
    }
    if (/^[A-Z]{,2}\d?$/i.test(text)) {
      return 3
    }
  },
  [LineCategory.body]: text => {
    if (/^[\w,"'.)( ]+$/i.test(text)) {
      return 2
    }
    return 1
  },
  [LineCategory.comment]: text => {
    if (/[가-힣]+/.test(text)) {
      return 2
    }
    return 1
  },
  [LineCategory.separator]: text =>
    isSeparator(text) ? scoreRange.certain : scoreRange.notPossible,
}

class Line {
  inferedCategory: {
    value: LineCategory
    score: number
  }
  constructor(public text: string) {
    const categories = $enum(LineCategory).getValues()
    this.inferedCategory = categories.reduce((result, current) => {
      if (result?.score === scoreRange.certain) {
        return result
      }
      const checker = categoryScorer[current]
      const score = checker?.(text)
      if (score !== undefined && score > (result?.score ?? -1)) {
        return { value: current, score: score }
      }
      return result
    }, undefined as { value: LineCategory; score: number } | undefined) ?? {
      value: LineCategory.unknown,
      score: 5,
    }
  }
}

export class LineParser {
  lines: Line[]
  private songsCache?: SongParser[]
  done = false
  constructor(text: string) {
    this.lines = text
      .trim()
      .split('\n')
      .map($0 => $0.trim())
      .reduce((result, current) => {
        const lastLine = result[result.length - 1] ?? ''
        if (!(current === '' && lastLine.text === '')) {
          result.push(new Line(current))
        }
        return result
      }, [] as Line[])
  }

  songs(): SongParser[] {
    if (this.songsCache) {
      return this.songsCache
    }
    const songParts = this.getSongParts()
    const songs: SongPart[][] = []

    let currentIndex = 0
    while (currentIndex !== -1 && currentIndex < songParts.length) {
      const currentPart = songParts[currentIndex]
      if (currentPart.category === LineCategory.separator) {
        const previousParts = songParts.slice(0, currentIndex)
        if (isCompleteSong(previousParts)) {
          songs.push(previousParts)
          songParts.splice(0, currentIndex)
          currentIndex = 1
          continue
        }
      } else if (titleSections.includes(currentPart.category)) {
        const firstBodyIndexAfterThis = songParts
          .slice(currentIndex)
          .findIndex($0 => $0.category === LineCategory.body)
        const titleEndIndex =
          firstBodyIndexAfterThis !== -1 ? currentIndex + firstBodyIndexAfterThis : undefined
        console.error(
          'current',
          currentPart.lines,
          'firstbody',
          songParts[titleEndIndex ?? -1]?.lines,
        )
        if (titleEndIndex !== undefined) {
          const isTitleSection = (() => {
            const categories = songParts.slice(currentIndex, titleEndIndex).map($0 => $0.category)
            console.error(
              'categories',
              categories.map($0 => $enum(LineCategory).getKeyOrDefault($0)),
            )
            return (
              categories.includes(LineCategory.title) ||
              categories.includes(LineCategory.flow) ||
              categories.includes(LineCategory.linkUrl)
            )
          })()
          console.error('is title section', isTitleSection, '\n')
          if (isTitleSection) {
            const previousParts = songParts.slice(0, currentIndex)
            if (isCompleteSong(previousParts)) {
              songs.push(previousParts)
              songParts.splice(0, currentIndex)
            }
            console.error('current index', currentIndex, '->', firstBodyIndexAfterThis)
            currentIndex = firstBodyIndexAfterThis
            continue
          } else {
            console.error('current index', currentIndex, '->', titleEndIndex)
            currentIndex = firstBodyIndexAfterThis
            continue
          }
        }
      }
      currentIndex += 1
    }
    if (isCompleteSong(songParts)) {
      songs.push(songParts)
    }

    this.songsCache = songs.map($0 => new SongParser($0))
    return this.songsCache
  }

  getSongParts(): SongPart[] {
    const songParts = [] as Optional<SongPart, 'end' | 'lines'>[]
    this.lines.forEach((line, index) => {
      const last = songParts[songParts.length - 1]
      if (last === undefined) {
        songParts.push({ start: index, category: line.inferedCategory.value })
      } else if (last.category !== line.inferedCategory.value) {
        last.end = index
        songParts.push({ start: index, category: line.inferedCategory.value })
      }
    })
    if (songParts[songParts.length - 1]) {
      songParts[songParts.length - 1].end = this.lines.length
    }
    return songParts.flatMap(part => {
      const { start, end, category } = part
      if (end === undefined) {
        return []
      }
      return [{ start, end, category, lines: this.lines.slice(start, end).map($0 => $0.text) }]
    })
  }
}

function isCompleteSong(songParts: SongPart[]): boolean {
  return songParts.filter($0 => $0.category === LineCategory.body).length > 0
}
