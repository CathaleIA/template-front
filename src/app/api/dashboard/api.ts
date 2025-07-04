import { MotorData, HistoricalDataPoint } from "@/components/common/types";


export const fetchMotorData = async (): Promise<MotorData> => {
  const response = await fetch("https://apibackend-esjz.onrender.com/api/motor");
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};

export const fetchHistoricalData = async (hours: number): Promise<HistoricalDataPoint[]> => {
  const response = await fetch(`https://46ou4qrae1.execute-api.us-east-1.amazonaws.com/prod/history?hours=${hours}`);
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};