import { ItemQuery, ItemPremitive } from "@/types";
export async function serviceQueryStatusFile(data: ItemQuery) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s

  try {
    const response = await fetch(
      'https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/queryfiles',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      let errorText: any;
      try {
        errorText = await response.json();
      } catch {
        errorText = await response.text(); // si no es JSON
      }
      throw new Error(
        typeof errorText === "string" ? errorText : errorText.error || "Error desconocido"
      );
    }

    const result: ItemPremitive[] = await response.json();
    return result;
  } catch (error) {
    clearTimeout(timeout);
    console.error("Error fetching data:", error);
    throw error;
  }
}