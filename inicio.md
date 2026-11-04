Quero que desenvolvas o código completo de um jogo web interativo único ), pronto para ser publicado no GitHub Pages e 100% otimizado para celulares.

O nome do jogo é: "Cores como Dicas (Pokémon Edition)".

Aqui estão os requisitos técnicos e de mecânica obrigatórios:

1. **API Pública (PokéAPI) & Cores Exatas:**
   - Utilizar a PokéAPI oficial (https://pokeapi.co/api/v2/pokemon/{id}) e o endpoint de espécies (https://pokeapi.co/api/v2/pokemon-species/{id}) para buscar os dados de cada Pokémon.
   - **Cor Exata:** A cor principal do Pokémon NÃO deve ser baseada apenas no seu tipo elemental geral. Deve utilizar a cor exata e oficial cadastrada na espécie do Pokémon pela PokéAPI (ex: Pikachu = Amarelo Elétrico #F7D02C, Gengar = Roxo Escuro #754283, Jigglypuff = Rosa #FFB7C5, Charizard = Laranja #F08030).

2. **como funciona ("Cores como Dicas"):**
   - **O desafio:** O ecrã mostra o **nome do Pokémon** e a respetiva imagem inicial com um efeito de silhueta totalmente escura (CSS filter `brightness(0)`).
   - **As 8 Opções de Cores:** O jogador deve adivinhar a cor exata do Pokémon clicando numa das **8 caixas de cores** exibidas numa grelha (Grid).
   - **Geração das Caixas:** 
     - 1 caixa deve conter a **cor exata oficial** daquele Pokémon.
     - As outras 7 caixas devem ser preenchidas com outras cores Hex reais e distintas extraídas da paleta de Pokémon para criar um desafio justo e preciso.
   - **Revelação:** Ao clicar na cor correta, a silhueta é removida, revelando a arte do Pokémon com todas as suas cores oficiais em alta definição, contabilizando a sequência de acertos (Streak).

3. **Interface e Design (UI/UX):**
   - Estilo futurista e limpo no formato de Pokédex moderna.
   - Layout responsivo (Mobile-First) otimizado para ecrãs de telemóveis.
   - Sistema de vidas (3 tentativas), pontuação e botão para a "Próxima Rodada".
