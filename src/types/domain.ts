export type ScreenshotType =
  | 'social_post'
  | 'meeting'
  | 'shopping'
  | 'media'
  | 'receipt'
  | 'travel'
  | 'unknown';

export type SmartActionType =
  | 'draft_post'
  | 'create_calendar_event'
  | 'add_to_wishlist'
  | 'add_to_watchlist'
  | 'track_expense'
  | 'save_trip_idea'
  | 'manual_review';

export interface ScreenshotInsight {
  type: ScreenshotType;
  confidence: number;
  extractedText: string;
  entities: Record<string, string>;
}

export interface SmartAction {
  id: string;
  title: string;
  description: string;
  actionType: SmartActionType;
  group: string;
  payload: Record<string, string>;
}
