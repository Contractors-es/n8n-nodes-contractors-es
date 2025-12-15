# @contractors-es/n8n-nodes-contractors-es

![n8n logo](n8n.png)

n8n node and credentials implementation of [**Contractors.es**](https://contractors.es/) [**OpenAPI spec**](https://api.contractors.es/)
using [**devlikeapro/n8n-openapi-node**](https://github.com/devlikeapro/n8n-openapi-node)

# Installation
Install [the community node package in your n8n instance](https://docs.n8n.io/integrations/community-nodes/installation/gui-install/) - go to settings, community nodes and add:
```
@contractors-es/n8n-nodes-contractors-es
```

# Usage
1. Install the community package to your n8n instance.
2. Add **Contractors.es API** **credentials** in **n8n**.
3. Create a new workflow with the **Contractors.es** node.

# Development

## NodeJS
Make sure you're using Node.js >= 20 (we're using [nvm](https://github.com/nvm-sh/nvm)):

## Install n8n 
```bash
npm install n8n -g
```

## Start n8n
```bash
n8n --version
n8n start
```
Open [http://localhost:5678](http://localhost:5678) in your browser and configure it

## Build and link the project
```bash
npm install
npm run test
npm run build
npm link
```

## Add node to n8n
```bash
cd ~/.n8n
mkdir -p custom
cd custom
npm init # press Enter for all questions
npm link @contractors-es/n8n-nodes-contractors-es
```

## Start n8n again
```bash
n8n start
```
