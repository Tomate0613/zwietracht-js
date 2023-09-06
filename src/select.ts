import {
  type ChannelTypes,
  MessageComponentTypes,
  type SelectComponentType,
  type SelectMenu,
  type StringSelectOption,
  type ChannelSelect as ApiChannelSelect,
  type StringSelect as ApiTextSelect,
} from 'discord-interactions';
import { type MessageComponentInteractionHandler } from './interaction';

abstract class Select {
  static type: MessageComponentTypes;

  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;

  execute?: MessageComponentInteractionHandler;

  constructor(public label: string, public unique_id: string) {
    if (this.unique_id.includes(':')) {
      throw new Error(
        `: is a reserved character. Please change unique_id for ${this.unique_id}`
      );
    }
  }

  protected toBaseComponents<T extends SelectComponentType>(
    extraData?: string
  ): Omit<SelectMenu<T>, 'channel_types' | 'options'> {
    return {
      type: (this.constructor as any).type,
      custom_id: extraData ? `${this.unique_id}:${extraData}` : this.unique_id,

      placeholder: this.placeholder,
      min_values: this.min_values,
      max_values: this.max_values,
      disabled: this.disabled,
    };
  }

  then(fn: MessageComponentInteractionHandler) {
    this.execute = fn;
  }
}

export class StringSelect<
  T extends StringSelectOption[] = StringSelectOption[]
> extends Select {
  static type = MessageComponentTypes.STRING_SELECT;

  toComponent(options: T, extraData?: string): ApiTextSelect {
    const base: any = this.toBaseComponents(extraData);
    base.options = options;

    return base;
  }
}

export class UserSelect extends Select {
  static type = MessageComponentTypes.USER_SELECT;
  toComponent = this.toBaseComponents<MessageComponentTypes.USER_SELECT>;
}

export class RoleSelect extends Select {
  static type = MessageComponentTypes.ROLE_SELECT;
  toComponent = this.toBaseComponents<MessageComponentTypes.ROLE_SELECT>;
}

export class MentionableSelect extends Select {
  static type = MessageComponentTypes.MENTIONABLE_SELECT;
  toComponent = this.toBaseComponents<MessageComponentTypes.MENTIONABLE_SELECT>;
}

export class ChannelSelect<
  T extends ChannelTypes[] = ChannelTypes[]
> extends Select {
  static type = MessageComponentTypes.CHANNEL_SELECT;

  toComponent(channelTypes?: T, extraData?: string): ApiChannelSelect {
    const base: any = this.toBaseComponents(extraData);
    base.channel_types = channelTypes;

    return base;
  }
}
