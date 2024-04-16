import {
  type Button,
  type ChannelSelect,
  type InputText,
  type MentionableSelect,
  type RoleSelect,
  type StringSelect,
  type UserSelect,
} from 'discord-interactions';
import { type InteractionRequest } from './api';
import {
  type ComponentType,
  type InteractionType,
} from 'discord-api-types/v10';

export type CommandInteractionRequest = {
  type: InteractionType.ApplicationCommand;
  data: {
    /** the ID of the invoked command */
    id: number;
    /** the name of the invoked command */
    name: string;
    /** the type of the invoked command */
    type: number;
    /** resolved data converted users + roles + channels + attachments */
    resolved?: any; // TODO
    /** array of application command interaction data option the params + values from the user */
    options?: any[]; // TODO
    /** the id of the guild the command is registered to */
    guild_id?: string;
    /** id of the user or message targeted by a user or message command */
    target_id?: string;
  };

  reply: (response: MessageInteractionResponse) => void;
} & InteractionRequest;

export type MessageComponentInteractionRequest = {
  type: InteractionType.MessageComponent;
  data: {
    component_type: ComponentType;
    values?: string[];
  };

  reply: (response: MessageInteractionResponse) => void;
} & InteractionRequest;

export type ActionRow = Button[] | [SelectComponent];

export type ApiComponent =
  | ActionRow
  | Button
  | InputText
  | StringSelect
  | UserSelect
  | RoleSelect
  | MentionableSelect
  | ChannelSelect;

export type SelectComponent =
  | StringSelect
  | UserSelect
  | RoleSelect
  | MentionableSelect
  | ChannelSelect;

export type MessageInteractionResponse = {
  tts?: boolean;
  content?: string;
  embeds?: any;
  allowed_mentions?: any;
  flags?: number;
  attachments?: any[];

  components?: ActionRow[];
};

export type MessageComponent = {
  unique_id: string;
  execute?: (
    interaction: MessageComponentInteractionRequest,
    extraData?: string
  ) => void;
};

export type MessageComponentInteractionHandler = (
  interaction: MessageComponentInteractionRequest,
  extraData?: string
) => void;
