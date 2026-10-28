# DCMR app live brengen in Azure

Deze handleiding is geschreven alsof je Azure nog niet dagelijks gebruikt. Volg de stappen van boven naar beneden.

## 0. Wat ga je bouwen?

Je zet deze onderdelen live:

1. **Azure Static Web Apps**: host de Vue frontend.
2. **Microsoft Entra ID**: login met DCMR/Microsoft-account.
3. **Azure AI Foundry Agent**: doet de foto-/etiketanalyse.
4. **Azure Logic App Standard**: workflow tussen frontend, Foundry Agent, opslag en database.
5. **Azure Blob Storage**: bewaart foto’s.
6. **Azure SQL Database**: bewaart inspecties, foto-metadata en stoffen.
7. Optioneel maar aanbevolen: **Azure API Management** voor een veilige API-laag voor de frontend.

De frontend verwacht straks deze API:

```text
POST /api/analyze-substances
POST /api/analyze-product
```

De app gebruikt geen Supabase meer.

## 1. Voorbereiding

Zorg dat je dit hebt:

- Toegang tot de Azure Portal: https://portal.azure.com
- Een Azure subscription waarin je resources mag aanmaken.
- Deze code op je laptop of een DCMR-machine.
- Node.js volgens `.nvmrc`.
- Azure CLI en de Azure Static Web Apps CLI.
- Toegang tot Azure AI Foundry.
- Een regio kiezen, bijvoorbeeld **West Europe**.

Gebruik overal ongeveer dezelfde namen. Voorbeeld:

```text
Resource group: rg-dcmr-inspectie-prod
Static Web App: swa-dcmr-inspectie-prod
Storage account: stdcmrinspprd001
Blob container: inspection-photos
SQL server: sql-dcmr-inspectie-prod
SQL database: sqldb-dcmr-inspectie-prod
Logic App: logic-dcmr-inspectie-prod
Foundry agent: dcmr-label-analysis-agent
```

Let op: storage account namen moeten wereldwijd uniek zijn, lowercase, zonder streepjes.

## 2. Resource group maken

1. Ga naar de Azure Portal.
2. Zoek bovenin naar **Resource groups**.
3. Klik **Create**.
4. Vul in:
   - Subscription: jouw DCMR subscription
   - Resource group: `rg-dcmr-inspectie-prod`
   - Region: `West Europe`
5. Klik **Review + create**.
6. Klik **Create**.

Alles wat je hierna maakt, zet je in deze resource group.

## 3. Azure SQL Database maken

1. Zoek in Azure naar **SQL databases**.
2. Klik **Create**.
3. Vul in:
   - Resource group: `rg-dcmr-inspectie-prod`
   - Database name: `sqldb-dcmr-inspectie-prod`
4. Bij **Server** klik je **Create new**.
5. Vul in:
   - Server name: `sql-dcmr-inspectie-prod`
   - Location: `West Europe`
   - Authentication: kies wat DCMR voorschrijft. Voor simpel starten kan SQL authentication, maar Entra-only is netter.
6. Kies bij Compute een kleine tier voor MVP/test.
7. Klik **Review + create** en daarna **Create**.

Daarna het schema laden:

1. Open de SQL database in Azure.
2. Ga naar **Query editor**.
3. Login.
4. Open lokaal dit bestand:

```text
azure/sql/schema.sql
```

5. Plak de inhoud in Query editor.
6. Klik **Run**.

Als dit lukt, heb je tabellen voor inspecties, foto’s en stoffen.

## 4. Blob Storage maken

1. Zoek in Azure naar **Storage accounts**.
2. Klik **Create**.
3. Vul in:
   - Resource group: `rg-dcmr-inspectie-prod`
   - Storage account name: bijvoorbeeld `stdcmrinspprd001`
   - Region: `West Europe`
   - Performance: `Standard`
   - Redundancy: `LRS` voor MVP, of wat DCMR voorschrijft.
4. Klik **Review + create** en daarna **Create**.
5. Open het storage account.
6. Ga naar **Data storage > Containers**.
7. Klik **+ Container**.
8. Name: `inspection-photos`.
9. Public access level: **Private**.
10. Klik **Create**.

