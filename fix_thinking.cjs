const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const enhancedConfig = \{([\s\S]*?)\};/g,
  `const enhancedConfig = {
    ...config,
    temperature: config.temperature ? Math.max(config.temperature, 0.9) : 0.9,
  };`
);

content = content.replace(
  /for \(const model of modelsToTry\) \{/g,
  `for (const model of modelsToTry) {
    let finalConfig = { ...enhancedConfig };
    if (!model.includes('thinking')) {
      delete finalConfig.thinkingConfig;
    }`
);

content = content.replace(
  /config: enhancedConfig/g,
  `config: finalConfig`
);

fs.writeFileSync(path, content);
