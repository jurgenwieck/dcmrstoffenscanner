# DCMR frontend API contract

De frontend roept `VITE_DCMR_API_BASE_URL` aan. Standaard is dat `/api`.

Voor een snelle demo zonder APIM/proxy kan de frontend ook rechtstreeks naar volledige Logic App URLs wijzen:

```text
VITE_ANALYZE_SUBSTANCES_URL=<volledige Logic App HTTP trigger URL>
VITE_ANALYZE_PRODUCT_URL=<volledige Logic App HTTP trigger URL>
```

Gebruik dit alleen voor demo/test. Een Logic App callback URL bevat een secret.

## `POST /analyze-substances`

Request:

```json
{
  "fileName": "etiket.jpg",
  "contentType": "image/jpeg",
  "imageBase64": "<base64-image-content>",
  "inspectionId": "insp_1720000000000",
  "photoId": "photo_1720000000000"
}
```

`inspectionId` en `photoId` zijn optioneel voor een losse scan. De Logic App maakt
dan IDs aan en retourneert deze in `persistence`. `userId` mag alleen vanuit een
vertrouwde gateway of geverifieerde Entra-claim worden doorgegeven.

Response:

```json
{
  "success": true,
  "data": {
    "total_count": 1,
    "image_description": "Nederlandse beschrijving",
    "ai_model": "azure-ai-foundry-agent",
    "extraction_timestamp": "2026-07-08T12:00:00.000Z",
    "substances": []
  },
  "persistence": {
    "inspectionId": "insp_1720000000000",
    "photoId": "photo_1720000000000",
    "fileBlob": "insp_1720000000000/photo_1720000000000/original-upload",
    "resultBlob": "insp_1720000000000/photo_1720000000000/result.json",
    "saved": true
  }
}
```

Foutresponse:

```json
{
  "success": false,
  "error": "Leesbare foutmelding voor de gebruiker"
}
```

## `POST /analyze-product`

Zelfde requestvorm als `/analyze-substances`, maar `data` volgt het lichtere productextractiecontract dat de POC-pagina gebruikt.

```json
{
  "success": true,
  "data": {
    "product_name": "Voorbeeld",
    "ean_code": "8712345678901",
    "batch_number": "B123",
    "dangerous_icons": ["GHS02"],
    "confidence": {
      "product_name": 0.9,
      "ean_code": 0.8
    }
  }
}
```

## Beveiliging

Zet nooit een Logic App callback URL met SAS-secret direct in `VITE_DCMR_API_BASE_URL`.
Gebruik APIM, Entra ID-authenticatie, Static Web Apps API-koppeling of een ander DCMR-goedgekeurd gatewaypatroon.
