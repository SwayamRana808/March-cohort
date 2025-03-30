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

        const prompt = `You are an AI that generates structured interactive form flows. 
          ### IMPORTANT RULE:
- **"terminal": true and "success": true can ONLY be present on the last screen.**  
- **DO NOT include "terminal": false or "success": false on any other screens.**  
- **If the screen is not the last one, REMOVE both "terminal" and "success" properties entirely.** 
- and dont use dropdowns type as it not supported in the frontend
ex:"screens": [
    {
      "id": "screen_one",
      "title": "Favorite Actors Survey",
      "terminal": false,-->wrong
      "success": false, -->wrong
    }
      "screens": [
    {
      "id": "screen_one",
      "title": "Favorite Actors Survey",

      -->fully removed if not last screen "
    }
       

        Generate a JSON response with the following structure:
        ""

{ 
  "name" : "flow_name",
  "version": "7.0", --> keep this as 7.0
  "categories": ["SIGN_IN/APPOINTMENT_BOOKING/LEAD_GENERATION/CONTACT_US/CUSTOMER_SUPPORT/SURVEY/OTHER"],
  "data_api_version": "3.0",
  "publish":false, -->always false
  "routing_model": {
    "screen_one": ["screen_two"],
    "screen_two": ["screen_three"],
    "screen_three": ["screen_four"],
    "screen_four": []
  },
  "screens": [
    {
      "id": "screen_one",
      "title": "Job Preference Survey",
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextSubheading",
            "text": "What type of job are you primarily looking for right now?"
          },
          {
            "type": "RadioButtonsGroup",
            "label": "Job Type",
            "name": "job_type",
            "required": true,
            "data-source": [
              { "id": "full_time", "title": "Full-Time" },
              { "id": "part_time", "title": "Part-Time" },
              { "id": "contract", "title": "Contract" },
              { "id": "freelance", "title": "Freelance" }
            ]
          },
          {
            "type": "Footer",
            "label": "Next ➡",
            "on-click-action": {
              "name": "navigate",
              "next": { "type": "screen", "name": "screen_two" }
            }
          }
        ]
      }
    },
    {
      "id": "screen_two",
      "title": "Job Preference Survey",
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextSubheading",
            "text": "What industry are you most interested in working in?"
          },
          {
            "type": "Dropdown",
            "label": "Industry",
            "name": "industry",
            "required": true,
            "data-source": [
              { "id": "technology", "title": "Technology" },
              { "id": "healthcare", "title": "Healthcare" },
              { "id": "finance", "title": "Finance" },
              { "id": "education", "title": "Education" },
              { "id": "other", "title": "Other" }
            ]
          },
          {
            "type": "Footer",
            "label": "Next ➡",
            "on-click-action": {
              "name": "navigate",
              "next": { "type": "screen", "name": "screen_three" }
            }
          }
        ]
      }
    },
    {
      "id": "screen_three",
      "title": "Job Preference Survey",
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextSubheading",
            "text": "What is your preferred work environment?"
          },
          {
            "type": "RadioButtonsGroup",
            "label": "Work Environment",
            "name": "work_environment",
            "required": true,
            "data-source": [
              { "id": "remote", "title": "Remote" },
              { "id": "hybrid", "title": "Hybrid" },
              { "id": "in_office", "title": "In-Office" }
            ]
          },
          {
            "type": "Footer",
            "label": "Next ➡",
            "on-click-action": {
              "name": "navigate",
              "next": { "type": "screen", "name": "screen_four" }
            }
          }
        ]
      }
    },
    {
      "id": "screen_four",
      "title": "Job Preference Survey",
      "terminal": true,
      "success": true,
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextSubheading",
            "text": "Any other preferences or details you'd like to share?"
          },
          {
            "type": "TextArea",
            "label": "Additional Information",
            "name": "additional_info",
            "required": false
          },
          {
            "type": "Footer",
            "label": "Finish ✅",
            "on-click-action": {
              "name": "data_exchange",
              "payload": {
                "job_type": "\${form.job_type}",
                "industry": "\${form.industry}",
                "work_environment": "\${form.work_environment}",
                "additional_info": "\${form.additional_info}"
              }
            }
          }
        ]
      }
    }
  ]
}

User request: ${userInput}

### Flow Guidelines:
- Support Multiple Screens - Navigation between screens must be properly handled.
- Include Various Input Types - Support RadioButtons, Dropdowns, and TextArea.
- Ensure Data Binding & Field References - Correctly reference user inputs in the payload.
- Include Validation Rules - Required fields should be properly marked.
- Ensure Proper Navigation Actions - Each screen must have a Footer for moving forward.
- Support Data Passing Between Screens - Maintain form data across screens.

### JSON Generation Rules:
- Screen IDs must be lowercase with underscores (e.g., screen_one, screen_two).
- Ensure all screen IDs exist in both routing_model and screens.
- The final screen must not have a next screen (empty array in routing_model).

### Navigation Handling:
- Use:
  "on-click-action": {
    "name": "navigate",
    "next": { "type": "screen", "name": "next_screen_id" }
  }
- The last screen’s on-click-action must use:
  "name": "data_exchange" with a payload referencing form inputs.

### Example Navigation Actions:
- Basic navigation:
  "on-click-action": {
    "name": "navigate",
    "next": { "type": "screen", "name": "screen_two" }
  }
- Final screen submission:
  "on-click-action": {
    "name": "data_exchange",
    "payload": {
      "field1": "\${form.field1}",
      "field2": "\${form.field2}"

 
`;

      const cleanUpFlow = (jsonData) => {
        if (!jsonData.screens || jsonData.screens.length === 0) return jsonData;

        const lastScreenIndex = jsonData.screens.length - 1;
        jsonData.screens = jsonData.screens.map((screen, index) => {
            if (index !== lastScreenIndex) {
                // Remove terminal and success if they are set to false
                const { terminal, success, ...cleanedScreen } = screen;
                return cleanedScreen;
            }
            return screen; // Keep the last screen as it is
        });

        return jsonData;
      };
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        console.log(text);
        // Clean up the response to get only the JSON
        const jsonStartIndex = text.indexOf('{');
        const jsonEndIndex = text.lastIndexOf('}');
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            text = text.substring(jsonStartIndex, jsonEndIndex + 1);
        }
        
        // Validate that the response is valid JSON
        try {
            const parsedJson = JSON.parse(text);
            // parsedJson = cleanUpFlow(parsedJson);
            console.log("cleaned up flow",parsedJson);
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