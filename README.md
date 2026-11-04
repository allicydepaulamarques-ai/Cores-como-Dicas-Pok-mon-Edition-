# Cores como Dicas (Pokémon Edition)

Jogo web interativo de adivinhação de cor oficial do Pokémon, pensado para funcionar em celulares e publicar facilmente no GitHub Pages.

## Como executar localmente

1. Abra a pasta do projeto.
2. Inicie um servidor local em qualquer terminal:

```bash
python -m http.server 8000
```

3. Acesse:

```text
http://localhost:8000
```

## Como publicar no GitHub Pages

1. Faça upload do projeto para um repositório no GitHub.
2. Ative GitHub Pages em `Settings > Pages`.
3. Use a branch principal e a pasta raiz (`/`).
4. O site ficará disponível em uma URL pública do GitHub Pages.

## Observações

- O jogo usa a PokéAPI oficial para buscar o Pokémon e a cor oficial da espécie.
- Em caso de falha de rede, a aplicação pode tentar outra rodada ou mostrar mensagem de erro.
