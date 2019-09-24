const Discord = module.require("discord.js");
const config = require("../config.json");
const mysql = module.require('mysql');
const con = mysql.createConnection(config.ossi_db);

module.exports.run = async (bot, message, args) => {

    // Get users OSSI uid 
    let sql = `SELECT uid FROM user WHERE discord_id = '${message.author.id}'`;

    con.query(sql, (error, result, fields) => {
        
        let uid = null;
        
        if (error) throw error;
        
        console.log("DiscordID löytyi " + result.length + " käyttäjälle ");

        //  If discord id is not found
        if (result.length != 0) {
            uid = result[0].uid;
        } else {
            
            // Inform user to set discord id
            let embed = new Discord.RichEmbed()
                    .setAuthor("Error!")
                    .setDescription("DiscordID ei ole asetettu OSSIssa!")

                bot.users.get(`${message.author.id}`).send(embed);
                return;
        }
        
        
        sql = `SELECT teemapaiva_ilmotus.*, teemapaiva_ilmotus.* 
              FROM teemapaiva_ilmotus 
              JOIN teemapaiva_ilmottautuminen 
              ON teemapaiva_ilmottautuminen.theme_id=teemapaiva_ilmotus.id 
              WHERE teemapaiva_ilmottautuminen.uid = ${uid} && millon_näkyy_op <= now() && millon_pois_op >= now()`;

        con.query(sql, (error, result, fields) => {
            if (error) throw error;

            console.log("Käyttäjälle " + uid + " löytyi " + result.length + " teemapäivää")

            //  If themedays are not found
            if (result.length == 0) {
                // Inform user to set discord id
                let embed = new Discord.RichEmbed()
                        .setAuthor("Teemapäivä ei löydy!")
                        .setDescription("Ilmeisesti et ole ilmoittautunut yhteenkään tulevaan teemapäivään.")

                    bot.users.get(`${message.author.id}`).send(embed);
                    return;
            }


            Object.keys(result).forEach(function (key) {
                var row = result[key];

                let embed = new Discord.RichEmbed()
                    .setAuthor(row.aihe)
                    .setDescription(row.id)
                    .setColor("#91234d")
                    .addField("Teemapäivän aihe", `${row.teemapäivä_aihe}`)
                    .addField("Pitäjä", row.pitäjä)
                    .addField("Missä", row.missä);

                bot.users.get(`${message.author.id}`).send(embed);

            });
        });
    });
}


module.exports.help = {
    name: "omatteemat"
}