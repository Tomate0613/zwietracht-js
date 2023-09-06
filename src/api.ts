import { type InteractionType } from 'discord-api-types/payloads';
import { type Locale, type LocalizationMap } from '.';

// #region Requests
export type InteractionRequest = {
  /** ID of the application this interaction is for */
  application_id: string;
  /** Type of interaction */
  type: InteractionType;
  /** Interaction data payload */
  data?: any;
  /** Guild that the interaction was sent from */
  guild_id?: string;
  /** Channel that the interaction was sent from */
  channel_id?: string;
  /** Guild member data for the invoking user, including permissions */
  member?: any;
  /** User object for the invoking user, if invoked in a DM */
  user?: any;
  /** Continuation token for responding to the interaction */
  token: string;
  /** Read-only property, always 1 */
  readonly version: 1;
  /** For components, the message they were attached to */
  message?: any;
  /** Bitwise set of permissions the app or bot has within the channel the interaction was sent from */
  app_permissions?: string;
  /** Selected language of the invoking user */
  locale?: Locale;
  /** Guild's preferred locale, if invoked in a guild */
  guild_locale?: Locale;
};

export const enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  /** Any integer between -2^53 and 2^53 */
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  /** Includes all channel types + categories */
  CHANNEL = 7,
  ROLE = 8,
  /** Includes users and roles */
  MENTIONABLE = 9,
  /** Any double between -2^53 and 2^53 */
  NUMBER = 10,
  /** attachment object */
  ATTACHMENT = 11,
}

export const enum ApplicationCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3,
}

export type ApplicationCommandOption = {
  name: string;
  name_localizations?: LocalizationMap;
  description: string;
  description_localizations?: LocalizationMap;
  required?: boolean;
  autocomplete?: never;
};
// #endregion

// #region Responses
export type CommandInteractionResponse = {
  type: number;
  data?: any;
};
// #endregion
