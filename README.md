# SmartShot Web Demo

Тепер це **web-версія**, щоб легко протестувати flow без телефону.

## Що робить демо

1. Завантажуєш скріншоти через браузер.
2. За потреби вставляєш OCR/текст вручну.
3. Натискаєш аналіз.
4. Отримуєш згруповані дії:
   - соцмережі → чернетка поста;
   - зустрічі → подія в календар;
   - одяг/товари → wishlist;
   - фільми/музика → watchlist;
   - чеки → облік витрат;
   - подорожі → travel ideas;
   - інше → ручний розбір.

## Як запустити

```bash
npm install
npm run dev
```

Потім відкрити локальний URL від Vite (зазвичай `http://localhost:5173`).

## Виправлення deploy-помилки TS2688 (`react-native`)

Якщо в CI/CD бачиш щось на кшталт:

- `Cannot find type definition file for 'react-native'`
- або `npm warn config production Use --omit=dev instead`

зроби так:

1. Переконайся, що деплоїться **остання** ревізія (де немає Expo/mobile `tsconfig`).
2. Використовуй `npm run build` (в цьому репо він викликає `tsc --noEmit -p tsconfig.app.json && vite build`).
3. Якщо твоя платформа ставить пакети з `--omit=dev`, цей репо вже сумісний: build-інструменти винесені в `dependencies`.
4. Очисть кеш build-слою (інколи платформа використовує застарілий `node_modules`/tsc-cache).

## Де логіка

- `src/services/screenshotPipeline.ts` — класифікація + перетворення в Smart Actions.
- `src/App.tsx` — тестовий UI для завантаження скріншотів та перегляду дій.
- `src/types/domain.ts` — типи домену.

## Ідеї для production-версії

- Підключити OCR (Tesseract/Cloud Vision) автоматично.
- Додати мультимодальну модель для точного intent-аналізу.
- Реальні інтеграції: Google Calendar, Notion, Todoist, Telegram Saved.
- Дедуплікація скріншотів і пріоритизація дій.
