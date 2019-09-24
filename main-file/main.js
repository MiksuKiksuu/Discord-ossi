const Discord = require('discord.js');
const bot = new Discord.Client({disableEveryone: true});
const config = require("../config.json");
const prefix = config.prefix;
const fs = require("fs");


const mysql = require('mysql');
const con = mysql.createConnection(config.ossi_db);


con.connect(function(error) {
  if (error) throw error;
  console.log("Connected!");
});

bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) =>{
  if(err) console.error(err);

  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0){
      console.log("Ei taida olla komentoja :3");
      return;
  }

  console.log(`loading ${jsfiles.length} Commands!`)

  jsfiles.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${i + 1}: ${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });
});

bot.on('ready', async (message) => {
  console.log(`Logged in as ${bot.user.tag}!`);
  try{
    let link = await bot.generateInvite(["ADMINISTRATOR"]);
    console.log(link);
    class new_themes{
      
    };

  } catch(e){
    console.log(e.stack);
  }
});

bot.on('message', async  message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return;

    let db = bot.commands.get(command.slice(prefix.length));
    if(db) db.run(bot, message, args);
});


bot.login(config.token);
