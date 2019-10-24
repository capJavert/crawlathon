const chai = require('chai');
const robot = require('../robots/checkAllowedRobots');

const expect = chai.expect;

test('filehippo test', async () => {
  const validResults = [
    'https://filehippo.com/download_magix-sound-forge-pro/post_download/',
    'https://filehippo.com/download_easy_wifi/post_download/',
    'https://filehippo.com/download_solarwinds-network-configuration-manager/post_download/',
    'https://filehippo.com/download_checkmail/post_download/',
    'https://filehippo.com/download_mirc/post_download/',
    'https://filehippo.com/download_adaware-ad-block/post_download/',
    'https://filehippo.com/download_plagiarism_checkerx/post_download/',
    'https://filehippo.com/download_integrated_raid_module_rms25pb080_driver_windows_server_2008_r2_6.600.23.00_r2/post_download/',
  ]

  const invalidResults = [
    'https://filehippo.com/download_asmobile_as96fm945gm1_verified_by_driver_windows_xp_home_edition_v6.14.10.4764/user_vote/post_download/',
    'https://filehippo.com/download_malwarebytes_3/post_download&rct',
    'https://filehippo.com/download_liferay_portal/post_download/1001908/nestoda&vedijosnesto',
    'https://filehippo.com/download_virto_commerce/post_download/bilosto&usg',
    'https://filehippo.com/download_wintousb/post_download/blablablanekitest&ie&sa',
    'https://filehippo.com/download_kmeleon/post_download&rct',
    'https://filehippo.com/download_asmobile_as62fm945gm1_verified_by_driver_windows_xp_media_center_edition_v5.10.01.4159/post_download&rct',
  ]


  const result1 = validResults.every(Promise.all(async (url)=>{
    return await robot.checkAllowedRobots(url)
  }))
  expect(result1).to.eql(true);

  const result2 = invalidResults.every(Promise.all(async (url)=>{
    return !(await robot.checkAllowedRobots(url))
  }))
  expect(result2).to.eql(true);

});
