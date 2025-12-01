#!/bin/bash

source .env

echo "Testing Minimax API with official format..."
echo "Endpoint: $MINIMAX_API_ENDPOINT"
echo "API Key (first 50 chars): ${MINIMAX_API_KEY:0:50}..."
echo ""

curl --request POST \
  --url "$MINIMAX_API_ENDPOINT" \
  --header "Authorization: Bearer $MINIMAX_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "model": "MiniMax-Text-01",
    "messages": [
      {
        "role": "user",
        "content": "Hello! Please respond with just the word SUCCESS"
      }
    ],
    "max_tokens": 50,
    "temperature": 0.7
  }'

echo ""
