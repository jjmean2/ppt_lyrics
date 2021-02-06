"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LineParser = exports.splitAsTokens = exports.isFlowToken = exports.flowTokenPatterns = exports.LineCategory = void 0;

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _SongParser = require("./SongParser");

var _tsEnumUtil = require("ts-enum-util");

var LineCategory;
exports.LineCategory = LineCategory;

(function (LineCategory) {
  LineCategory[LineCategory["empty"] = 0] = "empty";
  LineCategory[LineCategory["linkUrl"] = 1] = "linkUrl";
  LineCategory[LineCategory["tag"] = 2] = "tag";
  LineCategory[LineCategory["flow"] = 3] = "flow";
  LineCategory[LineCategory["title"] = 4] = "title";
  LineCategory[LineCategory["comment"] = 5] = "comment";
  LineCategory[LineCategory["body"] = 6] = "body";
  LineCategory[LineCategory["date"] = 7] = "date";
  LineCategory[LineCategory["separator"] = 8] = "separator";
  LineCategory[LineCategory["unknown"] = 9] = "unknown";
})(LineCategory || (exports.LineCategory = LineCategory = {}));

var tagPatterns = [/^V\d?$/i, /^P?C\d?$/i, /^B\d?$/i, /^E(nding)$/i];

var isTag = function isTag(arg) {
  return tagPatterns.some(function (pattern) {
    return pattern.test(arg);
  });
};

var flowTokenPatterns = [].concat(tagPatterns, [/^x\d$/i, /^간주$/]);
exports.flowTokenPatterns = flowTokenPatterns;

var isFlowToken = function isFlowToken(arg) {
  return flowTokenPatterns.some(function (pattern) {
    return pattern.test(arg);
  });
};

exports.isFlowToken = isFlowToken;

var splitAsTokens = function splitAsTokens(arg) {
  return arg.split(/[\W_]/).filter(function ($0) {
    return /\w/.test($0);
  });
};

exports.splitAsTokens = splitAsTokens;
var separatorPatterns = [/^[-=*][-=* ]+[-=*]$/];

var isSeparator = function isSeparator(arg) {
  return separatorPatterns.some(function (pattern) {
    return pattern.test(arg);
  });
};

