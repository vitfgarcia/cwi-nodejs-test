# CWI NODE.JS TEST

## Pré Requisitos
- Docker
- Node.js

## Passos para realizar a integração

1. Executar o comando para subir o serviços de fila rabbitmq.

    ```
    docker-compose up -d
    ```

1. Executar para executar o script de integração
    ```
    yarn start
    ```
    ou

    ```
    npm start
    ```
1. O arquivo users.json será criado na raiz do projeto