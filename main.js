import { Intents, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Discord from 'discord.js';
import dotenv from 'dotenv';
import * as events from './events/events.js';
import * as moderation from './commands/moderation.js';
import * as variables from './utils/variables.js';
import * as misc from './commands/misc.js';
import { help } from './commands/help.js';

dotenv.config();

const PREFIX = variables.prefix;

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_BANS
    ]
}); 


// ---------- Events ----------
client.on("ready", () => {
    events.onReady(client);
});


client.on("guildMemberAdd", (member) => {
    events.guildMemberAdd(client, member);
})


client.on("guildMemberRemove", (member) => {
    events.guildMemberRemove(client, member);
})
// ----------------------------


// -------- On message --------
client.on("messageCreate", async (message) => {
    if (message.author.bot)
        return;  // Do not react to self or other bots

    const words = message.content.split(' ');
    const command = words[1];


    // ------- Help --------
    if (command === "help") {
        await help(message, words.slice(2).join());
    }
    // ---------------------

    // if (command === "temp") {
    //     let row = new MessageActionRow()
    //         .addComponents(
    //             new MessageButton()
    //                 .setCustomId("roleSelectEtudiant")
    //                 .setEmoji("<:logosu:889983398788079617>")
    //                 .setLabel("Étudiant")
    //                 .setStyle(3908957)
    //         );

    //     message.channel.send({ content: "OwO", components: [row] });
    // }


    // ---- Moderation -----
    if (command === "destroy") {
        moderation.destroyClient(message, client);
    }

    if (command === "kick") {
        await moderation.kick(message, words.slice(3).join(' '))
    }

    if (command === "ban") {
        await moderation.ban(message, words.slice(3).join(' '))
    }

    // ---------------------


    // --- Miscellaneous ---
    if (command === "ping") {
        await misc.ping(message);
    }

    if (command === "8ball") {
        await misc.eightBall(message, words.slice(2));
    }

    if (command === "wiki") {
        await misc.wiki(message, words.slice(2));
    }

    if (command === "couleur" || command === "color") {
        await misc.couleur(message, words.slice(2))
    }

    if (command === "sendinfo" || command === "send_info") {
        await misc.sendInfo(message);
    }
    // ---------------------

    await moderation.filterMessage(message);
});
// ---------------------------


client.login(process.env.DISCORD_TOKEN);
