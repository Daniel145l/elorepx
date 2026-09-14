export interface llmClient {
  gerarTexto(prompt: string): Promise<string>
}