Foto’s horen private te blijven. Zet de container dus niet publiek.

## 5. Azure AI Foundry Agent maken

1. Ga naar Azure AI Foundry.
2. Maak of open een project voor DCMR.
3. Maak een nieuwe agent.
4. Naam:

```text
dcmr-label-analysis-agent
```

5. Kies een model dat afbeeldingen kan analyseren.
6. Open dit bestand in de repo:

```text
azure/ai-foundry/dcmr-agent-instructions.md
```

7. Kopieer de volledige tekst naar de agent instructions.
8. Test de agent met 2 of 3 foto’s van chemische etiketten.
9. Controleer dat de agent alleen JSON teruggeeft.
10. Noteer:
    - Foundry project/agent endpoint
    - Agent ID
    - Model/deploymentnaam

Die heb je nodig voor de Logic App.

## 6. Logic App Standard maken

1. Zoek in Azure naar **Logic apps**.
2. Klik **Create**.
3. Kies **Standard**.
4. Vul in:
   - Resource group: `rg-dcmr-inspectie-prod`
   - Logic App name: `logic-dcmr-inspectie-prod`
   - Region: `West Europe`
   - Plan type: Workflow Service Plan
   - OS: Windows, als de portal daarom vraagt
5. Kies of maak een storage account voor de Logic App runtime. Dit mag hetzelfde storage account zijn, maar vaak is een apart runtime-storage account netter.
6. Klik **Review + create** en daarna **Create**.

Daarna identity aanzetten:

1. Open de Logic App.
2. Ga naar **Identity**.
3. Zet **System assigned** op **On**.
4. Klik **Save**.

Deze identity moet later rechten krijgen op Foundry, Storage en SQL.

## 7. Rechten geven aan de Logic App

### Storage rechten

1. Open het storage account.
2. Ga naar **Access Control (IAM)**.
3. Klik **Add role assignment**.
4. Kies rol: **Storage Blob Data Contributor**.
5. Selecteer de managed identity van `logic-dcmr-inspectie-prod`.
6. Klik **Review + assign**.

### Foundry rechten

1. Open het Azure AI Foundry project/resource.
2. Ga naar **Access Control (IAM)**.
3. Geef de Logic App managed identity een rol waarmee de agent aangeroepen mag worden.
4. Gebruik de rol die DCMR/Azure-beheer voorschrijft. Vaak is dit een AI/Foundry user/contributor-achtige rol.

### SQL rechten

De makkelijkste MVP-route is een SQL connection string als Logic App app setting. Netter is Managed Identity naar SQL, maar dat vraagt extra SQL-configuratie.

Voor MVP:

1. Open SQL Database.
2. Ga naar **Connection strings**.
3. Kopieer de ADO.NET of JDBC-style connection info.
4. Zet username/password niet in code, maar straks in Logic App settings of Key Vault.

## 8. Workflow importeren in Logic App

In deze repo staat een start-workflow:

```text
azure/logic-app/dcmr-analyze-substances-workflow.json
```

Belangrijk: dit is een import/starttemplate. Je moet in de Azure designer nog de echte connectoracties goed koppelen.

Stappen:

1. Open de Logic App.
2. Ga naar **Workflows**.
3. Maak een workflow, bijvoorbeeld:

```text
analyze-substances
```

4. Kies **Stateful**.
5. Open de workflow designer.
6. Start met trigger: **When a HTTP request is received**.
7. Gebruik het request-schema uit:

```text
azure/logic-app/sample-request.analyze-substances.json
```

8. Voeg daarna acties toe:
   - Foto opslaan in Blob Storage.
   - Azure AI Foundry Agent aanroepen.
   - JSON response parsen.
   - Resultaat opslaan in Azure SQL.
   - Response teruggeven aan frontend.

De frontend verwacht een response zoals:

```text
azure/logic-app/sample-response.analyze-substances.json
```

Houd dit contract exact aan:

