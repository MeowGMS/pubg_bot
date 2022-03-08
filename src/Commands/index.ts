import { Message } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';

export abstract class Command {
  public readonly name: string;
  public readonly alias: string[];
  public readonly clearMsgTimeout?: number;

  public readonly run: (message: Message, args: string[], errors: CommandsErrors) => void;
}
