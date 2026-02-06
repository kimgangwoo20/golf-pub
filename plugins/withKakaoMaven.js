const { withProjectBuildGradle } = require('@expo/config-plugins');

const KAKAO_MAVEN = "maven { url 'https://devrepo.kakao.com/nexus/content/groups/public/' }";

function addKakaoMavenRepository(buildGradle) {
  // Check if Kakao Maven is already added
  if (buildGradle.includes('devrepo.kakao.com')) {
    return buildGradle;
  }

  // Find jitpack line and add Kakao Maven after it
  const jitpackLine = "maven { url 'https://www.jitpack.io' }";

  if (buildGradle.includes(jitpackLine)) {
    return buildGradle.replace(
      jitpackLine,
      `${jitpackLine}\n    ${KAKAO_MAVEN}`
    );
  }

  return buildGradle;
}

const withKakaoMaven = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      config.modResults.contents = addKakaoMavenRepository(config.modResults.contents);
    }
    return config;
  });
};

module.exports = withKakaoMaven;
