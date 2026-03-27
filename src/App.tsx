import { useMemo, useState } from 'react';
import { ActionCard } from './components/ActionCard';
import { processScreenshotInputs } from './services/screenshotPipeline';
import type { ScreenshotInput, SmartAction } from './types/domain';

export default function App() {
  const [screenshots, setScreenshots] = useState<ScreenshotInput[]>([]);
  const [actions, setActions] = useState<SmartAction[]>([]);

  const grouped = useMemo(() => {
    return actions.reduce<Record<string, SmartAction[]>>((acc, action) => {
      acc[action.group] ??= [];
      acc[action.group].push(action);
      return acc;
    }, {});
  }, [actions]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    const next: ScreenshotInput[] = Array.from(files).map((file, index) => ({
      id: `${file.name}-${index}`,
      fileName: file.name,
      sourceUrl: URL.createObjectURL(file),
      extractedText: ''
    }));

    setScreenshots(next);
    setActions([]);
  };

  const updateText = (id: string, text: string) => {
    setScreenshots((prev) => prev.map((item) => (item.id === id ? { ...item, extractedText: text } : item)));
  };

  const runAnalysis = () => {
    setActions(processScreenshotInputs(screenshots));
  };

  return (
    <main className="layout">
      <section className="hero">
        <h1>SmartShot Web Demo</h1>
        <p>
          Завантаж скріншоти, додай OCR-текст вручну (для тесту), і подивись як система перетворює їх на
          дії: пости, події, wishlist, витрати та інше.
        </p>
      </section>

      <section className="panel">
        <label className="upload">
          <span>1) Обери скріншоти</span>
          <input type="file" accept="image/*" multiple onChange={onFileChange} />
        </label>

        {screenshots.length > 0 && (
          <div className="input-list">
            <h2>2) Додай текст зі скріншотів (опціонально)</h2>
            {screenshots.map((shot) => (
              <article className="screenshot-row" key={shot.id}>
                <img src={shot.sourceUrl} alt={shot.fileName} />
                <div>
                  <strong>{shot.fileName}</strong>
                  <textarea
                    value={shot.extractedText}
                    onChange={(event) => updateText(shot.id, event.target.value)}
                    placeholder="Встав OCR або частину тексту зі скріншота..."
                  />
                </div>
              </article>
            ))}
            <button onClick={runAnalysis}>3) Аналізувати та запропонувати дії</button>
          </div>
        )}
      </section>

      <section className="results">
        {Object.entries(grouped).map(([group, groupActions]) => (
          <div key={group} className="group">
            <h2>{group}</h2>
            <div className="grid">
              {groupActions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        ))}

        {screenshots.length === 0 && <p>Щоб почати, додай кілька скріншотів вище.</p>}
        {screenshots.length > 0 && actions.length === 0 && <p>Натисни кнопку аналізу, щоб згенерувати дії.</p>}
      </section>
    </main>
  );
}
