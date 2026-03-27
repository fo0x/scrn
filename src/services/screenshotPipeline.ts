import * as Calendar from 'expo-calendar';
import * as MediaLibrary from 'expo-media-library';
import type { ScreenshotInsight, SmartAction } from '../types/domain';

interface ScreenshotAsset {
  id: string;
  filename?: string;
  uri: string;
}

export async function processLatestScreenshots(limit = 25): Promise<SmartAction[]> {
  const mediaPermission = await MediaLibrary.requestPermissionsAsync();
  if (!mediaPermission.granted) {
    throw new Error('Потрібен доступ до фото для аналізу скріншотів.');
  }

  const assets = await loadScreenshotAssets(limit);

  const calendarPermission = await Calendar.requestCalendarPermissionsAsync();
  const canWriteCalendar = calendarPermission.granted;

  const insights = await Promise.all(assets.map((asset) => detectScreenshotIntent(asset)));
  const actions = insights.map((insight, index) => toSmartAction(insight, index));

  if (!canWriteCalendar) {
    return actions.map((action) =>
      action.actionType === 'create_calendar_event'
        ? {
            ...action,
            description: `${action.description} (Дозвіл до календаря не видано — дія в черзі)`
          }
        : action
    );
  }

  return actions;
}

async function loadScreenshotAssets(limit: number): Promise<ScreenshotAsset[]> {
  const album = await MediaLibrary.getAlbumAsync('Screenshots');

  const page = await MediaLibrary.getAssetsAsync({
    mediaType: ['photo'],
    sortBy: [['creationTime', false]],
    first: limit,
    album
  });

  return page.assets.map((asset) => ({
    id: asset.id,
    filename: asset.filename,
    uri: asset.uri
  }));
}

async function detectScreenshotIntent(asset: ScreenshotAsset): Promise<ScreenshotInsight> {
  // Тут можна підключити OCR + мультимодальну LLM (наприклад GPT-4.1/4o vision) через API.
  // Для демо використовується швидка евристика по назві файлу.
  const marker = `${asset.filename ?? ''} ${asset.uri}`.toLowerCase();

  if (marker.includes('instagram') || marker.includes('twitter') || marker.includes('tiktok')) {
    return {
      type: 'social_post',
      confidence: 0.89,
      extractedText: 'Знайдений пост із соцмережі. Згенеровано текстову версію для чернетки.',
      entities: {
        network: marker.includes('instagram') ? 'Instagram' : 'Соцмережа'
      }
    };
  }

  if (marker.includes('meet') || marker.includes('zoom') || marker.includes('calendar')) {
    return {
      type: 'meeting',
      confidence: 0.82,
      extractedText: 'Нагадування про зустріч о 14:00 завтра.',
      entities: {
        title: 'Зустріч зі скріншота',
        time: '14:00'
      }
    };
  }

  if (marker.includes('outfit') || marker.includes('shop') || marker.includes('look')) {
    return {
      type: 'shopping',
      confidence: 0.78,
      extractedText: 'Образ/товар додано у бажані покупки.',
      entities: {
        folder: 'Wishlist / Fashion'
      }
    };
  }

  if (marker.includes('netflix') || marker.includes('spotify') || marker.includes('youtube')) {
    return {
      type: 'media',
      confidence: 0.77,
      extractedText: 'Контент додано до списку «Подивитись / Послухати».',
      entities: {
        list: 'Media Wishlist'
      }
    };
  }

  if (marker.includes('receipt') || marker.includes('invoice') || marker.includes('check')) {
    return {
      type: 'receipt',
      confidence: 0.75,
      extractedText: 'Чек знайдено. Суму можна зберегти у витрати.',
      entities: {
        category: 'Expenses'
      }
    };
  }

  if (marker.includes('flight') || marker.includes('airbnb') || marker.includes('hotel')) {
    return {
      type: 'travel',
      confidence: 0.71,
      extractedText: 'Тревел-ідея збережена в папку подорожей.',
      entities: {
        board: 'Travel Ideas'
      }
    };
  }

  return {
    type: 'unknown',
    confidence: 0.35,
    extractedText: 'Поки що неясний тип контенту. Потрібен ручний перегляд.',
    entities: {}
  };
}

function toSmartAction(insight: ScreenshotInsight, index: number): SmartAction {
  const id = `action-${index}-${Math.round(insight.confidence * 100)}`;

  switch (insight.type) {
    case 'social_post':
      return {
        id,
        title: 'Чернетка поста готова',
        description: insight.extractedText,
        actionType: 'draft_post',
        group: 'Контент',
        payload: {
          draftText:
            'Ось текстова версія поста зі скріншота. Можеш відредагувати і опублікувати у своїй соцмережі.'
        }
      };
    case 'meeting':
      return {
        id,
        title: 'Створити подію в календарі',
        description: insight.extractedText,
        actionType: 'create_calendar_event',
        group: 'Планування',
        payload: insight.entities
      };
    case 'shopping':
      return {
        id,
        title: 'Додано в бажані покупки',
        description: insight.extractedText,
        actionType: 'add_to_wishlist',
        group: 'Покупки',
        payload: insight.entities
      };
    case 'media':
      return {
        id,
        title: 'Додано в медіа wishlist',
        description: insight.extractedText,
        actionType: 'add_to_watchlist',
        group: 'Розваги',
        payload: insight.entities
      };
    case 'receipt':
      return {
        id,
        title: 'Зберегти витрату',
        description: insight.extractedText,
        actionType: 'track_expense',
        group: 'Фінанси',
        payload: insight.entities
      };
    case 'travel':
      return {
        id,
        title: 'Зберегти ідею подорожі',
        description: insight.extractedText,
        actionType: 'save_trip_idea',
        group: 'Подорожі',
        payload: insight.entities
      };
    default:
      return {
        id,
        title: 'Потрібний ручний перегляд',
        description: insight.extractedText,
        actionType: 'manual_review',
        group: 'Невизначене',
        payload: {}
      };
  }
}
