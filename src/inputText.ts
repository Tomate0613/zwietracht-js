import {
  type InputText as ApiTextInput,
  MessageComponentTypes,
  TextStyleTypes,
} from 'discord-interactions';

export default class TextInput {
  style = TextStyleTypes.SHORT;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;

  constructor(public label: string, public unique_id: string) {
    if (this.unique_id.includes(':')) {
      throw new Error(
        `: is a reserved character. Please change unique_id for ${this.unique_id}`
      );
    }
  }

  toComponent(extraData?: string): ApiTextInput {
    return {
      label: this.label,
      type: MessageComponentTypes.INPUT_TEXT,
      style: TextStyleTypes.SHORT | TextStyleTypes.PARAGRAPH,
      custom_id: extraData ? `${this.unique_id}:${extraData}` : this.unique_id,

      min_length: this.min_length,
      max_length: this.max_length,
      required: this.required,
      value: this.value,
      placeholder: this.placeholder,
    };
  }
}
