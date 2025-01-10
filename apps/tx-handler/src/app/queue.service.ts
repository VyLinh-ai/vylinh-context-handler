// src/services/sequential-queue.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueService<T> {
  private queue: T[] = [];
  private isProcessing = false;

  constructor(private readonly processTask: (task: T) => Promise<void>) {}

  // Enqueue a new task and start processing if not already in progress
  async enqueue(task: T) {
    this.queue.push(task);
    this.processQueue();
  }

  // Process tasks sequentially from the queue
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const task = this.queue.shift();

    try {
      await this.processTask(task); // Process the current task
      console.log(`Task processed successfully:`, task);
    } catch (error) {
      console.error(`Task processing failed:`, error.message);
    }

    this.isProcessing = false;

    // Recursively process the next task
    this.processQueue();
  }
}
