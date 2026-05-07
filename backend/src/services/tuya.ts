import { createHmac, createHash } from 'crypto';

const BASE_URL = 'https://openapi.tuyaeu.com';

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

function hmacSha256(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex').toUpperCase();
}

async function getToken(): Promise<string> {
  const clientId = process.env.TUYA_CLIENT_ID!;
  const clientSecret = process.env.TUYA_CLIENT_SECRET!;
  const t = Date.now().toString();
  const path = '/v1.0/token?grant_type=1';
  const stringToSign = `GET\n${sha256('')}\n\n${path}`;
  const sign = hmacSha256(clientId + t + stringToSign, clientSecret);

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { client_id: clientId, t, sign_method: 'HMAC-SHA256', nonce: '', sign },
  });
  const data = (await res.json()) as { result: { access_token: string } };
  return data.result.access_token;
}

export async function controlPlug(on: boolean): Promise<void> {
  const clientId = process.env.TUYA_CLIENT_ID!;
  const clientSecret = process.env.TUYA_CLIENT_SECRET!;
  const deviceId = process.env.TUYA_DEVICE_ID!;

  const accessToken = await getToken();
  const t = Date.now().toString();
  const path = `/v1.0/iot-03/devices/${deviceId}/commands`;
  const body = JSON.stringify({ commands: [{ code: 'switch_1', value: on }] });
  const stringToSign = `POST\n${sha256(body)}\n\n${path}`;
  const sign = hmacSha256(clientId + accessToken + t + stringToSign, clientSecret);

  await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      client_id: clientId,
      t,
      sign_method: 'HMAC-SHA256',
      nonce: '',
      access_token: accessToken,
      sign,
      'Content-Type': 'application/json',
    },
    body,
  });
}