```json
{
  "success": true,
  "data": {
    "total_count": 1,
    "image_description": "...",
    "substances": []
  }
}
```

Bij fouten:

```json
{
  "success": false,
  "error": "Duidelijke foutmelding"
}
```

## 9. API veilig maken voor de frontend

Je hebt twee opties.

### Optie A: snel voor MVP

Je gebruikt de Logic App HTTP endpoint direct als backend.

Nadeel: een Logic App callback URL bevat een secret. Die wil je liever niet direct in browsercode zetten.

Gebruik deze optie alleen voor een interne demo.

### Optie B: aanbevolen voor DCMR

Zet **Azure API Management** of een vergelijkbare gateway vóór de Logic App.

Dan krijgt de frontend bijvoorbeeld:

```text
https://api.dcmr.nl/inspectie
```

En daarachter routeert APIM:

```text
POST /api/analyze-substances -> Logic App workflow
POST /api/analyze-product -> Logic App workflow
```

Voordeel:

- Geen Logic App secret in de frontend.
- Betere logging.
- Rate limiting.
- Entra ID-validatie mogelijk.
- Netter voor productie.

## 10. Static Web App maken zonder GitHub of Azure DevOps

1. Zoek in Azure naar **Static Web Apps**.
2. Klik **Create**.
3. Vul in:
   - Resource group: `rg-dcmr-inspectie-prod`
   - Name: `swa-dcmr-inspectie-prod`
   - Plan type: Free voor test, Standard voor productie
   - Region: kies dicht bij je users
4. Bij **Deployment source** kies je **Other**.
5. Klik **Review + create**.
6. Klik **Create**.

Je krijgt nu een lege Static Web App. Er is geen GitHub Actions workflow en geen Azure DevOps pipeline. Je gaat straks zelf lokaal builden en uploaden.

De app gebruikt:

```text
public/staticwebapp.config.json
```

Daarin staat:

- `/app/*` is alleen voor ingelogde gebruikers.
- `/api/*` is alleen voor ingelogde gebruikers.
- Vue Router refreshes vallen terug naar `index.html`.

## 11. Lokale build maken

Open een terminal in de projectmap:

```text
/Users/jurgen/Downloads/dcmr_r_cfc2075_ROOT
```

Installeer dependencies:

```sh
npm install
```

Deze versie gebruikt gratis Iconify/Lucide iconen en heeft geen FontAwesome Pro token nodig.

Maak lokaal een `.env.production` bestand:

```sh
VITE_DCMR_API_BASE_URL=/api
VITE_DISABLE_AUTH=false
```

Als je APIM gebruikt, wordt dit bijvoorbeeld:

```text
VITE_DCMR_API_BASE_URL=https://api.dcmr.nl/inspectie
```

Bouw de app:

```sh
npm run build
```

Als dit lukt, staat de website in:

```text
dist
```

Die `dist` map ga je uploaden naar Azure.

## 12. Static Web Apps CLI installeren

Je hebt twee CLI-tools nodig:

```sh
npm install -g @azure/static-web-apps-cli
az login
```

Als `az login` opent in je browser, log dan in met je Azure-account.

Controleer daarna of je Azure CLI werkt:

```sh
az account show
```

## 13. Deployment token ophalen

1. Open de Static Web App in Azure.
2. Ga naar **Manage deployment token**.
3. Klik **Copy**.
4. Bewaar deze token tijdelijk veilig.

Noem hem in je terminal bijvoorbeeld:

```sh
export SWA_CLI_DEPLOYMENT_TOKEN="plak-hier-je-token"
```

Op Windows PowerShell:

```powershell
$env:SWA_CLI_DEPLOYMENT_TOKEN="plak-hier-je-token"
```

Deze token is geheim. Zet hem niet in code, screenshots of documentatie.

## 14. Handmatig deployen naar Static Web Apps

Zorg dat je nog steeds in de projectmap staat en dat `dist` bestaat.

Deploy dan:

```sh
swa deploy ./dist --deployment-token "$SWA_CLI_DEPLOYMENT_TOKEN" --env production
```

Als dit lukt, geeft de CLI een URL terug, bijvoorbeeld:

