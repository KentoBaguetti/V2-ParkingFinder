import OpenAI from "openai";

const openai = new OpenAI();

const test_img = "../car parking 2.jpg";

const countCars = async () => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "How many cars are in this image?" },
          {
            type: "image_url",
            image_url: {
              url: test_img,
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
};

module.exports = { countCars };
