# Super-Duper-Waffle

Super-Duper-Waffle is an awesome bot that can take over your WhatsApp for a while! Whether you’re busy, away, or just need a break, Super-Duper-Waffle is here to respond to your WhatsApp messages on your behalf.

## Features (Few Planned & Few Done)

- **Automated Responses**: The bot can send predefined or intelligent replies to incoming WhatsApp messages. (Done)
- **Customizable Settings**: Tailor the bot’s responses to different contacts or groups. (WIP)
- **Smart Response Logic**: Uses AI to craft replies based on the context of the conversation. (WIP)
- **Schedule Messages**: Plan responses for specific times or intervals. (WIP)
- **Privacy Protection**: Ensures your data stays safe and confidential. (WIP)

## Installation

To set up Super-Duper-Waffle, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/super-duper-waffle.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd super-duper-waffle
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Set up your environment variables:**

   Create a `.env` file in the root directory and add your Cloudflare credentials:

   ```env
   CFTOKEN=your_cfai_api_key
   CF_ACCID=000000000000
   ```

5. **Run the bot:**
    You'll be prompted to sign in on your first run
   ```bash
   npm start
   ```
   

## Usage

Once the bot is running, it will automatically start responding to incoming WhatsApp messages. You can customize the bot's behavior by editing the configuration file or through the in-app settings panel.

### Commands (WIP)

- **/start** - Activates the bot.
- **/stop** - Deactivates the bot.
- **/setmsg <message>** - Sets a custom auto-reply message.
- **/status** - Checks the bot’s current status.