var scoreRange = {
  certain: 5,
  notPossible: 0
};
var titleSections = [LineCategory.comment, LineCategory.title, LineCategory.flow, LineCategory.linkUrl];
var categoryScorer = {
  [LineCategory.empty]: function (text) {
    return text === '' ? scoreRange.certain : scoreRange.notPossible;
  },
  [LineCategory.date]: function (text) {
    return undefined;
  },
  [LineCategory.title]: function (text) {
    var score = 0;

    if (/^\d./.test(text)) {
      score += 2;
    }

    if (/\(\w\)$/.test(text)) {
      score += 2;
    }

    if (/\(\w->\w\)$/.test(text)) {
      score += 1;
    }

    return score;
  },
  [LineCategory.linkUrl]: function (text) {
    return /^https?:\/\/.*$/.test(text) ? scoreRange.certain : scoreRange.notPossible;
  },
  [LineCategory.flow]: function (text) {
    var tokens = splitAsTokens(text);

    if (tokens.length === 1) {
      return scoreRange.notPossible;
    }

    var flowTokens = tokens.filter(isFlowToken);
    return Math.ceil(5 * flowTokens.length / tokens.length);
  },
  [LineCategory.tag]: function (text) {
    if (isTag(text)) {
      return scoreRange.certain;
    }

    if (/^[A-Z]{,2}\d?$/i.test(text)) {
      return 3;
    }
  },
  [LineCategory.body]: function (text) {
    if (/^[\w,"'.)( ]+$/i.test(text)) {
      return 2;
    }

    return 1;
  },
  [LineCategory.comment]: function (text) {
    if (/[가-힣]+/.test(text)) {
      return 2;
    }

    return 1;
  },
  [LineCategory.separator]: function (text) {
    return isSeparator(text) ? scoreRange.certain : scoreRange.notPossible;
  }
};

var Line = function Line(text) {
  var _categories$reduce;

  (0, _classCallCheck2.default)(this, Line);
  this.text = text;
  (0, _defineProperty2.default)(this, "inferedCategory", void 0);
  var categories = (0, _tsEnumUtil.$enum)(LineCategory).getValues();
  this.inferedCategory = (_categories$reduce = categories.reduce(function (result, current) {
    var _result$score;

    if ((result === null || result === void 0 ? void 0 : result.score) === scoreRange.certain) {
      return result;
    }

    var checker = categoryScorer[current];
    var score = checker === null || checker === void 0 ? void 0 : checker(text);

    if (score !== undefined && score > ((_result$score = result === null || result === void 0 ? void 0 : result.score) !== null && _result$score !== void 0 ? _result$score : -1)) {
      return {
        value: current,
        score: score
      };
    }

    return result;
  }, undefined)) !== null && _categories$reduce !== void 0 ? _categories$reduce : {
    value: LineCategory.unknown,
    score: 5
  };
};

var LineParser = /*#__PURE__*/function () {
  function LineParser(text) {
    (0, _classCallCheck2.default)(this, LineParser);
    (0, _defineProperty2.default)(this, "lines", void 0);
    (0, _defineProperty2.default)(this, "songsCache", void 0);
    (0, _defineProperty2.default)(this, "done", false);
    this.lines = text.trim().split('\n').map(function ($0) {
      return $0.trim();
    }).reduce(function (result, current) {
      var _result;

      var lastLine = (_result = result[result.length - 1]) !== null && _result !== void 0 ? _result : '';

      if (!(current === '' && lastLine.text === '')) {
        result.push(new Line(current));
      }

      return result;
    }, []);
  }

  (0, _createClass2.default)(LineParser, [{
    key: "songs",
    value: function songs() {
      if (this.songsCache) {
        return this.songsCache;
      }

      var songParts = this.getSongParts();
      var songs = [];
      var currentIndex = 0;

      while (currentIndex !== -1 && currentIndex < songParts.length) {
        var currentPart = songParts[currentIndex];

        if (currentPart.category === LineCategory.separator) {
          var previousParts = songParts.slice(0, currentIndex);

          if (isCompleteSong(previousParts)) {
            songs.push(previousParts);
            songParts.splice(0, currentIndex);
            currentIndex = 1;
            continue;
          }
        } else if (titleSections.includes(currentPart.category)) {
          var _ret = function () {
            var _songParts;

            var firstBodyIndexAfterThis = songParts.slice(currentIndex).findIndex(function ($0) {
              return $0.category === LineCategory.body;
            });
            var titleEndIndex = firstBodyIndexAfterThis !== -1 ? currentIndex + firstBodyIndexAfterThis : undefined;
            console.error('current', currentPart.lines, 'firstbody', (_songParts = songParts[titleEndIndex !== null && titleEndIndex !== void 0 ? titleEndIndex : -1]) === null || _songParts === void 0 ? void 0 : _songParts.lines);

            if (titleEndIndex !== undefined) {
              var isTitleSection = function () {
                var categories = songParts.slice(currentIndex, titleEndIndex).map(function ($0) {
                  return $0.category;
                });
                console.error('categories', categories.map(function ($0) {
                  return (0, _tsEnumUtil.$enum)(LineCategory).getKeyOrDefault($0);
                }));
                return categories.includes(LineCategory.title) || categories.includes(LineCategory.flow) || categories.includes(LineCategory.linkUrl);
              }();

              console.error('is title section', isTitleSection, '\n');

              if (isTitleSection) {
                var _previousParts = songParts.slice(0, currentIndex);

                if (isCompleteSong(_previousParts)) {
                  songs.push(_previousParts);
                  songParts.splice(0, currentIndex);
                }

                console.error('current index', currentIndex, '->', firstBodyIndexAfterThis);
                currentIndex = firstBodyIndexAfterThis;
                return "continue";
              } else {
                console.error('current index', currentIndex, '->', titleEndIndex);
                currentIndex = firstBodyIndexAfterThis;
                return "continue";
              }
            }
          }();

          if (_ret === "continue") continue;
        }

        currentIndex += 1;
      }

      if (isCompleteSong(songParts)) {
        songs.push(songParts);
      }

      this.songsCache = songs.map(function ($0) {
        return new _SongParser.SongParser($0);
      });
      return this.songsCache;
    }
  }, {
    key: "getSongParts",
    value: function getSongParts() {
      var _this = this;

      var songParts = [];
      this.lines.forEach(function (line, index) {
        var last = songParts[songParts.length - 1];

        if (last === undefined) {
          songParts.push({
            start: index,
            category: line.inferedCategory.value
          });
        } else if (last.category !== line.inferedCategory.value) {
          last.end = index;
          songParts.push({
            start: index,
            category: line.inferedCategory.value
          });
        }
      });

      if (songParts[songParts.length - 1]) {
        songParts[songParts.length - 1].end = this.lines.length;
      }

      return songParts.flatMap(function (part) {
        var start = part.start,
            end = part.end,
            category = part.category;

        if (end === undefined) {
          return [];
        }

        return [{
          start,
          end,
          category,
          lines: _this.lines.slice(start, end).map(function ($0) {
            return $0.text;
          })
        }];
      });
    }
  }]);
  return LineParser;
}();

exports.LineParser = LineParser;

function isCompleteSong(songParts) {
  return songParts.filter(function ($0) {
    return $0.category === LineCategory.body;
  }).length > 0;
}
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LyricParser = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _LineParser = require("./LineParser");

var _SongParser = require("./SongParser");

function convertSlideToFormText(slide) {
  var tag = slide.tag,
      body = slide.body;
  return [`[[${tag !== null && tag !== void 0 ? tag : ''}]]`, body || tag].join('\n');
}

function convertSongSlidesToFormText(slides) {
  return slides.map(convertSlideToFormText).join('\n---\n');
}

var LyricParser = /*#__PURE__*/function () {
  function LyricParser(text) {
    (0, _classCallCheck2.default)(this, LyricParser);
    (0, _defineProperty2.default)(this, "lineParser", void 0);
    (0, _defineProperty2.default)(this, "songParsers", void 0);
    this.lineParser = new _LineParser.LineParser(text);
    this.songParsers = this.lineParser.songs();
  }

  (0, _createClass2.default)(LyricParser, [{
    key: "toFormText",
    value: function toFormText() {
      var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _SongParser.SlideConvertMethod.withFlowOrder;
      return this.songParsers.map(function ($0) {
        return convertSongSlidesToFormText($0.toSlides(method));
      }).join('\n===\n');
    }
  }]);
  return LyricParser;
}();

exports.LyricParser = LyricParser;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SongParser = exports.SlideConvertMethod = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _LineParser = require("./LineParser");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function splitArrayBySize(array, size) {
  var result = [];

  var _iterator = _createForOfIteratorHelper(array),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var element = _step.value;
      var last = result[result.length - 1];

      if (last && last.length < size) {
        last.push(element);
      } else {
        result.push([element]);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return result;
}

function convertBodyToSlide(body) {
  var lineSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  var tag = body.tag,
      lines = body.lines;
  return splitArrayBySize(lines, lineSize).map(function (lines) {
    return {
      tag: tag,
      body: lines.join('\n')
    };
  });
}

var SlideConvertMethod;
exports.SlideConvertMethod = SlideConvertMethod;

(function (SlideConvertMethod) {
  SlideConvertMethod[SlideConvertMethod["withFlowOrder"] = 0] = "withFlowOrder";
  SlideConvertMethod[SlideConvertMethod["withBodyOrder"] = 1] = "withBodyOrder";
})(SlideConvertMethod || (exports.SlideConvertMethod = SlideConvertMethod = {}));

var SongParser = /*#__PURE__*/function () {
  function SongParser(songParts) {
    (0, _classCallCheck2.default)(this, SongParser);
    this.songParts = songParts;
    (0, _defineProperty2.default)(this, "title", void 0);
    (0, _defineProperty2.default)(this, "flow", void 0);
    (0, _defineProperty2.default)(this, "linkUrl", void 0);
    (0, _defineProperty2.default)(this, "bodys", []);
    (0, _defineProperty2.default)(this, "tagBodyMap", new Map());
    (0, _defineProperty2.default)(this, "bodysWithNoTag", []);
    (0, _defineProperty2.default)(this, "comments", []);
    var currentTag;

    var _iterator2 = _createForOfIteratorHelper(songParts),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var part = _step2.value;

        if (part.category === _LineParser.LineCategory.title) {
          currentTag = undefined;

          if (this.title === undefined) {
            this.title = part.lines.join('\n');
          } else {
            this.logDiscard('title', part);
          }
        }

        if (part.category === _LineParser.LineCategory.flow) {
          currentTag = undefined;

          if (this.flow === undefined) {
            this.flow = part.lines.join(' ');
          } else {
            this.logDiscard('flow', part, ' ');
          }
        }

        if (part.category === _LineParser.LineCategory.linkUrl) {
          currentTag = undefined;

          if (this.linkUrl === undefined) {
            this.linkUrl = part.lines.join('\n');
          } else {
            this.logDiscard('linkUrl', part);
          }
        }

        if (part.category === _LineParser.LineCategory.tag) {
          currentTag = part.lines[0].toUpperCase() || undefined;
          console.error('set current tag', currentTag);

          if (part.lines.length > 1) {
            this.logDiscard('tag', part.lines.slice(1), ', ');
          }
        }

        if (part.category === _LineParser.LineCategory.body) {
          console.error('current tag for body', currentTag);
          var lastBody = this.bodys[this.bodys.length - 1];

          if (lastBody && currentTag && lastBody.tag === currentTag) {
            lastBody.lines = lastBody.lines.concat(part.lines);
          } else {
            this.bodys.push({
              tag: currentTag,
              lines: part.lines
            });
          }
        }

        if (part.category === _LineParser.LineCategory.comment) {
          this.comments.push(part.lines.join('\n'));
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    this.bodysWithNoTag = this.bodys.filter(function ($0) {
      return $0.tag === undefined;
    });
    this.tagBodyMap = new Map(this.bodys.flatMap(function (_ref) {
      var tag = _ref.tag,
          lines = _ref.lines;
      return tag ? [{
        tag,
        lines
      }] : [];
    }).map(function ($0) {
      return [$0.tag, $0];
    }));
  }

  (0, _createClass2.default)(SongParser, [{
    key: "logDiscard",
    value: function logDiscard(type, part) {
      var lineJoiner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '\n';

      if (part instanceof Array) {
        console.error(`${type} part (${part}) is discarded`);
      } else {
        console.error(`${type} part (${part.lines.join(lineJoiner)}) is discarded`);
      }
    }
  }, {
    key: "toSlideBodyOrder",
    value: function toSlideBodyOrder() {
      return this.bodys.flatMap(function ($0) {
        return convertBodyToSlide($0);
      });
    }
  }, {
    key: "toSlideFlowOrder",
    value: function toSlideFlowOrder() {
      var _this = this;

      if (this.flow === undefined) {
        return this.toSlideBodyOrder();
      }

      var flowTokens = (0, _LineParser.splitAsTokens)(this.flow).map(function ($0) {
        return $0.toUpperCase();
      });
      var bodys = flowTokens.map(function (token) {
        return token && _this.tagBodyMap.get(token) || token;
      });
      var slidesFromFlowTokens = bodys.flatMap(function (body) {
        if (typeof body === 'string') {
          return [{
            tag: body,
            body: ''
          }];
        } else {
          return convertBodyToSlide(body);
        }
      });
      var slidesFromUntaggedBodys = this.bodysWithNoTag.flatMap(function ($0) {
        return convertBodyToSlide($0);
      });
      return slidesFromFlowTokens.concat(slidesFromUntaggedBodys);
    }
  }, {
    key: "toSlides",
    value: function toSlides() {
      var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : SlideConvertMethod.withFlowOrder;

      switch (method) {
        case SlideConvertMethod.withFlowOrder:
          return this.toSlideFlowOrder();

        case SlideConvertMethod.withBodyOrder:
          return this.toSlideBodyOrder();

        default:
          return this.toSlideBodyOrder();
      }
    }
  }, {
    key: "toString",
    value: function toString() {
      return `
			* title: ${this.title}
			* flow: ${this.flow}
			* linkUrl: ${this.linkUrl}
			* bodys: ${this.bodys.map(function (_ref2) {
        var tag = _ref2.tag,
            lines = _ref2.lines;
        return `[${tag}]\n${lines.join('\n')}`;
      }).join('\n\n')}
			* tagBodyMap: ${this.tagBodyMap}
			* bodysWithNoTag: ${this.bodysWithNoTag}
			* comments: ${this.comments}
		`;
    }
  }]);
  return SongParser;
}();

exports.SongParser = SongParser;
"use strict";

var _main = require("./main");

window.onload = function () {
  (0, _main.initButton)();
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initButton = initButton;

var _LyricParser = require("./LyricParser");

function initButton() {
  var submitButton = document.getElementById('submit-button');
  var form = document.lyricsform;
  var textArea = form.lyrics;
  var hiddenBody = form.body;

  submitButton.onclick = function () {
    console.log(textArea.value);
    var parser = new _LyricParser.LyricParser(textArea.value);
    hiddenBody.value = parser.toFormText();
    console.log(hiddenBody.value);
    form.submit();
  };
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
