import { Zwietracht } from '../src';
import Button from '../src/button';
import * as dotenv from 'dotenv';

dotenv.config();

const zt = new Zwietracht(
  process.env.APPLICATION_ID!,
  process.env.BOT_TOKEN!,
  process.env.PUBLIC_KEY!
);

const pingReplyButton = new Button('Retry', 'retry-ping');
pingReplyButton.then((interaction, data) => {
  interaction.reply({
    content: `Pong v${data}`,
    components: [[pingReplyButton.toComponent((+data! + 1).toString())], []],
  });
});
zt.addComponent(pingReplyButton);

zt.addCommand({
  name: 'ping',
  description: 'Ping!',
  execute(interaction) {
    interaction.reply({
      content: 'Pong!',
      components: [[pingReplyButton.toComponent('2')]],
    });
  },
});

zt.registerCommands();

export default zt;
