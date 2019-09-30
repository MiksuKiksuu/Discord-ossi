const Discord = require('discord.js');
const bot = new Discord.Client({disableEveryone: true});
const config = require("./config.json");
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
    //Hakee uusia teemapäiviä
    setInterval(function () {
      console.log("Haettu uusi teemapäivä");
      let sql = `SELECT * FROM teemapaiva_ilmotus WHERE millon_näkyy_op = CURRENT_DATE()`;
      let query = con.query(sql, (error, results, fields) => {
          if (error) throw error;
          Object.keys(results).forEach(function (key) {
              var row = results[key];

              let embed = new Discord.RichEmbed()

              .setTitle("testi")
              // .setURL('https://ossi.esedu.fi/theme_session/details/',`${row.id}`)
              .setAuthor(row.aihe)
              .setDescription('@everyone Uusi teemapäivä!!!')
              // .setAuthor(' ', 'https://ossi.esedu.fi/assets/images/ossi-yay.png', 'https://discord.js.org')
              .setThumbnail('https://ossi.esedu.fi/assets/images/ossi-yay.png')
              .setColor("#91234d")
              .addField("Teemapäivän aihe", row.aihe)
              .addField("Mitäjä", row.pitäjä)
              .addField("Missä", row.missä)
              .addField("Millon pidetään", row.millon_pidetään.toLocaleDateString())
              .addField("Ilmottautuminen loppuu", row.millon_pois_op.toLocaleDateString())
              .setTimestamp();

              message.channel.send(embed);


          });
      });



  }, 10000);// 86400000 (24h ms)
//loppuu tähän
//hakee tulevia teemapäiviä
  setInterval(function () {
    console.log("Hakee Tulevia Teemapäiviä");
    let sql = `SELECT teemapaiva_ilmotus.*, teemapaiva_ilmottautuminen.*, user.*
    FROM teemapaiva_ilmotus 
        JOIN teemapaiva_ilmottautuminen
            ON teemapaiva_ilmottautuminen.theme_id=teemapaiva_ilmotus.id
                JOIN user
                    ON teemapaiva_ilmottautuminen.uid=user.uid
                        WHERE millon_pidetään >= NOW() + INTERVAL 2 DAY`;
    let query = con.query(sql, (error, results, fields) => {
        if (error) throw error;
        Object.keys(results).forEach(function (key) {
            var row = results[key];
            console.log(row);

            var d = row.millon_pidetään;
            var n = d.toLocaleDateString();
            console.log(n);

            let embed = new Discord.RichEmbed()
            .setTitle("2pv päästä on teemapäivä")
            // .setURL('https://ossi.esedu.fi/theme_session/details/',`${row.id}`)
            .setAuthor(row.aihe)
            .setDescription('')
            // .setAuthor(' ', 'https://ossi.esedu.fi/assets/images/ossi-yay.png', 'https://discord.js.org')
            .setThumbnail('https://ossi.esedu.fi/assets/images/ossi-yay.png')
            .setColor("#91234d")
            .addField("Teemapäivän aihe", row.aihe)
            .addField("Mitäjä", row.pitäjä)
            .addField("Missä", row.missä)
            .addField("Millon pidetään", row.millon_pidetään.toLocaleDateString())
            .setTimestamp();

            bot.users.get(row.discord_id).send(embed);
        });
    });

  }, 10000);// 86400000 (24h ms)
  //Loppuu tässä
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

    let commands = bot.commands.get(command.slice(prefix.length));
    if(commands) commands.run(bot, message, args);
});


bot.login(config.token);