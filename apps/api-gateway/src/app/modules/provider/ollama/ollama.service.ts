import ollama from 'ollama';
import { ChatContent } from '../../prompt/prompt.dto';

export class OllamaService {
  async chat(model: string, content: ChatContent, histories: ChatContent[]) {
    const response = await ollama.chat({
      model,
      messages: [...histories, content],
    });
    return response
  }
}
