const { Snowflake } = require('discord.js');

const util = {};

util.color = {
    blue: 0xadd8e6,
    red: 0xf04747,
    green: 0x90ee90,
    orange: 0xfaa61a,
};

util.links = {
    support: "https://discord.gg/Hh3W3y9VWK",
    invite:
      "#",
  };

util.userMentionToId = (mention) => {
    if (/^<@!?\d+>$/.test(mention)) {
        return /** @type {Snowflake|null} */ mention.match(/^<@!?(\d+)>$/)[1];
    }
    else if(/^\d+$/.test(mention)) {
        return mention;
    }
    else {
        return null;
    }
};

module.exports = util;
