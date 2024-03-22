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
import { type LocalizationMap } from 'discord-api-types/v10';

export { default as Button } from './button';
export * from './select';

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

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const commandInteraction = {
      ...interaction,
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
    } as CommandInteractionRequest;

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

function executeCommand(
  command: Command,
  interactionRequest: CommandInteractionRequest
) {
  let currentCommand = command;
  let currentOptions = interactionRequest.data.options;

  while (currentCommand) {
    if (currentCommand.execute) {
      let args = [];
      if (currentOptions) {
        args = currentOptions.map((option) => option.value);
      }

      currentCommand.execute(interactionRequest, ...args);
      return;
    }

    if (!currentCommand.subCommands) {
      throw new Error('No subcommand or execute');
    }

    const option = currentOptions?.[0];
    const subCommand = currentCommand.subCommands.find(function (element) {
      return element.name === option.name;
    });

    if (!subCommand) {
      throw new Error('Malformed command');
    }

    currentCommand = subCommand;
    currentOptions = option.options;
  }
}
