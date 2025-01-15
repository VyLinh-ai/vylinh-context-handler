import { Injectable, Logger, Scope } from '@nestjs/common';
import { ProviderInstance } from './provider-instance.dto';
import { v4 as uuidv4 } from 'uuid';
import { ProviderType } from '../hub/hub.dto';

@Injectable({ scope: Scope.DEFAULT })
export class ProviderService {
  private logger = new Logger(ProviderService.name);
  id = uuidv4();

  // Maps model type to an array of provider IDs
  modelProviderMap: Map<string, Set<string>> = new Map();

  // Maps provider ID to a Provider instance
  providerMap: Map<string, ProviderInstance> = new Map();

  // Registers a provider
  registerProvider(provider: ProviderInstance) {
    this.logger.log(`Registering providerId: ${provider.id}`);

    let models: string[];
    switch (provider.providerInfo.providerType) {
      case ProviderType.Ollama:
        models = provider.providerInfo.ollamaProviderDetail.models;
        break;
      default:
        throw new Error(
          `unsupported provider ${provider.providerInfo.providerType}`,
        );
    }

    // Add to provider map list
    this.providerMap.set(provider.id, provider);

    // Add provider to map of model -> providers
    for (let index = 0; index < models.length; index++) {
      const model = models[index];
      let providerIds = this.modelProviderMap.get(model);
      if (!providerIds) {
        providerIds = new Set();
      }
      providerIds.add(provider.id);
      this.modelProviderMap.set(model, providerIds);
    }

    console.log(this.modelProviderMap);
  }

  // Deregisters a provider by providerId
  deregisterProvider(providerId: string) {
    this.logger.log(`Deregistering providerId: ${providerId}`);

    // Get the provider from the provider map
    const provider = this.providerMap.get(providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    let models: string[];
    switch (provider.providerInfo.providerType) {
      case ProviderType.Ollama:
        models = provider.providerInfo.ollamaProviderDetail.models;
        break;
      default:
        throw new Error(
          `unsupported provider ${provider.providerInfo.providerType}`,
        );
    }

    // Remove the provider from provider map
    this.providerMap.delete(providerId);

    // Unset all provider ids from models
    for (let index = 0; index < models.length; index++) {
      const model = models[index];
      const providerIds = this.modelProviderMap.get(model);
      if (providerIds) {
        providerIds.delete(provider.id);
        if (providerIds.values.length > 0) {
          this.modelProviderMap.set(model, providerIds);
        } else {
          this.modelProviderMap.delete(model);
        }
      }
    }
  }

  findProvidersByModel(model: string): ProviderInstance[] {
    console.log(this.id);
    console.log(this.modelProviderMap);

    // Get the list of provider IDs for the model
    const providerIds = this.modelProviderMap.get(model);

    if (!providerIds || providerIds.size == 0) {
      return []; // No providers found for this model
    }

    const insts: ProviderInstance[] = [];
    for (const providerId of providerIds.values()) {
      insts.push(this.providerMap.get(providerId));
    }
    return insts;
  }

  getActiveModels(): string[] {
    // Iterate over the modelProviderMap and return keys (model names) that have registered providers
    const activeModels = Array.from(this.modelProviderMap.keys());
    return activeModels;
  }
}
