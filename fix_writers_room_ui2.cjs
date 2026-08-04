const fs = require('fs');
const path = './src/components/WritersRoomPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /if \(data\.success && data\.feedbacks\) \{/g,
  `if (data.success && data.feedbacks) {`
);

content = content.replace(
  /      \} catch \(e\) \{/g,
  `      } else if (data.error) {
        setConsensusSummary(data.error);
      }
    } catch (e: any) {
      setConsensusSummary('An error occurred: ' + e.message);`
);

fs.writeFileSync(path, content);
