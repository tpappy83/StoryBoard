import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function testModel(model: string) {
  try {
    const res = await ai.models.generateContent({
      model,
      contents: "Hello"
    });
    console.log(`${model}: SUCCESS`);
  } catch (e: any) {
    console.log(`${model}: FAILED - ${e.message}`);
  }
}

async function run() {
  await testModel("gemini-2.0-flash-lite");
  await testModel("gemini-flash-lite-latest");
  await testModel("gemini-3.5-flash-lite");
  await testModel("gemini-2.5-flash");
}
run();
