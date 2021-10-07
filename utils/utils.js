import fs from 'fs';
import axios from 'axios';
import * as variables from '../variables.js';
import { boosterRoleId, modoRoleId } from './variables.js';


const headers = {"Authorization": "Bearer " + TWITTER_TOKEN}


export function errorHandler(error, message=null) {
    console.log("-------------------------\nNew error:", message.content, '\n=>', error.message, "\n-------------------------");
    
    if (message !== null)
        message.react('❌');
}


export function capitalize(string) {
    return string.slice(0, 1).toUpperCase() + string.slice(1);
}


export function isBooster(member) {
    return member.roles.cache.has(boosterRoleId);
}


export function isCommand(msg) {
    return (message.content.toUpperCase().startsWith(variables.prefix1) ||
            message.content.toUpperCase().startsWith(variables.prefix2));
}



export function isModo(member) {
    return member.roles.cache.has(modoRoleId);
}


export function loadCache(path="cache.json") {
    return JSON.parse(
        fs.readFileSync("cache.json")
    );
}


export function saveCache(data) {
    let textData = JSON.stringify(data);
    fs.writeFile("cache.json", textData, (error) => {
        if (error) {
            console.log("ERROR WHILE DUMPING CACHE!");
        }
        else {
            console.log("Cache updated.")
        };
    });
}


export function updateWelcomeMessage(action, member) {
    // New Student needs to be welcomed
    client.channels.cache.get("893995887758540810").messages.fetch("894011083029889034")
        .then( (message) => {
            if (action === "append") {
                if (message.content === 'Nothing yet.') {
                    var edit = `${member}`;
                }
                else {
                    var edit = message.content + ` ${member}`;
                }

                message.edit(edit)
                    .catch(errorHandler, {content: "<error while updating welcome message>"});
            }
    

            // Not welcomed Student left the server
            else if (action === "remove") {
                message.edit(message.content.replaceAll(`${member}`, '').replaceAll('  ', ' '));
            }

            // All Students are welcomed, reset the queue
            else if (action === "reset") {
                message.edit('Nothing yet.');
            }
        })

        .catch(errorHandler, {content: "<error while updating welcome message>"});
}


export function hasStudentRole(member) {
    return member.roles.cache.has("779741939447627798");
}


export async function checkSocialMedias() {
    for (twitterAccount of variables.twitterAccounts) {
        await retrieveTweets(twitterAccount)
    }

    await retrieveVideos();
}


async function retrieveVideos() {
    let response, newVideoId;

    response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_TOKEN}` +
                               `&channelId=${cache.youtube.account}&part=snippet,id&order=date&maxResults=1`)

    response = response.data;
    if (!response.hasOwnProperty("items")) {
        return;
    }

    newVideoId = response.items[0].id.videoId;

    if (newVideoId != cache.youtube.lastVideoId) {
        // let channel = client.channels.cache.get("749770030954053632");
        let channel = client.channels.cache.get("870287403946999849");
        channel.send("Nouvelle vidéo de Sorbonne Université !\n" +
                     "https://www.youtube.com/watch?v=" + newVideoId);
    }
}


async function retrieveTweets(account) {
    let response, newTweets, newTweetId;
    response = await axios.get(`https://api.twitter.com/2/users/${cache.twitter[account].twitterAccount}/tweets`, {headers: headers});
    newTweets = response.data;
    newTweetId = newTweets.data[0].id;

    if (newTweetId != cache.twitter[account].lastTweetId) {
        let tweetData, media, date, user, text;

        response = await axios.get("https://api.twitter.com/2/tweets?ids=" + newTweetId + "&expansions=attachments.media_keys" +
                              "&media.fields=preview_image_url,type,url&tweet.fields=referenced_tweets,created_at", {headers: headers});
        tweetData = response.data;

        if (tweetData.data[0].hasOwnProperty("referenced_tweets") && (tweetData.data[0].referenced_tweets[0].type.includes("replied_to") ||
                                                                      tweetData.data[0].referenced_tweets[0].type.includes("retweeted"))) {
            return; // Do not share if the tweet is a reply/RT
        }

        if (tweetData.hasOwnProperty("includes")) {
            if (tweetData.includes.media[0].type == "photo") {
                media = tweetData.includes.media[0].url    
            }
            else if (tweetData.includes.media[0].type == "video") {
                tweetData.includes.media[0].preview_image_url;
            }
        }

        date = new Date(tweetData.data[0].created_at);
 
        response = await axios.get("https://api.twitter.com/2/users?ids=" + cache.twitter[account].twitterAccount, {headers: headers});
        user = response.data.data[0];

        text = newTweets.data[0].text.replaceAll('_', '\_') + `\n\n[__Ouvrir__](https://twitter.com/${user.username}/status/${new_tweet_id})`;

        // let channel = client.channels.cache.get("777304594195677225");
        let channel = client.channels.cache.get("870287403946999849");
        embed = new MessageEmbed()
            .setDescription(text)
            .setColor(1942002)
            .setAuthor(`${user.name} (@${user.username}) a tweeté :`, cache.twitter[account].iconUrl)
            .setImage(media)
            .setFooter(`Le ${date.toLocaleDateString("fr-FR", {day:"numeric", month:"long", year: "numeric", hour:"numeric", minute:"numeric"})}`,
                       "https://abs.twimg.com/icons/apple-touch-icon-192x192.png");

        channel.send({embeds = [embed]});
    }
}





