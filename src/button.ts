import {
  type Button as ApiButton,
  ButtonStyleTypes,
  type EmojiInfo,
  MessageComponentTypes,
} from 'discord-interactions';
import { type MessageComponentInteractionHandler } from './interaction';

type Emoji = Pick<EmojiInfo, 'id' | 'name' | 'animated'>;

export default class Button {
  static type = MessageComponentTypes.BUTTON;

  style = ButtonStyleTypes.PRIMARY;
  disabled?: boolean;
  emoji?: Emoji;
  url?: string;
  execute?: MessageComponentInteractionHandler;

  constructor(public label: string, public unique_id: string) {
    if (this.unique_id.includes(':')) {
      throw new Error(
        `: is a reserved character. Please change unique_id for ${this.unique_id}`
      );
    }
  }

  then(fn: MessageComponentInteractionHandler) {
    this.execute = fn;
  }

  toComponent(extraData?: string): ApiButton {
    return {
      label: this.label,
      type: (this.constructor as any).type,
      style: this.style,

      custom_id:
        extraData !== undefined
          ? `${this.unique_id}:${extraData}`
          : this.unique_id,
      disabled: this.disabled,
      emoji: this.emoji,
      url: this.url,
    };
  }
}
