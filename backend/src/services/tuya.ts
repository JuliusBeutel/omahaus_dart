const HA_URL = process.env.HA_URL!; // https://ha.deine-domain.com
const HA_TOKEN = process.env.HA_TOKEN!;
const ENTITY_ID = process.env.HA_ENTITY_ID!; // z.B. switch.steckdose_buero

export async function controlPlug(on: boolean): Promise<void> {
  const service = on ? "turn_on" : "turn_off";

  const res = await fetch(`${HA_URL}/api/services/switch/${service}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entity_id: ENTITY_ID }),
  });

  if (!res.ok) {
    throw new Error(`HA request failed: ${res.status} ${await res.text()}`);
  }
}
