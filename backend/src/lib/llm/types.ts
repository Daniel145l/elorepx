export interface LlmClient {
  gerarTexto(prompt: string): Promise<string>
}