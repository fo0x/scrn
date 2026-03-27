import type { ScreenshotInput, ScreenshotInsight, SmartAction } from '../types/domain';

const SOCIAL_MARKERS = ['instagram', 'twitter', 'x.com', 'tiktok', 'linkedin', 'facebook'];
const MEETING_MARKERS = ['meet', 'zoom', 'calendar', 'meeting', 'call at', 'tomorrow at'];
const SHOPPING_MARKERS = ['shop', 'outfit', 'look', 'price', '$', 'uah', 'cart'];
const MEDIA_MARKERS = ['netflix', 'spotify', 'youtube', 'movie', 'playlist', 'album'];
const RECEIPT_MARKERS = ['receipt', 'invoice', 'check', 'tax', 'total'];
const TRAVEL_MARKERS = ['flight', 'boarding', 'hotel', 'airbnb', 'booking', 'trip'];
const IDEA_MARKERS = ['idea', 'thread', 'note to self', 'concept', 'startup'];

export function processScreenshotInputs(inputs: ScreenshotInput[]): SmartAction[] {
  return inputs
    .map((input, index) => {
      const insight = detectScreenshotIntent(input);
      return toSmartAction(insight, input, index);
    })
    .sort((a, b) => b.payload.priorityScore.localeCompare(a.payload.priorityScore));
}

function detectScreenshotIntent(input: ScreenshotInput): ScreenshotInsight {
  const marker = `${input.fileName} ${input.sourceUrl} ${input.extractedText}`.toLowerCase();

  if (hasAny(marker, SOCIAL_MARKERS)) {
    return {
      type: 'social_post',
      confidence: 0.9,
      extractedText: summarize(input.extractedText, 'Пост із соцмережі перетворено на текстову чернетку.'),
      entities: {
        network: SOCIAL_MARKERS.find((item) => marker.includes(item)) ?? 'social',
        priorityScore: '90'
      }
    };
  }

  if (hasAny(marker, MEETING_MARKERS)) {
    return {
      type: 'meeting',
      confidence: 0.86,
      extractedText: summarize(input.extractedText, 'Знайшов зустріч. Підготував подію для календаря.'),
      entities: {
        suggestedTitle: 'Зустріч зі скріншота',
        priorityScore: '95'
      }
    };
  }

  if (hasAny(marker, SHOPPING_MARKERS)) {
    return {
      type: 'shopping',
      confidence: 0.8,
      extractedText: summarize(input.extractedText, 'Товар збережено до wishlist покупок.'),
      entities: {
        folder: 'Wishlist / Покупки',
        priorityScore: '72'
      }
    };
  }

  if (hasAny(marker, MEDIA_MARKERS)) {
    return {
      type: 'media',
      confidence: 0.8,
      extractedText: summarize(input.extractedText, 'Додав медіаконтент у список «Подивитись/Послухати».') ,
      entities: {
        list: 'Media Wishlist',
        priorityScore: '70'
      }
    };
  }

  if (hasAny(marker, RECEIPT_MARKERS)) {
    return {
      type: 'receipt',
      confidence: 0.77,
      extractedText: summarize(input.extractedText, 'Розпізнано чек. Можна додати у витрати.'),
      entities: {
        expenseCategory: 'Автоматично визначити',
        priorityScore: '82'
      }
    };
  }

  if (hasAny(marker, TRAVEL_MARKERS)) {
    return {
      type: 'travel',
      confidence: 0.73,
      extractedText: summarize(input.extractedText, 'Тревел-скрін додано до ідей подорожей.'),
      entities: {
        board: 'Travel Ideas',
        priorityScore: '76'
      }
    };
  }

  if (hasAny(marker, IDEA_MARKERS)) {
    return {
      type: 'idea',
      confidence: 0.69,
      extractedText: summarize(input.extractedText, 'Ідею збережено у базу нотаток.'),
      entities: {
        notebook: 'Captured Ideas',
        priorityScore: '68'
      }
    };
  }

  return {
    type: 'unknown',
    confidence: 0.35,
    extractedText: summarize(input.extractedText, 'Тип скріншота не визначено — поставлено в ручний розбір.'),
    entities: {
      priorityScore: '40'
    }
  };
}

function toSmartAction(insight: ScreenshotInsight, source: ScreenshotInput, index: number): SmartAction {
  const id = `action-${index}-${Math.round(insight.confidence * 100)}`;

  switch (insight.type) {
    case 'social_post':
      return {
        id,
        source,
        title: 'Чернетка поста',
        description: insight.extractedText,
        actionType: 'draft_post',
        group: 'Контент',
        payload: {
          priorityScore: insight.entities.priorityScore ?? '60',
          draftText: source.extractedText || 'Згенеруй post summary + CTA + 3 hashtags.'
        }
      };
    case 'meeting':
      return {
        id,
        source,
        title: 'Подія в календар',
        description: insight.extractedText,
        actionType: 'create_calendar_event',
        group: 'Планування',
        payload: {
          priorityScore: insight.entities.priorityScore ?? '60',
          title: insight.entities.suggestedTitle ?? 'Зустріч'
        }
      };
    case 'shopping':
      return {
        id,
        source,
        title: 'Додати в wishlist',
        description: insight.extractedText,
        actionType: 'add_to_wishlist',
        group: 'Покупки',
        payload: {
          priorityScore: insight.entities.priorityScore ?? '60',
          folder: insight.entities.folder ?? 'Wishlist'
        }
      };
    case 'media':
      return {
        id,
        source,
        title: 'Додати у watchlist',
        description: insight.extractedText,
        actionType: 'add_to_watchlist',
        group: 'Розваги',
        payload: {
          priorityScore: insight.entities.priorityScore ?? '60',
          list: insight.entities.list ?? 'Watchlist'
        }
      };
    case 'receipt':
      return {
        id,
        source,
        title: 'Зберегти витрату',
        description: insight.extractedText,
        actionType: 'track_expense',
        group: 'Фінанси',
        payload: {
          priorityScore: insight.entities.priorityScore ?? '60',
          category: insight.entities.expenseCategory ?? 'Expenses'
        }
      };
    case 'travel':
      return {
        id,
        source,
        title: 'Зберегти travel idea',
        description: insight.extractedText,
        actionType: 'save_trip_idea',
        group: 'Подорожі',
        payload: {
          priorityScore: insight.entities.priorityScore ?? '60',
          board: insight.entities.board ?? 'Travel'
        }
      };
    case 'idea':
      return {
        id,
        source,
        title: 'Зберегти ідею',
        description: insight.extractedText,
        actionType: 'capture_idea',
        group: 'Ідеї',
        payload: {
          priorityScore: insight.entities.priorityScore ?? '60',
          notebook: insight.entities.notebook ?? 'Ideas'
        }
      };
    default:
      return {
        id,
        source,
        title: 'Ручний розбір',
        description: insight.extractedText,
        actionType: 'manual_review',
        group: 'Невизначене',
        payload: {
          priorityScore: insight.entities.priorityScore ?? '40'
        }
      };
  }
}

function hasAny(text: string, markers: string[]): boolean {
  return markers.some((marker) => text.includes(marker));
}

function summarize(text: string, fallback: string): string {
  if (!text.trim()) {
    return fallback;
  }

  if (text.length <= 150) {
    return text;
  }

  return `${text.slice(0, 147)}...`;
}
