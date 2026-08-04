const fs = require('fs');
const path = './src/components/WritersRoomPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `      if (data.success && data.feedbacks) {
        setFeedbacks(data.feedbacks);
        if (data.consensusSummary) setConsensusSummary(data.consensusSummary);
        if (data.overallHealthScore) setOverallHealthScore(data.overallHealthScore);
      }
    } catch (e) {`;

const newBlock = `      if (data.success && data.feedbacks) {
        setFeedbacks(data.feedbacks);
        if (data.consensusSummary) setConsensusSummary(data.consensusSummary);
        if (data.overallHealthScore) setOverallHealthScore(data.overallHealthScore);
      } else {
        setConsensusSummary(data.error || "Failed to generate AI consultation.");
      }
    } catch (e: any) {`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync(path, content);
