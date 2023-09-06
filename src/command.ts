import { type SharedNameAndDescription } from '.';
import {
  type ApplicationCommandType,
  type ApplicationCommandOption,
  ApplicationCommandOptionType,
} from './api';
import { type CommandInteractionRequest } from './interaction';

type CommandArgument = StringCommandArgument;

type ApplicationCommandOptionBase = SharedNameAndDescription &
  CommandChildBase & {
    required: boolean;
  };

type StringCommandArgument = ApplicationCommandOptionBase & {
  type: 'string';

  max_length?: number;
  min_length?: number;
};

type CommandNode = SharedNameAndDescription;

type CommandChildBase = {
  subCommands?: Command[];
  args?: CommandArgument[];

  execute?: (interaction: CommandInteractionRequest, ...args: any) => void;
};

export type Command = CommandNode & CommandChildBase;

const CHAT_INPUT_COMMAND_TYPE = 1;

export type ParsedCommand = {
  options?: ApplicationCommandOption[];
  default_member_permissions?: string;
  dm_permission?: boolean;
  default_permission?: boolean;
  type?: ApplicationCommandType;
  nsfw?: boolean;
} & SharedNameAndDescription;

export function parseCommand(command: Command): ParsedCommand {
  return {
    name: command.name,
    description: command.description,
    type: CHAT_INPUT_COMMAND_TYPE,
    name_localizations: command.name_localizations,
    description_localizations: command.description_localizations,
    options: parseOptions(command, 0).concat(parseArgs(command)),
  };
}

export function parseOptions(
  command: Command,
  layer: number
): ApplicationCommandOption[] {
  return parseSubCommands(command, layer).concat(parseArgs(command));
}

const parseSubCommands = (
  { subCommands, execute }: Command,
  layer: number
): ApplicationCommandOption[] => {
  if (!subCommands) return [];

  return subCommands.map((child) => {
    const options = parseOptions(child, layer + 1);

    if (layer > 2) throw new Error('Maximal sub command nesting is 2');

    if (execute) {
      throw new Error('Using subcommands will make your base command unusable');
    }

    if (!child.execute && !child.subCommands) {
      throw new Error('Child command has no execute');
    }

    return {
      name: child.name,
      nameLocalizations: child.description_localizations,
      description: child.description,
      descriptionLocalizations: child.description_localizations,
      options,
      type: child.execute
        ? ApplicationCommandOptionType.SUB_COMMAND
        : ApplicationCommandOptionType.SUB_COMMAND_GROUP,
    };
  });
};

const parseArgs = ({
  args,
  subCommands,
  execute,
}: Command): ApplicationCommandOption[] => {
  if (!args) return [];

  if (subCommands) {
    throw new Error('Using subcommands will make your base command unusable');
  }

  if (!execute && args) {
    throw new Error('Command has args but does not execute anything');
  }

  return args.map((arg) => {
    return {
      name: arg.name,
      name_localizations: arg.description_localizations,
      description: arg.description,
      description_localizations: arg.description_localizations,
      required: arg.required,
      type: ApplicationCommandOptionType.STRING,
    };
  });
};
