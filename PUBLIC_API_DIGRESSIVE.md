# API Publique - Ventes Dégressives

## 1. Impact sur les autres types de vente

**Aucun changement breaking.** Le champ `stepIntervalSeconds` est ajouté mais vaut `null` pour tous les types non-dégressifs.

| Champ ajouté          | Ventes classiques | Ventes dégressives |
| --------------------- | ----------------- | ------------------ |
| `stepIntervalSeconds` | `null`            | `60` (secondes)    |

## 2. API REST - GET `/api/auctions/:id`

### Réponse JSON (ventes dégressives)

```json
{
  "id": "uuid",
  "type": "digressive",
  "status": "started|ended|pending",
  "startDate": 1702828800000,
  "endDate": 1702832400000,
  "startingPrice": 500000,
  "step": 5000,
  "stepIntervalSeconds": 60,
  "bids": [],
  "isPrivate": false,
  "currency": { "id": 1, "name": "Euro", "symbol": "€", "isBefore": false, "code": "EUR" },
  "agentEmail": "agent@example.com",
  "agentPhone": "+33600000000",
  "registration": { "isUserAllowed": true, "isRegistrationAccepted": true, "isParticipant": true }
}
```

### Calcul du prix courant (frontend)

```javascript
const elapsedSeconds = (Date.now() - startDate) / 1000;
const stepsPassed = Math.floor(elapsedSeconds / stepIntervalSeconds);
const currentPrice = Math.max(startingPrice - (stepsPassed * step), reservePrice);
```

> ⚠️ **`reservePrice` n'est JAMAIS exposé par l'API.** Le frontend calcule le prix minimum affiché, mais le vrai prix de réserve reste côté serveur.

## 3. WebSocket - Channel `auction:{id}`

### Événements

| Event     | Payload                      | Description                               |
| --------- | ---------------------------- | ----------------------------------------- |
| `started` | `{ auction_id }`             | La vente a démarré                        |
| `outbid`  | `{ auction_id, bid }`        | Nouvelle enchère (arrête la dégressivité) |
| `ended`   | `{ auction_id, finalPrice }` | La vente est terminée                     |

### Payload `bid` (event `outbid`)

```json
{
  "id": "uuid",
  "amount": 450000,
  "createdAt": 1702830000000,
  "newEndDate": 1702832400000,
  "userAnonymousId": "ABC123",
  "participantId": "uuid"
}
```

### Payload `ended`

```json
{
  "auction_id": "uuid",
  "finalPrice": 450000
}
```

| Situation                 | `finalPrice`                             |
| ------------------------- | ---------------------------------------- |
| Vente avec gagnant        | Montant de l'enchère gagnante            |
| Dégressif sans gagnant    | Prix de réserve (pour affichage "bluff") |
| Autres types sans gagnant | `null`                                   |

## 4. Flow complet d'une vente dégressive

```
1. GET /api/auctions/:id → récupère données initiales
2. Subscribe WebSocket auction:{id}
3. Frontend calcule prix courant toutes les secondes
4. Si event "outbid" → affiche enchère, prix figé
5. Si event "ended" → affiche finalPrice comme "Prix de vente"
```
