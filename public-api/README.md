# Kitchen Master API

## TODOs

- client portal setup and basic pages
- [OPTIONAL] give open ai recipe to tag it and clasify it by tags
- [OPTIONAL] put only favourites recipes in context
- backoffice endpoints for admin users ( swagger for ui )
- calculator for different stuff -> ( FE ?)
- test the scheduler tasks at least ones
- remove all TODOs
- [OPTIONAL] dalle 3 for images instead

```
//
curl https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "dall-e-3",
    "prompt": "a white siamese cat",
    "n": 1,
    "size": "1024x1024"
  }'
```
