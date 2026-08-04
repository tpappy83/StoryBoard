const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace offscreen simulator fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("Offscreen simulator Gemini service busy; generating local tick\."\);[\s\S]*?parsed = \{[\s\S]*?\};\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Offscreen simulator Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace character synthesis fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("Character synthesis Gemini service busy; utilizing deterministic synthesis\."\);[\s\S]*?\]\s*\}\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Character synthesis Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace memory recall fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("Memory recall Gemini service busy; running local semantic match\."\);[\s\S]*?contradictionWarnings: \[\]\s*\}\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Memory recall Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace writers-room apply fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("Writers room apply fallback:", err\.message\);[\s\S]*?summaryOfChanges = `Appended directive beat: \$\{directive\}`;?\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Writers room apply Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace intersection analysis fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("Intersection analysis Gemini service busy; generating local collisions\."\);[\s\S]*?recommendedPrompt: `Draft a scene where \$\{charIds\.join\(' and '\)\} unexpectedly collide at the \$\{sharedLocs\[0\] || 'hub'\}\.`\s*\}\s*\]\s*\};\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Intersection analysis Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace state engine fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("State Engine simulation Gemini busy; fallback to local simulation engine\."\);[\s\S]*?plotThreadUpdates: \[\]\s*\};\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'State Engine simulation Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace detect setups fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("Detect setups Gemini error \/ fallback:", err\.message\);[\s\S]*?introducedBy: characters\.length \? \[characters\[0\]\.name\] : \["Unknown"\]\s*\}\s*\];\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Detect setups Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace suggest payoffs fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("Suggest payoffs Gemini error \/ fallback:", err\.message\);[\s\S]*?consequences: \["Distrust sewn", "New lead found", "False hope shattered"\]\s*\}\s*\];\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Suggest payoffs Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace multi-pass revision fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.error\("Multi-pass revision pipeline error:", err\.message\);[\s\S]*?\]\s*\}\);\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Multi-pass revision Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace plot evolution fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*const errStr = String\(err\?\.message \|\| err\);[\s\S]*?branches\s*\}\);\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Plot evolution Gemini failed: ' + err.message });\n      return;\n    }"
);

// Replace plot evolution parsing fallback
content = content.replace(
  /if \(\!branches\) \{\s*branches = \{[\s\S]*?\}\s*\}/,
  "if (!branches) {\n        res.status(500).json({ success: false, error: 'Plot evolution parsing failed.' });\n        return;\n      }"
);


// Replace validate continuity fallback
content = content.replace(
  /\} catch \(err: any\) \{\s*console\.log\("Continuity audit Gemini service busy; running local deterministic audit engine\."\);[\s\S]*?violationsFound: newFoundViolations\s*\};\s*\}/,
  "} catch (err: any) {\n      res.status(500).json({ success: false, error: 'Continuity audit Gemini failed: ' + err.message });\n      return;\n    }"
);


fs.writeFileSync(path, content);
console.log('Fallbacks replaced.');
