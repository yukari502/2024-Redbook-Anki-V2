const fs = require("fs");
const path = require("path");

const deckPath = path.join(__dirname, "..", "deck.json");
const deck = JSON.parse(fs.readFileSync(deckPath, "utf8"));
const notes = deck.children.flatMap((child) => child.notes);
const originalNoteCount = notes.length;

const translateIcon =
    '<div class="trans_icon"><svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path d="M5 15v2a2 2 0 0 0 1.85 1.995L7 19h3v2H7a4 4 0 0 1-4-4v-2h2zm13-5l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16 10h2zm-1 2.885L15.753 16h2.492L17 12.885zM8 2v2h4v7H8v3H6v-3H2V4h4V2h2zm9 1a4 4 0 0 1 4 4v2h-2V7a2 2 0 0 0-2-2h-3V3h3zM6 6H4v3h2V6zm4 0H8v3h2V6z"></path></svg></div>';

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderExamples(examples = []) {
    if (examples.length === 0) return "";

    const rows = examples
        .map(
            ([english, chinese]) =>
                '<tr class="def_row"><td><div class="point"><div class="pp"></div></div></td>' +
                '<td><div class="li_ex"><div class="val_ex">' +
                escapeHtml(english) +
                '</div><div class="bil_ex">' +
                escapeHtml(chinese) +
                "</div></div></td></tr>",
        )
        .join("");

    return '<div class="li_exs" name="exam_n"><table><tbody>' + rows + "</tbody></table></div>";
}

function renderDefinitionRows(definitions) {
    return definitions
        .map((definition, index) => {
            const grammar = definition.grammar
                ? '<span class="gra">' + escapeHtml(definition.grammar) + "</span>"
                : "";
            return (
                '<tr class="def_row"><td><div class="se_d b_primtxt">' +
                (index + 1) +
                ".</div></td><td><div class=\"de_co\"><div class=\"def_pa\">" +
                grammar +
                '<span class="bil b_primtxt">' +
                escapeHtml(definition.chinese) +
                '</span><span class="val b_regtxt">' +
                escapeHtml(definition.english) +
                "</span></div></div></td></tr>"
            );
        })
        .join("");
}

function renderPartOfSpeech(part, definitions, index) {
    const examples = definitions.flatMap((definition) => definition.examples || []);
    return (
        '<div class="each_cat"><div class="li_pos"><div class="pos_lin">' +
        '<div class="pos_icon"><i></i></div><div class="pos">' +
        escapeHtml(part) +
        '</div><div class="pos_tools">' +
        translateIcon +
        '<div class="m_icon"><i></i></div></div></div>' +
        '<div class="de_seg" id="pos_' +
        index +
        '"><div class="se_lis"><table><tbody>' +
        renderDefinitionRows(definitions) +
        "</tbody></table></div>" +
        renderExamples(examples) +
        "</div></div></div>"
    );
}

function renderIdiom(idiom, index) {
    return (
        '<div class="each_cat"><div class="li_id b_divdef" id="idiom_' +
        index +
        '"><div class="idm"><div class="idm_icon"><i></i></div><div class="idm_ti">IDM</div></div>' +
        '<div class="idm_seg"><div class="idm_s"><span class="ids b_alink">' +
        escapeHtml(idiom.phrase) +
        '</span></div><div class="li_ids_co"><div class="li_sens"><div class="idmdef_li">' +
        '<div class="de_co"><div class="def_pa"><span class="bil b_primtxt">' +
        escapeHtml(idiom.chinese) +
        '</span><span class="val b_regtxt">' +
        escapeHtml(idiom.english) +
        "</span></div></div></div>" +
        renderExamples(idiom.examples) +
        "</div></div></div></div></div>"
    );
}

function renderOxford({ parts = [], idioms = [] }) {
    const partHtml = parts
        .map((part, index) => renderPartOfSpeech(part.part, part.definitions, index))
        .join("");
    const idiomHtml = idioms.map(renderIdiom).join("");
    return '<div class="oxford">' + partHtml + idiomHtml + "</div>";
}

function findNote(word) {
    const matches = notes.filter((note) => note.fields[16] === word);
    if (matches.length !== 1) {
        throw new Error(`Expected exactly one note for ${word}, found ${matches.length}`);
    }
    return matches[0];
}

function ensureOxfordWrapper(note) {
    const value = note.fields[7].trim();
    if (!value.startsWith('<div class="oxford">')) {
        note.fields[7] = '<div class="oxford">' + value + "</div>";
    }
}

findNote("retrospect").fields[7] = renderOxford({
    idioms: [
        {
            phrase: "in retrospect",
            chinese: "回顾；回想；追溯往事",
            english:
                "thinking about a past event or situation, often with a different opinion of it from the one you had at the time",
            examples: [
                ["In retrospect, I think that I was wrong.", "回首往事，我觉得当时我错了。"],
                ["The decision seems extremely odd, in retrospect.", "回想起来，这个决定显得极其荒谬。"],
            ],
        },
    ],
});

