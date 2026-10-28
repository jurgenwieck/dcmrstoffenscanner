# DCMR Azure import package

Deze map bevat de Azure-artifacts voor de DCMR-importvariant zonder Supabase.

## Doelarchitectuur

- Azure Static Web Apps host de Vue/Vite frontend.
- Microsoft Entra ID verzorgt login via `/.auth/login/aad`.
- Azure API Management of een beveiligde Logic App endpoint staat achter `VITE_DCMR_API_BASE_URL`.
- Logic App Standard orchestreert analyse:
  1. ontvangt image payload van de frontend,
  2. roept de Azure AI Foundry Agent aan,
  3. slaat de foto en het JSON-resultaat op in Blob Storage,
  4. geeft genormaliseerde JSON terug aan de frontend.

## Importvolgorde

1. Maak Azure SQL Database aan en voer `sql/schema.sql` uit.
2. Maak een Storage Account container `inspection-photos`.
3. Maak in Azure AI Foundry een agent met `ai-foundry/dcmr-agent-instructions.md`.
4. Importeer `logic-app/dcmr-analyze-substances-workflow.json` in Logic App Standard en vul de app settings/parameters in.
5. Publiceer de frontend naar Azure Static Web Apps met build output `dist`.
6. Zet `VITE_DCMR_API_BASE_URL` naar de beveiligde APIM-route of Logic App route.

Zie `api-contract.md` voor de endpoints die de frontend verwacht.

Zie `logic-app/OPSLAG-TOEVOEGEN.md` voor het opslaan van de foto en het
analyseresultaat in Blob Storage.

## Belangrijke settings

- `DCMR_STORAGE_ACCOUNT_NAME`
- `DCMR_STORAGE_CONTAINER_NAME`
- `DCMR_FOUNDRY_AGENT_ENDPOINT`
- `DCMR_FOUNDRY_AGENT_ID`
- `DCMR_FOUNDRY_API_VERSION`

Gebruik Managed Identity waar mogelijk. Plaats geen Logic App callback/SAS URL of Foundry key in `VITE_*` variabelen.