```text
https://swa-dcmr-inspectie-prod.azurestaticapps.net
```

Elke keer dat je later iets wijzigt:

```sh
npm run build
swa deploy ./dist --deployment-token "$SWA_CLI_DEPLOYMENT_TOKEN" --env production
```

Dat is je handmatige deployproces zonder GitHub en zonder Azure DevOps.

## 15. Login testen

Als de Static Web App live is:

1. Open de Static Web App URL.
2. Ga naar:

```text
https://jouw-app.azurestaticapps.net/auth
```

3. Klik **Inloggen met Microsoft Entra ID**.
4. Je hoort naar Microsoft login te gaan.
5. Na login hoor je in `/app/home` te komen.

Als iedereen met een Microsoft-account kan inloggen en je alleen DCMR wil toestaan, moet DCMR een custom Entra provider/tenant restriction instellen voor Static Web Apps.

## 16. Analyse testen

Test eerst de Logic App los:

1. Open de workflow.
2. Kopieer de HTTP trigger URL.
3. Gebruik Postman, Bruno of Azure test tooling.
4. Stuur de voorbeeldrequest uit:

```text
azure/logic-app/sample-request.analyze-substances.json
```

5. Vervang `imageBase64` door echte base64 van een foto.
6. Controleer dat je response lijkt op:

```text
azure/logic-app/sample-response.analyze-substances.json
```

Daarna test je vanuit de app:

1. Login.
2. Ga naar de inspectie/scanner.
3. Upload een foto.
4. Controleer:
   - foto wordt geanalyseerd;
   - stoffen verschijnen in de UI;
   - ADR-validatie werkt;
   - data komt in Azure SQL;
   - foto komt in Blob Storage.

## 17. Productiechecklist

Voor je dit echt live zet:

- Static Web App staat op Standard als DCMR dat eist.
- Custom domain en TLS zijn ingesteld.
- Alleen DCMR/Entra users mogen inloggen.
- Logic App endpoint staat niet als geheime callback URL in browsercode.
- Foundry credentials staan niet in frontend env vars.
- Storage container is private.
- SQL firewall/private networking is volgens DCMR-beleid ingesteld.
- Application Insights/logging staat aan.
- Er is een testset met echte etiketten gebruikt.
- Foutmeldingen zijn getest.
- Kostenlimieten/budget alerts staan aan.
- Deployment token is niet gedeeld of ingecheckt.

## 18. Wat je aan DCMR/Azure-beheer moet vragen

Vraag letterlijk dit:

1. Welke Azure subscription en resource group mogen we gebruiken?
2. Welke regio moeten we gebruiken?
3. Moet alles achter private endpoints/VNet?
4. Mogen we Azure Static Web Apps gebruiken?
5. Moet de API via Azure API Management?
6. Welke Entra tenant/users/groups mogen toegang krijgen?
7. Welke rol mag de Logic App managed identity krijgen op Foundry, Storage en SQL?
8. Welke naming convention gebruikt DCMR?
9. Moeten logs naar Log Analytics/Sentinel?
10. Is Azure AI Foundry met image-capable model toegestaan voor deze data?
11. Mag handmatige deployment via Static Web Apps deployment token, of moet DCMR een formeel releaseproces gebruiken?

## 19. Bestanden in deze repo die hierbij horen

```text
public/staticwebapp.config.json
azure/README.md
azure/api-contract.md
azure/ai-foundry/dcmr-agent-instructions.md
azure/sql/schema.sql
azure/logic-app/dcmr-analyze-substances-workflow.json
azure/logic-app/sample-request.analyze-substances.json
azure/logic-app/sample-response.analyze-substances.json
.env.example
```

## 20. Simpele volgorde om te onthouden

```text
1. Resource group
2. SQL
3. Storage
4. Foundry Agent
5. Logic App
6. APIM of veilige API-route
7. Static Web App met Deployment source = Other
8. Lokaal npm install + npm run build
9. swa deploy ./dist
10. Login testen
11. Analyse testen
12. Productie-hardening
```
