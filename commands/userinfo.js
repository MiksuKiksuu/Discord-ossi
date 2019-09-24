const Discord = module.require("discord.js");

module.exports.run = async (bot, message, args) => {
    let embed = new Discord.RichEmbed()
        .setAuthor(message.author.tag)
        .setDescription("HEHEHEH")
        .setColor("#91234d")
        .addField("Koko nimi", `${message.author.username}#${message.author.discriminator}`)
        .addField("ID", message.author.id);

    bot.users.get(`${message.author.id}`).send(embed);
    // message.channel.sendEmbed(embed);
}

module.exports.help = {
    name: "userinfo"
}