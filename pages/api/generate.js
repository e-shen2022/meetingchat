import { Configuration, OpenAIApi } from "openai";
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Allow POST and OPTIONS methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header

  // Handle pre-flight request. Don't run the rest of the method body if this is a pre-flight request.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const meetingchat = req.body.meetingchat || '';
  if (meetingchat.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid meetingchat",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(meetingchat),
      temperature: 0.6,
      max_tokens: 500,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(meetingchat) {
  const capitalizedmeetingchat =
    meetingchat[0].toUpperCase() + meetingchat.slice(1).toLowerCase();
return `You will be provided with meeting notes, and your task is to summarize the meeting as follows:
- Overall summary of discussion:
\\n
- Action items (what needs to be done and who is doing it):
\\n
- If applicable, topics that need to be discussed more fully in the next meeting:
\\n


With every different topic, make a new line between the topics with four dashes: ----. This will make your new line between the summary, action items, and additional topics. 
Prompt: ${capitalizedmeetingchat}`;
}
/* 
  If the user asks for a current event that you cannot search up, return a variation of the message "I'm sorry, I do not have that information. Please refer to our stock lookup to get the information."
  If you make a prediction for something based on user data, make sure to let them know that you will not take responsibility for their actions and that your guesses are purely hypothetical and should be followed at the user's own risk. */