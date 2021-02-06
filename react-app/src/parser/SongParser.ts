import { LineCategory, splitAsTokens } from './LineParser'

function splitArrayBySize<T>(array: T[], size: number): T[][] {
  const result = [] as T[][]
  for (const element of array) {
    const last = result[result.length - 1]
    if (last && last.length < size) {
      last.push(element)
    } else {
      result.push([element])
    }
  }
  return result
}

function convertBodyToSlide(body: Body, lineSize = 2): Slide[] {
  const { tag, lines } = body
  return splitArrayBySize(lines, lineSize).map(lines => ({
    tag: tag,
    body: lines.join('\n'),
  }))
}

export type SongPart = {
  start: number
  end: number
  category: LineCategory
  lines: string[]
}

export type Body = {
  tag?: string
  lines: string[]
}

export enum SlideConvertMethod {
  withFlowOrder,
  withBodyOrder,
}

export type Slide = {
  tag?: string
  body: string
}

export class SongParser {
  title?: string
  flow?: string
  linkUrl?: string
  bodys: Body[] = []
  tagBodyMap = new Map<string, Body>()
  bodysWithNoTag: Body[] = []
  comments: string[] = []

  private logDiscard(type: string, part: SongPart | string[], lineJoiner = '\n') {
    if (part instanceof Array) {
      console.error(`${type} part (${part}) is discarded`)
    } else {
      console.error(`${type} part (${part.lines.join(lineJoiner)}) is discarded`)
    }
  }

  constructor(public songParts: SongPart[]) {
    let currentTag: string | undefined
    for (const part of songParts) {
      if (part.category === LineCategory.title) {
        currentTag = undefined
        if (this.title === undefined) {
          this.title = part.lines.join('\n')
        } else {
          this.logDiscard('title', part)
        }
      }
      if (part.category === LineCategory.flow) {
        currentTag = undefined
        if (this.flow === undefined) {
          this.flow = part.lines.join(' ')
        } else {
          this.logDiscard('flow', part, ' ')
        }
      }
      if (part.category === LineCategory.linkUrl) {
        currentTag = undefined
        if (this.linkUrl === undefined) {
          this.linkUrl = part.lines.join('\n')
        } else {
          this.logDiscard('linkUrl', part)
        }
      }
      if (part.category === LineCategory.tag) {
        currentTag = part.lines[0].toUpperCase() || undefined
        console.error('set current tag', currentTag)
        if (part.lines.length > 1) {
          this.logDiscard('tag', part.lines.slice(1), ', ')
        }
      }
      if (part.category === LineCategory.body) {
        console.error('current tag for body', currentTag)
        const lastBody = this.bodys[this.bodys.length - 1]
        if (lastBody && currentTag && lastBody.tag === currentTag) {
          lastBody.lines = lastBody.lines.concat(part.lines)
        } else {
          this.bodys.push({ tag: currentTag, lines: part.lines })
        }
      }
      if (part.category === LineCategory.comment) {
        this.comments.push(part.lines.join('\n'))
      }
    }

    this.bodysWithNoTag = this.bodys.filter($0 => $0.tag === undefined)
    this.tagBodyMap = new Map(
      this.bodys.flatMap(({ tag, lines }) => (tag ? [{ tag, lines }] : [])).map($0 => [$0.tag, $0]),
    )
  }

  toSlideBodyOrder(): Slide[] {
    return this.bodys.flatMap($0 => convertBodyToSlide($0))
  }

  toSlideFlowOrder(): Slide[] {
    if (this.flow === undefined) {
      return this.toSlideBodyOrder()
    }
    const flowTokens = splitAsTokens(this.flow).map($0 => $0.toUpperCase())
    const bodys = flowTokens.map(token => {
      return (token && this.tagBodyMap.get(token)) || token
    })
    const slidesFromFlowTokens: Slide[] = bodys.flatMap(body => {
      if (typeof body === 'string') {
        return [{ tag: body, body: '' }]
      } else {
        return convertBodyToSlide(body)
      }
    })
    const slidesFromUntaggedBodys = this.bodysWithNoTag.flatMap($0 => convertBodyToSlide($0))
    return slidesFromFlowTokens.concat(slidesFromUntaggedBodys)
  }

  toSlides(method: SlideConvertMethod = SlideConvertMethod.withFlowOrder): Slide[] {
    switch (method) {
      case SlideConvertMethod.withFlowOrder:
        return this.toSlideFlowOrder()
      case SlideConvertMethod.withBodyOrder:
        return this.toSlideBodyOrder()
      default:
        return this.toSlideBodyOrder()
    }
  }

  toString(): string {
    return `
			* title: ${this.title}
			* flow: ${this.flow}
			* linkUrl: ${this.linkUrl}
			* bodys: ${this.bodys.map(({ tag, lines }) => `[${tag}]\n${lines.join('\n')}`).join('\n\n')}
			* tagBodyMap: ${this.tagBodyMap}
			* bodysWithNoTag: ${this.bodysWithNoTag}
			* comments: ${this.comments}
		`
  }
}
