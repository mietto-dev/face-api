# Microserviço para Cálculo de frete

## Instalação

- Clonar o repositório
- Instalar docker e docker-compose
- Rodar `sudo ./deploy/docker-init.sh` para configurar o ambiente docker
- Rodar `sudo docker-compose up` para subir a API na porta 8081 e mongodb na 27001
- Rota teste da API http://localhost:8081/test

## Arquitetura

![Diagrama](docs/domain-model.jpg)

Segregação de responsabilidade baseado em modelos do tipo ONION / CLEAN / SOLID (quase). 

No núcleo da aplicação está o Domain, responsável por implementar as regras de negócio e operações de fato, sem nenhuma dependência da camada superior.

Acima temos a camada Model responsável por modelar e persistir as entidade de dados, passando ao Domain as reais informações necessárias para executar as regras de negócio.

A camada de Serviços define as operações do sistema e executa toda a lógica não relacionada ao core business.

Finalmente a camada de Rotas define os pontos de entrada e saída, bem como o formato dos dados que entram e saem da aplicação.