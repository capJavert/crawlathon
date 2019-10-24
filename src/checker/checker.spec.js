const chai = require('chai');
const checker = require('./checker');

const expect = chai.expect;

test('Returns valid check results', () => {
  const validResults = [
    'http://acrocat.com/AcroWiki/downloads/AcroWiki_demo.zip',
    'http://activate.imsisoft.com/gennedfreetrial.aspx?productpage=TCP18Pro',
    'http://ad-dl.appvv.com/disanfang_flashlight_1043/com.vflashlight.apk',
    'https://get.downloads32.net/20/192816/130756/MD5.dmg.zip',
    'https://get.downloads32.net/20/193069/132441/CrosswordPuzzleHelper.zip',
    'https://gigabyte-ga-p61-s3-b3-rev-1-1-easy-tune6-utility-for-intel.soft32.com/file-download/1158329/?nc=',
    'https://gigabyte-ga-p61-s3-b3-rev-1-1-intel-inf-driver.soft32.com/file-download/1135398/?nc=',
    'https://nohaunt.soft32.com/file-download/457666/?',
    'https://noho-tournament-manager.soft32.com/file-download/394232/?nc=',
    'https://the-mana-world.soft32.com/file-download/840855/?nc=',
    'https://the-mask-of-africa.soft32.com/file-download/269085/?',
  ]

  const foundResults = [
    'http://acrocat.com/AcroWiki/downloads/AcroWiki_demo.zip',
    'http://ad-dl.appvv.com/disanfang_flashlight_1043/com.vflashlight.apk',
    'https://get.downloads32.net/20/193069/132441/CrosswordPuzzleHelper.zip',
    'https://gigabyte-ga-p61-s3-b3-rev-1-1-easy-tune6-utility-for-intel.soft32.com/file-download/1158329/?nc=',
    'https://gigabyte-ga-p61-s3-b3-rev-1-1-intel-inf-driver.soft32.com/file-download/1135398/?nc=',
    'https://nohaunt.soft32.com/file-download/457666/?',
    'https://noho-tournament-manager.soft32.com/file-download/394232/?nc=',
    'https://the-mana-world.soft32.com/file-download/840855/?nc=',
    'https://the-story-of-dragons.soft32.com/file-download/303883/?nc='
  ]

  const result = checker.check(validResults, foundResults);

  const expectedMissing = [
    'http://activate.imsisoft.com/gennedfreetrial.aspx?productpage=TCP18Pro',
    'https://get.downloads32.net/20/192816/130756/MD5.dmg.zip',
    'https://the-mask-of-africa.soft32.com/file-download/269085/?'
  ]
  const expectedExtra = [
    'https://the-story-of-dragons.soft32.com/file-download/303883/?nc='
  ]

  expect(expectedMissing).to.eql(result.missing);
  expect(expectedExtra).to.eql(result.extra);
});

test('Returns valid report', () => {
  const foundResults = [
    'http://acrocat.com/AcroWiki/downloads/AcroWiki_demo.zip',
    'http://ad-dl.appvv.com/disanfang_flashlight_1043/com.vflashlight.apk',
    'https://get.downloads32.net/20/193069/132441/CrosswordPuzzleHelper.zip',
    'https://gigabyte-ga-p61-s3-b3-rev-1-1-easy-tune6-utility-for-intel.soft32.com/file-download/1158329/?nc=',
    'https://gigabyte-ga-p61-s3-b3-rev-1-1-intel-inf-driver.soft32.com/file-download/1135398/?nc=',
    'https://nohaunt.soft32.com/file-download/457666/?',
    'https://noho-tournament-manager.soft32.com/file-download/394232/?nc=',
    'https://the-mana-world.soft32.com/file-download/840855/?nc=',
    'https://the-story-of-dragons.soft32.com/file-download/303883/?nc='
  ]

  checker.report(foundResults);
})