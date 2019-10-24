
const rp = require('request-promise');
const { parse, format } = require('url');
const robotsParser = require('robots-parser');
const { getTextFile } = require('../src/fetch')
const deviceProfiles = require('../src/deviceProfiles')

// const url = process.argv[2];
// if (!url) {
//     throw "Please provide URL as a first argument";
// }
// checkAllowedRobots(url).then(console.log).catch(console.error);;

async function checkAllowedRobots(url) {
  const robot = await getRobot(url);
  const userAgent = await getUserAgent();
  return robot.isAllowed(url, userAgent);
}

async function getRobot(url) {
  const robotsUrl = getRobotsUrl(url);
  const robotsTxt = await getTextFile(robotsUrl)
  if (!robotsTxt) {
    try {
      robotsTxt = await rp(robotsUrl);
    } catch (error) {
      extend(error, { url });
      robotsTxt = EMPTY_TXT;
    }
  }
  return robotsParser(robotsUrl, robotsTxt);
}

function getUserAgent() {
  return deviceProfiles.default.userAgent;
}

function getRobotsUrl(url) {
  const { protocol, host } = parse(url);
  return format({ protocol, host, pathname: '/robots.txt' });
}

module.exports = { checkAllowedRobots }