findNote("depend").fields[7] = renderOxford({
    parts: [
        {
            part: "v.",
            definitions: [
                {
                    grammar: "~ on/upon sb/sth",
                    chinese: "信赖；依靠",
                    english: "to rely on somebody or something and be able to trust them",
                    examples: [
                        ["He was the sort of person you could depend on.", "他是你可以信赖的那种人。"],
                    ],
                },
                {
                    grammar: "~ on/upon sb/sth (for sth)",
                    chinese: "依靠，依赖（钱、帮助等）",
                    english: "to need money, help, etc. from somebody or something else",
                    examples: [
                        [
                            "The community depends on the shipping industry for its survival.",
                            "这个社区依靠航运业生存。",
                        ],
                    ],
                },
                {
                    grammar: "~ on/upon sth",
                    chinese: "取决于；由…决定",
                    english: "to be affected or decided by something",
                    examples: [
                        ["It would depend on the circumstances.", "这要取决于具体情况。"],
                    ],
                },
            ],
        },
    ],
    idioms: [
        {
            phrase: "depending on",
            chinese: "视乎；决定于；根据",
            english: "according to",
            examples: [
                [
                    "Starting salary varies from £26 000 to £30 500, depending on experience.",
                    "起薪为 26 000 至 30 500 英镑不等，依个人经验而定。",
                ],
            ],
        },
        {
            phrase: "that depends | it (all) depends",
            chinese: "那得看情况",
            english:
                "used to say that you are not certain about something because other things have to be considered",
            examples: [
                ["‘Is he coming?’ ‘That depends.’", "“他来吗？”“那要看情况。”"],
            ],
        },
    ],
});

findNote("leading").fields[7] = renderOxford({
    parts: [
        {
            part: "adj.",
            definitions: [
                {
                    grammar: "[only before noun]",
                    chinese: "最重要的；最成功的；首屈一指的",
                    english: "most important or most successful",
                    examples: [
                        ["She is a leading expert in the field.", "她是该领域的顶尖专家。"],
                        ["She was offered the leading role in the new TV series.", "她获邀出演新电视剧的主角。"],
                    ],
                },
                {
                    chinese: "领先的；居前的",
                    english: "ahead of others in a race or contest",
                    examples: [
                        ["She started the last lap just behind the leading group.", "她开始最后一圈时紧跟在领先组后面。"],
                    ],
                },
            ],
        },
        {
            part: "n.",
            definitions: [
                {
                    chinese: "行距（相邻两个印刷文本行之间的空白）",
                    english: "the amount of white space between lines of printed text",
                },
            ],
        },
    ],
});

findNote("outset").fields[7] = renderOxford({
    idioms: [
        {
            phrase: "at/from the outset (of sth)",
            chinese: "在（某事）开始时；从一开始",
            english: "at or from the beginning of something",
            examples: [
                ["I made it clear right from the outset that I disapproved.", "从一开始我就明确地说我不赞成。"],
                ["You should have made that clear right at the outset.", "你本应该一开始就把那件事说清楚。"],
            ],
        },
    ],
});

findNote("ill").fields[7] = renderOxford({
    parts: [
        {
            part: "adj.",
            definitions: [
                {
                    grammar: "[not usually before noun]",
                    chinese: "有病；不舒服",
                    english: "suffering from an illness or disease; not feeling well",
                    examples: [
                        ["Her father is seriously ill in hospital.", "她父亲病重住院。"],
                        ["We both started to feel ill shortly after the meal.", "饭后不久我们两人都开始感到不适。"],
                    ],
                },
                {
                    grammar: "[only before noun]",
                    chinese: "坏的；有害的",
                    english: "bad or harmful",
                    examples: [
                        ["She suffered no ill effects from the experience.", "这次经历没有给她带来不良影响。"],
                    ],
                },
                {
                    grammar: "[formal]",
                    chinese: "带来厄运的；不吉利的",
                    english: "that brings, or is thought to bring, bad luck",
                    examples: [["a bird of ill omen", "被视为不祥之兆的鸟"]],
                },
            ],
        },
        {
            part: "adv.",
            definitions: [
                {
                    chinese: "恶劣地；糟糕地",
                    english: "badly or in an unpleasant way",
                    examples: [
                        ["The area is ill served by public transport.", "该地区的公共交通服务很差。"],
                    ],
                },
                {
                    grammar: "[formal]",
                    chinese: "困难地；勉强地",
                    english: "only with difficulty",
                    examples: [
                        ["We can ill afford to lose any more time.", "我们再也耽误不起时间了。"],
                    ],
                },
            ],
        },
        {
            part: "n.",
            definitions: [
                {
                    grammar: "[usually plural, formal]",
                    chinese: "问题；弊病；疾患",
                    english: "a problem or harmful thing; an illness",
                    examples: [["the ills of the modern world", "现代社会的种种弊病"]],
                },
                {
                    grammar: "[uncountable, literary]",
                    chinese: "伤害；厄运",
                    english: "harm; bad luck",
                    examples: [["I wish him no ill.", "我并不希望他遭遇不幸。"]],
                },
            ],
        },
    ],
});

