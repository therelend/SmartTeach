const express = require("express");
const app = express();
const { default: OpenAI } = require("openai");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const port = process.env.PORT || 8000;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const bodyJson = bodyParser.json();

app.get("/", async (req, res) => {
  try {
    let prompt = `create a professional development suggestions based on this information """resources, tips, articles, best practices to improve and upskill themselves in teaching, lesson planning, classroom management, student engagement""" all data should be in array of object which contain keys as category, suggestions as array of strings, tips as array of strings`;
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const data = JSON.parse(response?.choices[0].message?.content);

    res.render("pages/index", { data });
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

app.post("/generateLessonPlan", bodyJson, async (req, res) => {
  try {
    const { formData, query } = req.body;
    let prompt = "Based on the information you provided:\n";
    prompt += `Lesson Type: ${formData.type}\n`;
    prompt += `Curriculum: ${formData.curriculum}\n`;
    prompt += `Subject: ${formData.subject}\n`;
    prompt += `Topic: ${formData.topic}\n`;
    prompt += `Grade: ${formData.grade}\n`;

    if (formData.description) {
      prompt += `Description: ${formData.description}\n`;
    }

    prompt += `\nGenerate ${query} with the information provided as teacher`;

    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    res.json(response?.choices[0].message?.content);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
