import { Client } from 'discord.js';
import { Command } from './Commands';
const { readdir } = require('fs');

export class MyClient extends Client {
  constructor() {
    super();

    this.loadCommands();
    this.loadEvents();
  }

  public commands = new Map<string, Command>();

  private loadCommands(): void {
    readdir(__dirname + '/Commands', async (err: string, files: any) => {
      if (err) return console.log(err);

      for (const cmd of files) {
        if (cmd === 'index.ts' || cmd === 'index.js') continue;
        const command = new (await import(`${__dirname}/Commands/${cmd}`)).default();
        if (!command) continue;

        this.commands.set(command.name, command);

        for (const name of command.alias) {
          this.commands.set(name, command);
        }
      }
    });
  }

  private loadEvents(): void {
    readdir(__dirname + '/Events', async (err: string, files: any) => {
      if (err) return console.log(err);
      for (const evt of files) {
        if (!evt.includes('.ts') && !evt.includes('.js')) continue;
        await import(`${__dirname}/Events/${evt}`);
      }
    });
  }
}
