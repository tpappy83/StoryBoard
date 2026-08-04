const fs = require('fs');
const path = './src/components/WritersRoomPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `    } catch (e: any) {
      console.error('Writers room AI failed:', e);
    } finally {`;

const newBlock = `    } catch (e: any) {
      console.error('Writers room AI failed:', e);
      setConsensusSummary('An error occurred: ' + e.message);
    } finally {`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync(path, content);
