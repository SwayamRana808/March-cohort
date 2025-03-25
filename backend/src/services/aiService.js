import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Use GOOGLE_API_KEY

/**
 * Generates a WhatsApp flow based on user input using Gemini.
 * @param {string} userInput - The prompt describing the flow.
 * @returns {Promise<string>} - AI-generated interactive flow in JSON format.
 */
export const generateFlow = async (userInput) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use gemini-pro or gemini-ultra

        const prompt = `You are an AI that generates structured interactive form flows. Generate a JSON response with the following structure:

{
  "version": "7.0",
  "screens": [
    {
      "id": "SCREEN_ID",
      "title": "Screen Title",
      "data": {},
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "form",
            "children": [
              {
                "type": "TextSubheading",
                "text": "Question Text"
              },
              {
                "type": "RadioButtonsGroup|Dropdown|TextArea",
                "label": "Input Label",
                "name": "field_name",
                "required": true|false,
                "data-source": [
                  {
                    "id": "option_id",
                    "title": "Option Title"
                  }
                ]
              },
              {
                "type": "Footer",
                "label": "Button Text",
                "on-click-action": {
                  "name": "navigate|complete",
                  "next": {
                    "type": "screen",
                    "name": "NEXT_SCREEN_ID"
                  },
                  "payload": {
                    "field_reference": "\${form.field_name}"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
}

User request: ${userInput}

Generate a complete interactive flow based on the user's request. The flow should:
1. Support multiple screens with navigation between them
2. Include various input types (RadioButtons, Dropdowns, TextArea)
3. Have proper data binding and field references
4. Include validation rules where needed
5. Have clear navigation actions between screens
6. Support data passing between screens

Return ONLY the JSON object, no additional text or explanation.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        
        // Clean up the response to get only the JSON
        const jsonStartIndex = text.indexOf('{');
        const jsonEndIndex = text.lastIndexOf('}');
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            text = text.substring(jsonStartIndex, jsonEndIndex + 1);
        }
        
        // Validate that the response is valid JSON
        try {
            const parsedJson = JSON.parse(text);
            // Additional validation for required structure
            if (!parsedJson.version || !Array.isArray(parsedJson.screens)) {
                throw new Error("Invalid flow structure: missing version or screens array");
            }
            return text;
        } catch (error) {
            console.error("JSON validation error:", error);
            throw new Error("AI generated invalid flow structure");
        }
    } catch (error) {
        console.error("Error generating flow:", error);
        throw new Error("Failed to generate interactive flow.");
    }
};