findNote("fantastical").fields[7] = renderOxford({
    parts: [
        {
            part: "adj.",
            definitions: [
                {
                    chinese: "极好的；了不起的",
                    english: "extremely good; excellent",
                    examples: [
                        ["You've done a fantastic job.", "你干得真棒。"],
                        ["The weather was absolutely fantastic.", "天气好极了。"],
                    ],
                },
                {
                    chinese: "巨大的；异乎寻常的",
                    english: "very large; larger than expected",
                    examples: [
                        ["They spent a fantastic amount of money on the wedding.", "他们在婚礼上花了一大笔钱。"],
                    ],
                },
                {
                    chinese: "奇异的；富于想象的",
                    english: "strange and showing a lot of imagination",
                    examples: [
                        ["He drew fantastic animals with two heads and large wings.", "他画了一些长着两个头和大翅膀的奇异动物。"],
                    ],
                },
                {
                    chinese: "不切实际的；难以置信的",
                    english: "impossible to put into practice; impossible to believe",
                    examples: [["a fantastic scheme for making money", "不切实际的赚钱计划"]],
                },
            ],
        },
    ],
});

// This reported card already contains corrected definitions. Keep its
// hand-maintained content and add the standard wrapper used by the deck.
ensureOxfordWrapper(findNote("preceding"));

const accord = findNote("accord");
if (
    !accord.fields[7].includes("协议；条约") ||
    !accord.fields[7].includes("in accord (with sth/sb)") ||
    !accord.fields[7].includes("Our society accords great importance to the family.")
) {
    throw new Error("The current accord/accordance correction is incomplete");
}

const template = deck.note_models[0].tmpls[0];
const legacyFeedbackLink =
    /<a href="https:\/\/github\.com\/yukari502\/2024-Redbook-Anki-V2\/issues\/new\?title=[^"]+"/;
const safeFeedbackLink =
    '<a href="https://github.com/yukari502/2024-Redbook-Anki-V2/issues/new" ' +
    'onclick="var w=document.querySelector(\'.word_c\');this.href=\'https://github.com/yukari502/2024-Redbook-Anki-V2/issues/new?title=\'+encodeURIComponent(\'[错词反馈] \'+(w?w.textContent.trim():\'\'))+\'&amp;body=\'+encodeURIComponent(\'**字段错误类型（拼写/释义/例句/排版）:**\\n\\n**具体描述：**\\n\');"';

if (legacyFeedbackLink.test(template.afmt)) {
    template.afmt = template.afmt.replace(legacyFeedbackLink, safeFeedbackLink);
} else if (!template.afmt.includes("w?w.textContent.trim()")) {
    throw new Error("Could not locate the feedback link to harden");
}

const regressionChecks = {
    retrospect: ["in retrospect", "回顾；回想；追溯往事"],
    depend: ["取决于；由…决定", "that depends | it (all) depends"],
    leading: ["最重要的；最成功的；首屈一指的", "领先的；居前的"],
    outset: ["at/from the outset (of sth)", "从一开始"],
    ill: ["有病；不舒服", "问题；弊病；疾患"],
    preceding: ["在前的；在先的；前面的"],
    fantastical: ["极好的；了不起的", "奇异的；富于想象的", "不切实际的；难以置信的"],
};

for (const [word, expectedValues] of Object.entries(regressionChecks)) {
    const oxford = findNote(word).fields[7];
    if (!oxford.startsWith('<div class="oxford">')) {
        throw new Error(`${word} is missing the Oxford wrapper`);
    }
    for (const expected of expectedValues) {
        if (!oxford.includes(expected)) {
            throw new Error(`${word} is missing expected content: ${expected}`);
        }
    }
    const openDivs = (oxford.match(/<div\b/g) || []).length;
    const closeDivs = (oxford.match(/<\/div>/g) || []).length;
    if (openDivs !== closeDivs) {
        throw new Error(`${word} has unbalanced div elements: ${openDivs} / ${closeDivs}`);
    }
}

if (notes.length !== originalNoteCount || originalNoteCount !== 6102) {
    throw new Error(`Unexpected note count: ${notes.length}`);
}
if (template.afmt.includes("issues/new?title=%5B") || !template.afmt.includes("encodeURIComponent")) {
    throw new Error("The feedback link still embeds unescaped rich text");
}

const output = JSON.stringify(deck, null, 4).replace(/\n/g, "\r\n") + "\r\n";
fs.writeFileSync(deckPath, output, "utf8");
console.log("Fixed open issues and verified 6,102 notes.");
