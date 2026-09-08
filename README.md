# Savvy

Aplicativo Expo/React Native para salvar links, imagens e notas, organizar por categorias e acompanhar o que já foi lido. Os dados ficam no dispositivo, em AsyncStorage.

## Ambiente

- Node.js 24 LTS (24.11.0 ou superior na linha 24), indicado em `.nvmrc` e `package.json`.
- Yarn Classic 1.22.22; use o `yarn.lock` versionado.
- Android: Android SDK e emulador; Expo Go compatível com SDK 57.

## Executar

```sh
yarn install --frozen-lockfile
yarn android
```

Use `yarn ios` em um Mac com simulador configurado ou `yarn web` para a versão web. `yarn start` inicia somente o Metro.

## Validar

```sh
yarn typecheck
yarn test:ci
npx expo install --check
npx expo-doctor@latest
npx expo export --platform all --output-dir .expo/upgrade-export
```

Os testes cobrem o formato de dados salvo antes da migração, o ciclo de criação/edição/exclusão de notas, a limpeza restrita as chaves do Savvy e os tipos de conteúdo.

## Dependências e atualizações

A base foi atualizada em 08/09/2026 para Expo SDK 57, React Native 0.86.3, React 19.2.3, Reanimated 4.5.1, Worklets 0.10.1 e Zustand 5. O projeto usa a Nova Arquitetura, obrigatória nesta versão do React Native.

Expo, React Native e várias bibliotecas não oferecem uma linha chamada LTS. Usamos a versão estável suportada do Expo e sua matriz de compatibilidade. Por isso React, AsyncStorage, WebView, Reanimated e outras bibliotecas nativas podem ficar abaixo do `latest` do npm. Babel 7, Jest 29 e TypeScript 6 seguem o conjunto suportado pelo SDK 57; atualizar seus majors isoladamente pode quebrar a compilação ou o preset de testes.

As bibliotecas independentes do SDK foram atualizadas para versões estáveis. O `yarn.lock` fixa a resolução instalada. Nao há versões beta/canary declaradas diretamente.

O preset Babel do Expo configura Worklets automaticamente. A tela de abertura usa o plugin `expo-splash-screen`. As chaves `@savvy_links`, `@savvy_categories` e `@savvy_theme` foram preservadas.

Ao atualizar novamente, consulte o [guia oficial do Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) e as [notas do SDK 57](https://expo.dev/changelog/sdk-57), execute as validações e teste no dispositivo. A exportação de JavaScript para iOS não substitui um build nativo com Xcode ou EAS Build.

Se o Metro iniciado com `--localhost` responder apenas em IPv6 no Windows, execute `$env:NODE_OPTIONS = "--dns-result-order=ipv4first"` no PowerShell antes de iniciar o servidor. O emulador precisa conseguir acessar o Metro por IPv4.
