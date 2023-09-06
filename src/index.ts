import {
  type CommandInteractionResponse,
  type InteractionRequest,
} from './api';
import { type Command, parseCommand } from './command';
import fetch from 'node-fetch';
import {
  type APIMessageComponentInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/payloads';
import { MessageComponentTypes, verifyKey } from 'discord-interactions';
import {
  type CommandInteractionRequest,
  type MessageComponent,
  type MessageInteractionResponse,
} from './interaction';

export * from './button';
export * from './select';

export type Locale =
  | 'id'
  | 'en-US'
  | 'en-GB'
  | 'bg'
  | 'zh-CN'
  | 'zh-TW'
  | 'hr'
  | 'cs'
  | 'da'
  | 'nl'
  | 'fi'
  | 'fr'
  | 'de'
  | 'el'
  | 'hi'
  | 'hu'
  | 'it'
  | 'ja'
  | 'ko'
  | 'lt'
  | 'no'
  | 'pl'
  | 'pt-BR'
  | 'ro'
  | 'ru'
  | 'es-ES'
  | 'sv-SE'
  | 'th'
  | 'tr'
  | 'uk'
  | 'vi';

export type LocalizationMap = Partial<Record<Locale, string | null>>;

export type SharedNameAndDescription = {
  name: string;
  name_localizations?: LocalizationMap;
  description: string;
  description_localizations?: LocalizationMap;
};

const baseUrl = 'https://discord.com/api/';

export class Zwietracht {
  private readonly commands = new Map<string, Command>();
  private readonly components = new Map<string, MessageComponent>();

  constructor(
    public readonly applicationId: string,
    private readonly botToken: string,
    private readonly publicKey: string
  ) {}

  addCommand(command: Command) {
    this.commands.set(command.name, command);
  }

  addComponent(component: MessageComponent) {
    this.components.set(component.unique_id, component);
  }

  async registerCommands() {
    const parsedCommands = [];

    for (const command of this.commands.values()) {
      parsedCommands.push(parseCommand(command));
    }

    const response = await fetch(
      `${baseUrl}applications/${this.applicationId}/commands`,
      {
        method: 'PUT',
        body: JSON.stringify(parsedCommands),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${this.botToken}`,
        },
      }
    );

    return response;
  }

  handleInteraction(
    interaction: InteractionRequest,
    signature: string,
    timestamp: string,
    body: string,
    send200Response: (data: CommandInteractionResponse) => void,
    send401Response: (data: any) => void
  ) {
    if (!verifyKey(body, signature, timestamp, this.publicKey)) {
      send401Response({
        error: 'Request is not valid',
      });
      return;
    }

    if (interaction.type === InteractionType.Ping) {
      send200Response({
        type: 1,
      });
      return;
    }

    if (interaction.type === InteractionType.MessageComponent) {
      const messageComponentInteraction =
        interaction as any as APIMessageComponentInteraction;

      const [id, data] = messageComponentInteraction.data.custom_id.split(':');
      const component = this.components.get(id);

      if (!component) return;

      if (
        (component.constructor as any).type !==
        messageComponentInteraction.data.component_type
      ) {
        throw new Error('Component type mismatch');
      }

      if (component.execute) {
        component.execute(
          {
            ...messageComponentInteraction,
            reply(data) {
              const newData: any = data;

              newData.components = data.components?.map((component) => {
                if (Array.isArray(component)) {
                  return {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: component,
                  };
                }

                return component;
              });

              send200Response({
                type: InteractionResponseType.UpdateMessage,
                data: newData,
              });
            },
          },
          data
        );
      }
    }

    if (interaction.type !== InteractionType.ApplicationCommand) return; // TODO

    const commandInteraction: CommandInteractionRequest = {
      data: {},
      ...interaction,
      type: InteractionType.ApplicationCommand,
      reply: (data: MessageInteractionResponse) => {
        const newData: any = data;

        newData.components = data.components?.map((component) => {
          if (Array.isArray(component)) {
            return {
              type: MessageComponentTypes.ACTION_ROW,
              components: component,
            };
          }

          return component;
        });

        send200Response({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: newData,
        });
      },
    };

    const command = this.commands.get(commandInteraction.data.name);

    if (!command) {
      console.error(
        'Unknown command: ' +
          commandInteraction.data.name +
          '!\n' +
          JSON.stringify(commandInteraction.data)
      );

      return;
    }

    try {
      executeCommand(command, commandInteraction);
    } catch (e) {
      console.error(e);

      send200Response({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: 'Something went wrong', ephemeral: true },
      });
    }
  }
}

const executeCommand = (
  command: Command,
  interactionRequest: CommandInteractionRequest
) => {
  let currentCommand = command;
  let currentData = interactionRequest.data;
  const args = [];

  while (
    currentCommand.subCommands ||
    currentCommand.execute ||
    currentData.options
  ) {
    if (currentCommand.execute) {
      currentCommand.execute(interactionRequest, ...args);
      return;
    }

    const next = currentCommand.subCommands?.find(
      (subCommand) => subCommand.name === currentData.name
    );

    if (!next) break;

    currentCommand = next;

    currentData = currentData.options[0];
    args.push(currentData);
  }

  throw new Error(
    'Mismatch in command structure. Please check the documentation'
  );
};
