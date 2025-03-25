export const getGeneratedFlow = async (prompt) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const relativeUrl = process.env.NEXT_PUBLIC_API_FLOWS_GENERATE;
    const fullUrl = `${baseUrl}${relativeUrl}`;

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
  
      if (!response.ok) throw new Error("Failed to generate flow");
  
      const data = await response.json();
      console.log(data);
      return data.flow;
    } catch (error) {
      console.error("Error fetching generated flow:", error);
      return null;
    }
  };
  