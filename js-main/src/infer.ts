// type Threeline = [prev: LineCategory | null, current: string, next: string | null]
// const urlPattern = /^https?:\/\/.*$/
// const tagPatterns = [/[Vv]\d{1}?/, /[Pp][Cc]\d{1}?/, /[Bb]/]

// interface CategoryScorer {
//   score(threeLine: Threeline): number
// }

// const scorer: Recored<LineCategory, CategoryScorer> = {
//   [LineCategory.body]: {},
// }

// const titleScorer: CategoryScorer = {
//   score(threeLine) {
//     const [prevCategory, current, next] = threeLine
//     const currentLine = current.trim()
//     const nextLine = next?.trim()

//     let score = 0
//     if (/^\d/.test(currentLine)) {
//       score += 3
//       if (nextLine && urlPattern.test(nextLine)) {
//         score += 4
//       }
//       if (prevCategory !== null && prevCategory === LineCategory.empty) {
//         score += 2
//       }
//     }
//     if (/\(\w\)$/.test(currentLine)) {
//       score += 3
//     }
//     return Math.min(10, score)
//   },
// }

// export function getFlowScore(threeLine: Threeline): LineCategory {}

export {}
