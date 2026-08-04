const fs = require('fs');
const path = './src/components/WritersRoomPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const \[overallHealthScore, setOverallHealthScore\] = useState<number>\(82\);/,
  "const [overallHealthScore, setOverallHealthScore] = useState<number>(0);"
);

content = content.replace(
  /const \[consensusSummary, setConsensusSummary\] = useState<string>\([\s\S]*?\);/,
  "const [consensusSummary, setConsensusSummary] = useState<string>('Run a consultation to receive an AI analysis.');"
);

const feedbacksRegex = /const \[feedbacks, setFeedbacks\] = useState<AgentFeedback\[\]>\(\[[\s\S]*?\]\);/;
content = content.replace(
  feedbacksRegex,
  "const [feedbacks, setFeedbacks] = useState<AgentFeedback[]>([]);"
);

fs.writeFileSync(path, content);
