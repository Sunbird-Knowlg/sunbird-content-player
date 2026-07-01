import React from 'react';
import type { FtbData, FtbConfig, FtbAnswerState } from '../ecml.types';
import { COLORS, FONT_FAMILY } from '../../../constants';
import { t } from '../../../i18n/i18n';

interface Props {
  data: FtbData;
  config: FtbConfig;
  reviewState?: FtbAnswerState;
  isReview?: boolean;
  compact?: boolean;
  language: string;
  onAnswer(state: FtbAnswerState, score: number, maxScore: number, pass: boolean): void;
}

const BRICK = 'var(--sp-brick,#a85236)';
const GREEN = '#82a668';
const RED = '#d32f2f';

/** Splits question text at [[...]] placeholders, returns parts + blank count */
function parseTemplate(text: string): Array<{ type: 'text' | 'blank'; value: string; index: number }> {
  const parts: Array<{ type: 'text' | 'blank'; value: string; index: number }> = [];
  const regex = /\[\[.*?\]\]/g;
  let lastIndex = 0;
  let blankIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index), index: -1 });
    }
    parts.push({ type: 'blank', value: '', index: blankIdx++ });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex), index: -1 });
  }
  return parts;
}

const FtbQuestion: React.FC<Props> = ({ data, config, reviewState, isReview = false, compact = false, language, onAnswer }) => {
  const maxScore = config.max_score ?? data.answer.length;
  const parts = React.useMemo(() => parseTemplate(data.question.text ?? ''), [data.question.text]);
  const blankCount = parts.filter(p => p.type === 'blank').length;

  const [answers, setAnswers] = React.useState<string[]>(() => {
    if (reviewState) return reviewState.answers;
    return Array(blankCount).fill('');
  });
  const [activeBlank, setActiveBlank] = React.useState<number | null>(null);
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (!reviewState) {
      setAnswers(Array(blankCount).fill(''));
      setActiveBlank(null);
      inputRefs.current = [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.question.text]);

  const evaluate = (ans: string[]) => {
    const normalised = ans.map(a => a.toLowerCase().trim());
    const expected = data.answer.map(a => a.toLowerCase().trim());

    let correctCount: number;
    if (config.evalUnordered) {
      correctCount = normalised.filter(a => expected.includes(a)).length;
    } else {
      correctCount = normalised.filter((a, i) => a === (expected[i] ?? '')).length;
    }

    const allCorrect = correctCount === expected.length;
    const score = config.partial_scoring
      ? parseFloat(((correctCount / expected.length) * maxScore).toFixed(2))
      : allCorrect ? maxScore : 0;

    onAnswer({ type: 'ftb', answers: ans }, score, maxScore, allCorrect);
  };

  const handleChange = (idx: number, value: string) => {
    if (isReview) return;
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);
    evaluate(next);
  };

  const isBlankCorrect = (idx: number): boolean =>
    (answers[idx] ?? '').toLowerCase().trim() === (data.answer[idx] ?? '').toLowerCase().trim();

  /* blank colour in the sentence */
  const blankColor = (idx: number): string => {
    if (isReview) return isBlankCorrect(idx) ? GREEN : RED;
    return activeBlank === idx ? BRICK : '#c7b8aa';
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Centered sentence block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 16 : 22, width: '100%' }}>
        {data.question.image && (
          <img src={data.question.image} alt="question" style={{ maxWidth: '100%', maxHeight: 'clamp(80px, 9cqi, 120px)', borderRadius: 8, objectFit: 'contain', alignSelf: 'center' }} />
        )}

        {/* Sentence with inline pill-shaped blank inputs */}
        <div style={{ fontSize: 'clamp(17px, 1.8cqi, 22px)', color: COLORS.obsidian, lineHeight: 2.5, margin: 0, fontWeight: 600, textAlign: 'center' as const }}>
          {parts.map((part, i) => {
            if (part.type === 'text') {
              return <span key={i} dangerouslySetInnerHTML={{ __html: part.value }} />;
            }
            const idx = part.index;
            const color = blankColor(idx);
            const hasValue = (answers[idx] ?? '').trim().length > 0;
            const isFocused = activeBlank === idx;
            return (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', verticalAlign: 'middle', margin: compact ? '0 6px' : '0 8px',
              }}>
                <input
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  disabled={isReview}
                  value={answers[idx] ?? ''}
                  placeholder={`word ${idx + 1}`}
                  onFocus={() => setActiveBlank(idx)}
                  onBlur={() => setActiveBlank(a => (a === idx ? null : a))}
                  onChange={e => handleChange(idx, e.target.value)}
                  style={{
                    display: 'inline-block', width: 'clamp(120px, 13cqi, 160px)',
                    padding: 'clamp(6px, 0.9cqi, 8px) clamp(16px, 1.9cqi, 18px)', textAlign: 'center',
                    border: `2px dashed ${color}`,
                    borderRadius: 40, outline: 'none',
                    background: isFocused || hasValue ? '#fdf5f3' : '#fdf5f3',
                    fontSize: 'clamp(15px, 1.5cqi, 18px)', fontFamily: FONT_FAMILY, fontWeight: 700,
                    color: hasValue ? COLORS.obsidian : '#c7b8aa',
                    transition: 'all 0.2s', cursor: isReview ? 'default' : 'text',
                    boxShadow: isFocused ? `0 0 0 3px rgba(168,82,54,0.12)` : 'none',
                  }}
                />
              </span>
            );
          })}
        </div>

        {/* Hint text */}
        {!isReview && (
          <p style={{
            fontSize: compact ? 12 : 14, color: '#c7b8aa', fontStyle: 'italic',
            textAlign: 'center', margin: 0,
          }}>
            Type your answer in each blank
          </p>
        )}

        {/* review: show expected answers for wrong blanks */}
        {isReview && data.answer.some((_, idx) => !isBlankCorrect(idx)) && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f0f7ed', border: `1.5px solid ${GREEN}` }}>
            <p style={{ fontSize: 12, color: '#4a7a5a', fontWeight: 700, margin: '0 0 4px' }}>{t(language, 'CORRECT_ANSWERS')}</p>
            <p style={{ fontSize: 14, color: '#4a7a5a', margin: 0 }}>
              {data.answer.map((a, i) => `${i + 1}. ${a}`).join('   ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FtbQuestion;
