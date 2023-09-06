# Zwietracht-JS

Zwietracht-JS is a JavaScript library that simplifies interaction with the Discord API for building and managing server-side Discord bots. It provides an intuitive and easy-to-use interface for creating and handling Discord interactions, such as commands and buttons. This readme will guide you through the basics of setting up and using Zwietracht-JS in your Discord bot project.

## Table of Contents

- [Zwietracht-JS](#zwietracht-js)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
    - [Creating a Zwietracht Instance](#creating-a-zwietracht-instance)
    - [Adding Commands](#adding-commands)
    - [Registering Commands](#registering-commands)
    - [Handling Interactions](#handling-interactions)
    - [Adding Buttons](#adding-buttons)
  - [Examples](#examples)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

You can install Zwietracht-JS via npm or similar package managers:

```bash
npm i github:Tomate0613/zwietracht-js
```

## Getting Started

1. Create a Discord bot on https://discord.com/developers/.
2. Set up your environment variables by creating a .env file and adding your application ID, bot token, and public key as follows:

```env
APPLICATION_ID=your_application_id
BOT_TOKEN=your_bot_token
PUBLIC_KEY=your_public_key
```

Make sure to replace `your_application_id`, `your_bot_token`, and `your_public_key` with your actual values.

## Usage

### Creating a Zwietracht Instance

To use Zwietracht-JS, you'll first need to create an instance of the `Zwietracht` class using your environment variables. Here's an example of how to do that:

```typescript
import { Zwietracht } from 'zwietracht';
import * as dotenv from 'dotenv';

dotenv.config();

const zt = new Zwietracht(
  process.env.APPLICATION_ID,
  process.env.BOT_TOKEN,
  process.env.PUBLIC_KEY
);
```

### Adding Commands

Zwietracht-JS allows you to easily add commands to your bot using the `addCommand` method. Here's an example of how to add a simple "ping" command:

```typescript
zt.addCommand({
  name: 'ping',
  description: 'Ping!',
  execute(interaction) {
    interaction.reply({
      content: 'Pong!',
    });
  },
});
```

### Registering Commands

After adding your commands, register them with Discord using the `registerCommands` method. This ensures your commands become visible in Discord. Remember to call this every time you make changes to your commands:

```typescript
zt.registerCommands();
```

### Handling Interactions

To make your commands usable, you must handle the interaction request in an API route. It is recommended to place the rest of your bot's code in a separate file and import it from there:
```typescript
import zt from '../bot/setup';

export default async function handler(
  req,
  res
) {
  zt.handleInteraction(
    req.body,
    req.headers['x-signature-ed25519'],
    req.headers['x-signature-timestamp'],
    JSON.stringify(req.body),
    (data) => res.status(200).send(data),
    (data) => res.status(401).send(data)
  );
}
```

Make sure to put your interaction url into the config of your discord app
![Screenshot of the corresponding field in the app config](res/interaction%20url.png)

### Adding Buttons

You can add buttons to your bot using the `Button` class. Buttons can be used to create interactive elements in your bot's messages. Here's an example of how to create a button and handle its interaction:

```typescript
import { Button } from 'zwietracht';

const counterButton = new Button('Add', 'counter-button');

counterButton.then((interaction, data) => {
  interaction.reply({
    content: `Counter: ${data}`,
    components: [[counterButton.toComponent((+data! + 1).toString())]],
  });
});

zt.addComponent(counterButton);

zt.addCommand({
  name: 'counter',
  description: 'A simple counter',
  execute(interaction) {
    interaction.reply({
      content: 'Counter: 1',
      components: [[counterButton.toComponent('2')]],
    });
  },
});
```

## Examples

For more examples and usage scenarios, please refer to [the examples](examples) directory.

## Contributing

If you're interested in contributing to Zwietracht-JS, please don't hesitate to submit a pull request. If you're unsure whether your idea aligns with the project, feel free to open an issue first.

## License

Zwietracht-JS is distributed under the MIT License. See [LICENSE](LICENSE) for more information.
