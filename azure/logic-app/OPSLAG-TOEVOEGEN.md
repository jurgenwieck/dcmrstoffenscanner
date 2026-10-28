# Bestand en analyseresultaat als blobs opslaan

Deze workflow bewaart alleen het geüploade bestand en het oorspronkelijke
AI-resultaat. Azure SQL is hiervoor niet nodig.

Per scan ontstaat deze mapstructuur in de gekozen container:

```text
<inspectionId>/<photoId>/original-upload
<inspectionId>/<photoId>/result.json
```

`original-upload` heeft geen extensie nodig: het oorspronkelijke MIME-type wordt als
contenttype opgeslagen. Hierdoor hoeft een aangeleverde bestandsnaam niet eerst te
worden opgeschoond.

## 1. Container en rechten

Maak een private Blob-container, bijvoorbeeld `inspection-results`. Een containernaam
bestaat uit 3 tot 63 kleine letters, cijfers of koppeltekens. Tekens zoals `@` zijn
niet toegestaan.

Zet de system-assigned managed identity van de Logic App aan en geef deze op het
storage account de rol `Storage Blob Data Contributor`. Maak de Blob-connector in de
Logic App vervolgens met `Logic Apps Managed Identity`.

## 2. Vaste IDs per uitvoering maken

Voeg direct na de HTTP-trigger twee **Compose**-acties toe.

Naam: `Inspection_Id`

```text
@coalesce(triggerBody()?['inspectionId'], concat('insp_', guid()))
```

Naam: `Photo_Id`

```text
@coalesce(triggerBody()?['photoId'], concat('photo_', guid()))
```

Gebruik deze outputs overal. Roep `guid()` niet opnieuw aan in een blobnaam, omdat de
foto en JSON dan in verschillende mappen kunnen belanden.

## 3. Analyse uitvoeren

Laat de bestaande Foundry HTTP-actie na de twee ID-acties draaien. Behoud de bestaande
Compose-actie die de tekstresponse naar JSON omzet en hernoem deze naar
`Analysis_JSON`:

```text
@json(body('HTTP')?['output']?[1]?['content']?[0]?['text'])
```

## 4. Geüpload bestand opslaan

Voeg na `Analysis_JSON` de actie **Azure Blob Storage > Create blob (V2)** toe en noem
de actie `Save_Uploaded_File`.

- Container: `<containernaam>`
- Blob name:

```text
@{outputs('Inspection_Id')}/@{outputs('Photo_Id')}/original-upload
```

- Blob content:

```text
@base64ToBinary(triggerBody()?['imageBase64'])
```

- Content type:

```text
@triggerBody()?['contentType']
```

## 5. Resultaat als JSON opslaan

Voeg na `Save_Uploaded_File` nog een **Create blob (V2)**-actie toe en noem deze
`Save_Analysis_Result`.

- Container: dezelfde `<containernaam>`
- Blob name:

```text
@{outputs('Inspection_Id')}/@{outputs('Photo_Id')}/result.json
```

- Blob content:

```text
@string(outputs('Analysis_JSON'))
```

- Content type: `application/json`

## 6. Response als laatste uitvoeren

Wijzig `runAfter` van de bestaande Response zodat deze alleen na
`Save_Analysis_Result: Succeeded` draait. Gebruik deze responsebody:

```json
{
  "success": true,
  "data": "@outputs('Analysis_JSON')",
  "persistence": {
    "inspectionId": "@outputs('Inspection_Id')",
    "photoId": "@outputs('Photo_Id')",
    "fileBlob": "@{outputs('Inspection_Id')}/@{outputs('Photo_Id')}/original-upload",
    "resultBlob": "@{outputs('Inspection_Id')}/@{outputs('Photo_Id')}/result.json",
    "saved": true
  }
}
```

Voeg een aparte foutresponse met status `500` toe voor `Failed` en `TimedOut` van de
Foundry-, upload- en resultaatopslagacties. Stuur geen interne connectorfout of secrets
terug naar de browser.

## 7. Belangrijke beperking

`result.json` bevat de oorspronkelijke AI-uitkomst. Wijzigingen die een inspecteur
daarna in de Vue-app maakt, worden hiermee niet opnieuw opgeslagen. Daarvoor is later
een afzonderlijke update-aanroep naar de Logic App nodig.

Trek een eerder in broncode of chat gedeelde Foundry API-sleutel in. Gebruik Managed
Identity, of haal de vervangende sleutel op uit Key Vault en schakel Secure Inputs en
Secure Outputs in.
